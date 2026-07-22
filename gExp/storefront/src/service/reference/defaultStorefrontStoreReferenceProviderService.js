/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/reference/DefaultStorefrontStoreReferenceProviderService
 * @description Validates Store-owned references through the configured local or module transport.
 * @layer service
 * @owner storefront
 * @override Projects may replace the transport while Store remains the Store authority.
 */
module.exports = {
    /** Initializes Store reference resolution. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes Store reference provider initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the configured Store reference transport policy. */
    policy: function () {
        return (CONFIG.get('storefront') || {}).storeReference || {};
    },
    /** Resolves one active Store through the co-hosted Store service. */
    resolveLocal: async function (request, code) {
        let response = await SERVICE.DefaultStoreService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: {
                    enterpriseCode: SERVICE.DefaultStorefrontEnterpriseScopeService.resolveEnterpriseCode(request),
                    storeCode: code,
                    status: 'ACTIVE'
                },
                searchOptions: { limit: 2 }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Store reference is unavailable'
            );
        let item = items[0];
        return {
            storeCode: item.storeCode,
            name: item.name,
            type: item.type,
            countryCode: item.countryCode,
            timezone: item.timezone,
            channels: item.channels || [],
            capabilities: item.capabilities || []
        };
    },
    /** Resolves one active Store through authenticated module communication. */
    resolveRemote: async function (request, code) {
        let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(request.tenant);
        if (!token)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Internal token is unavailable for Store lookup'
            );
        let policy = this.policy(),
            descriptor = SERVICE.DefaultModuleService.buildRequest({
                moduleName: policy.moduleName || 'store',
                apiVersion: policy.apiVersion || 'v0',
                apiName: policy.apiName || '/references/stores/resolve',
                method: 'POST',
                body: { storeCode: code },
                header: {
                    Authorization: 'Bearer ' + token,
                    'x-enterprise-code': SERVICE.DefaultStorefrontEnterpriseScopeService.resolveEnterpriseCode(request)
                },
                requestTimeoutMs: Number(policy.requestTimeoutMs || 2000),
                maximumAttempts: Number(policy.maximumAttempts || 2)
            }),
            response = await SERVICE.DefaultModuleService.fetch(descriptor),
            data = response && ((response.data && response.data.data) || response.data);
        if (!data || data.found === false)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Store reference is unavailable'
            );
        return data.store || data;
    },
    /** Resolves one Store-owned record using the configured topology. */
    resolve: function (request, code) {
        code = SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(code, 'Store');
        return this.policy().preferLocal !== false && SERVICE.DefaultStoreService
            ? this.resolveLocal(request, code)
            : this.resolveRemote(request, code);
    }
};
