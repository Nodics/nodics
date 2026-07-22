/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/service/delivery/DefaultProductStorefrontContextProviderService
 * @description Validates opaque Storefront context through the Storefront-owned introspection contract and applies only Product routing scope.
 * @layer service
 * @owner product
 * @override Projects may replace transport while preserving Storefront introspection, audience binding, and Product-owned delivery validation.
 */
module.exports = {
    /** Initializes Storefront context validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective Product Storefront transport policy. */
    policy: function () { return (CONFIG.get('product') || {}).storefrontContext || {}; },
    /** Reads the opaque handle without logging or persisting it. */
    handle: function (request) {
        let policy = this.policy(), name = String(policy.headerName || 'x-nodics-storefront-context').toLowerCase();
        let http = request && request.httpRequest, headers = http && http.headers || request && request.headers || {};
        return typeof http?.get === 'function' ? http.get(name) : headers[name];
    },
    /** Calls a co-hosted Storefront introspector using a synthetic module identity. */
    resolveLocal: function (handle) {
        return SERVICE.DefaultStorefrontContextAccessService.introspect({
            authData: { tokenType: 'service', principalId: 'product-storefront-context' },
            body: { handle: handle, audience: 'product' }
        });
    },
    /** Calls a separately deployed Storefront module with the existing service-token transport. */
    resolveRemote: async function (handle) {
        let policy = this.policy(), tenant = policy.bootstrapTenant || 'default';
        let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(tenant);
        if (!token) return { active: false };
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: policy.moduleName || 'storefront',
            apiVersion: policy.apiVersion || 'v0', apiName: policy.apiName || '/context/introspect', methodName: 'POST',
            requestBody: { handle: handle, audience: 'product' }, header: { Authorization: 'Bearer ' + token },
            timeoutMs: Number(policy.requestTimeoutMs || 1000), maxAttempts: Number(policy.maximumAttempts || 1),
            maxResponseBytes: Number(policy.maximumResponseBytes || 32768), followRedirects: false });
        let response = await SERVICE.DefaultModuleService.fetch(descriptor);
        return response && ((response.data && response.data.data) || response.data) || { active: false };
    },
    /** Establishes trusted Product request scope or fails closed on missing, inactive, expired, or unavailable context. */
    apply: async function (request) {
        let handle = this.handle(request), policy = this.policy(), result;
        if (typeof handle !== 'string' || handle.length < 32) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00067', 'Active Storefront context is required');
        try {
            result = policy.preferLocal !== false && SERVICE.DefaultStorefrontContextAccessService
                ? await this.resolveLocal(handle) : await this.resolveRemote(handle);
        } catch (error) { result = { active: false }; }
        if (!result || result.active !== true || result.audience !== 'product' || !result.context || !result.tenantCode || !result.enterpriseCode)
            throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00067', 'Active Storefront context is required');
        request.tenant = result.tenantCode;
        request.authData = { tokenType: 'storefront_context', principalId: 'storefront:' + result.storefrontCode,
            tenant: result.tenantCode, entCode: result.enterpriseCode, enterpriseCode: result.enterpriseCode };
        request.query = Object.assign({}, request.httpRequest && request.httpRequest.query || request.query || {}, {
            catalogCode: result.context.catalogCode, localeCode: result.context.locale
        });
        return request;
    }
};
