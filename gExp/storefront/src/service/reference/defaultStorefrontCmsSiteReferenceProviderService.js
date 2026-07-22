/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/reference/DefaultStorefrontCmsSiteReferenceProviderService
 * @description Validates CMS-owned Site references through the configured local or module transport.
 * @layer service
 * @owner storefront
 * @override Projects may replace the transport while CMS remains the Site authority.
 */
module.exports = {
    /** Initializes CMS Site reference resolution. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes CMS Site reference provider initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the configured CMS Site reference transport policy. */
    policy: function () {
        return (CONFIG.get('storefront') || {}).cmsSiteReference || {};
    },
    /** Resolves one active CMS Site through the co-hosted CMS service. */
    resolveLocal: async function (request, code) {
        let response = await SERVICE.DefaultCmsSiteService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: { code: code, active: true },
                searchOptions: { limit: 2 }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'CMS Site reference is unavailable'
            );
        return { cmsSiteCode: items[0].code, name: items[0].name, catalogCode: items[0].catalog };
    },
    /** Resolves one active CMS Site through authenticated module communication. */
    resolveRemote: async function (request, code) {
        let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(request.tenant);
        if (!token)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Internal token is unavailable for CMS lookup'
            );
        let policy = this.policy(),
            descriptor = SERVICE.DefaultModuleService.buildRequest({
                moduleName: policy.moduleName || 'cms',
                apiVersion: policy.apiVersion || 'v0',
                apiName: policy.apiName || '/references/sites/resolve',
                method: 'POST',
                body: { cmsSiteCode: code },
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
                'CMS Site reference is unavailable'
            );
        return data.site || data;
    },
    /** Resolves one CMS-owned Site using the configured topology. */
    resolve: function (request, code) {
        code = SERVICE.DefaultStorefrontEnterpriseScopeService.validateBusinessCode(code, 'CMS Site');
        return this.policy().preferLocal !== false && SERVICE.DefaultCmsSiteService
            ? this.resolveLocal(request, code)
            : this.resolveRemote(request, code);
    }
};
