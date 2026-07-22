/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/availability/DefaultInventoryStorefrontContextProviderService
 * @description Validates opaque Storefront context and replaces caller-controlled Inventory sourcing scope before availability evaluation.
 * @layer service
 * @owner inventory
 * @override Projects may replace transport while preserving Storefront introspection, Inventory audience binding, exact values, and fail-closed scope derivation.
 */
module.exports = {
    /** Initializes Storefront context validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective Inventory Storefront transport policy. */
    policy: function () { return (CONFIG.get('inventory') || {}).storefrontContext || {}; },
    /** Reads the opaque handle without logging or persisting it. */
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
    /** Introspects a co-hosted Storefront authority with an Inventory module identity. */
    resolveLocal: function (handle, binding) {
        return SERVICE.DefaultStorefrontContextAccessService.introspect({
            authData: { tokenType: 'service', principalId: 'inventory-storefront-context' },
            body: Object.assign({ handle: handle, audience: 'inventory' }, binding === undefined ? {} : { binding: binding })
        });
    },
    /** Introspects separately deployed Storefront through existing Nodics module transport. */
    resolveRemote: async function (handle, binding) {
        let policy = this.policy(), tenant = policy.bootstrapTenant || 'default';
        let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(tenant);
        if (!token) return { active: false };
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: policy.moduleName || 'storefront',
            apiVersion: policy.apiVersion || 'v0', apiName: policy.apiName || '/context/introspect', methodName: 'POST',
            requestBody: Object.assign({ handle: handle, audience: 'inventory' }, binding === undefined ? {} : { binding: binding }), header: { Authorization: 'Bearer ' + token },
            timeoutMs: Number(policy.requestTimeoutMs || 1000), maxAttempts: Number(policy.maximumAttempts || 1),
            maxResponseBytes: Number(policy.maximumResponseBytes || 32768), followRedirects: false });
        let response = await SERVICE.DefaultModuleService.fetch(descriptor);
        return response && ((response.data && response.data.data) || response.data) || { active: false };
    },
    /** Applies trusted Inventory sourcing scope while retaining only caller-owned item and evaluation inputs. */
    apply: async function (request) {
        let handle = this.handle(request), binding = this.binding(request), policy = this.policy(), result;
        if (typeof handle !== 'string' || handle.length < 32) throw this.error();
        try {
            result = policy.preferLocal !== false && SERVICE.DefaultStorefrontContextAccessService
                ? await this.resolveLocal(handle, binding) : await this.resolveRemote(handle, binding);
        } catch (error) { result = { active: false }; }
        if (!result || result.active !== true || result.audience !== 'inventory' || !result.context ||
            !result.context.storeCode || !result.context.countryCode || !result.context.channelCode ||
            !result.tenantCode || !result.enterpriseCode) throw this.error();
        let input = request && (request.body || request.model) || {};
        request.tenant = result.tenantCode;
        request.authData = { tokenType: 'storefront_context', principalId: 'storefront:' + result.storefrontCode,
            tenant: result.tenantCode, entCode: result.enterpriseCode, enterpriseCode: result.enterpriseCode };
        request.body = { context: { storeCode: result.context.storeCode, countryCode: result.context.countryCode,
            channelCode: result.context.channelCode }, item: input.item, at: input.at };
        if (request.body.at === undefined) delete request.body.at;
        request._storefrontContextValidated = true;
        return request;
    },
    /** Creates the stable fail-closed Storefront context error. */
    error: function () {
        return SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00052', 'Active Storefront context is required');
    }
};
