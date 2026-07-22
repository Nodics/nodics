/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module pricing/service/resolution/DefaultPricingStorefrontContextProviderService
 * @description Validates opaque Storefront context and replaces caller-controlled Pricing scope before authoritative Online resolution.
 * @layer service
 * @owner pricing
 * @override Projects may replace transport while preserving Storefront introspection, Pricing audience binding, exact values, and fail-closed scope derivation.
 */
module.exports = {
    /** Initializes Storefront context validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective Pricing Storefront transport policy. */
    policy: function () { return (CONFIG.get('pricing') || {}).storefrontContext || {}; },
    /** Reads the opaque handle without copying it into Pricing state. */
    handle: function (request) {
        let name = String(this.policy().headerName || 'x-nodics-storefront-context').toLowerCase();
        let http = request && request.httpRequest, headers = http && http.headers || request && request.headers || {};
        return http && typeof http.get === 'function' ? http.get(name) : headers[name];
    },
    /** Reads optional Storefront client-binding proof for Storefront introspection. */
    binding: function (request) {
        let name = String(this.policy().bindingHeaderName || 'x-nodics-storefront-binding').toLowerCase();
        let http = request && request.httpRequest, headers = http && http.headers || request && request.headers || {};
        return http && typeof http.get === 'function' ? http.get(name) : headers[name];
    },
    /** Introspects a co-hosted Storefront authority with a synthetic Pricing module identity. */
    resolveLocal: function (handle, binding) {
        return SERVICE.DefaultStorefrontContextAccessService.introspect({
            authData: { tokenType: 'service', principalId: 'pricing-storefront-context' },
            body: Object.assign({ handle: handle, audience: 'pricing' }, binding === undefined ? {} : { binding: binding })
        });
    },
    /** Introspects a separately deployed Storefront through existing Nodics module transport. */
    resolveRemote: async function (handle, binding) {
        let policy = this.policy(), tenant = policy.bootstrapTenant || 'default';
        let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(tenant);
        if (!token) return { active: false };
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: policy.moduleName || 'storefront',
            apiVersion: policy.apiVersion || 'v0', apiName: policy.apiName || '/context/introspect', methodName: 'POST',
            requestBody: Object.assign({ handle: handle, audience: 'pricing' }, binding === undefined ? {} : { binding: binding }), header: { Authorization: 'Bearer ' + token },
            timeoutMs: Number(policy.requestTimeoutMs || 1000), maxAttempts: Number(policy.maximumAttempts || 1),
            maxResponseBytes: Number(policy.maximumResponseBytes || 32768), followRedirects: false });
        let response = await SERVICE.DefaultModuleService.fetch(descriptor);
        return response && ((response.data && response.data.data) || response.data) || { active: false };
    },
    /** Applies trusted Pricing scope while retaining only business inputs owned by the caller. */
    apply: async function (request) {
        let handle = this.handle(request), binding = this.binding(request), policy = this.policy(), result;
        if (typeof handle !== 'string' || handle.length < 32) throw this.error();
        try {
            result = policy.preferLocal !== false && SERVICE.DefaultStorefrontContextAccessService
                ? await this.resolveLocal(handle, binding) : await this.resolveRemote(handle, binding);
        } catch (error) { result = { active: false }; }
        if (!result || result.active !== true || result.audience !== 'pricing' || !result.context ||
            !result.context.siteCode || !result.context.storeCode || !result.context.currencyCode ||
            !result.tenantCode || !result.enterpriseCode) throw this.error();
        let input = request && (request.body || request.model) || {};
        request.tenant = result.tenantCode;
        request.authData = { tokenType: 'storefront_context', principalId: 'storefront:' + result.storefrontCode,
            tenant: result.tenantCode, entCode: result.enterpriseCode, enterpriseCode: result.enterpriseCode };
        request.body = { item: input.item, quantity: input.quantity, unitCode: input.unitCode,
            currencyCode: result.context.currencyCode,
            context: { siteCode: result.context.siteCode, storeCode: result.context.storeCode,
                channelCode: result.context.channelCode }, at: input.at };
        if (request.body.at === undefined) delete request.body.at;
        return request;
    },
    /** Creates the stable fail-closed Storefront context error. */
    error: function () {
        return SERVICE.DefaultPricingEnterpriseScopeService.error('ERR_PRICE_00065', 'Active Storefront context is required');
    }
};
