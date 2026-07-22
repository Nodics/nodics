/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/delivery/DefaultCmsStorefrontContextProviderService
 * @description Validates an opaque Storefront handle and establishes the CMS-owned delivery request from its audience-bound projection.
 * @layer service
 * @owner cms
 * @override Projects may replace transport while preserving Storefront introspection, CMS audience binding, and CMS delivery authority.
 */
module.exports = {
    /** Initializes Storefront context validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context validation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective CMS Storefront transport policy. */
    policy: function () { return (CONFIG.get('cms') || {}).storefrontContext || {}; },
    /** Reads the opaque handle without copying it into application state. */
    handle: function (request) {
        let name = String(this.policy().headerName || 'x-nodics-storefront-context').toLowerCase();
        let http = request && request.httpRequest, headers = http && http.headers || request && request.headers || {};
        return http && typeof http.get === 'function' ? http.get(name) : headers[name];
    },
    /** Reads optional Storefront client-binding proof for forwarding only to Storefront. */
    binding: function (request) {
        let name = String(this.policy().bindingHeaderName || 'x-nodics-storefront-binding').toLowerCase();
        let http = request && request.httpRequest, headers = http && http.headers || request && request.headers || {};
        return http && typeof http.get === 'function' ? http.get(name) : headers[name];
    },
    /** Introspects through a co-hosted Storefront service with a module identity. */
    resolveLocal: function (handle, binding) {
        return SERVICE.DefaultStorefrontContextAccessService.introspect({
            authData: { tokenType: 'service', principalId: 'cms-storefront-context' },
            body: Object.assign({ handle: handle, audience: 'cms' }, binding === undefined ? {} : { binding: binding })
        });
    },
    /** Introspects through separately deployed Storefront using existing Nodics module transport. */
    resolveRemote: async function (handle, binding) {
        let policy = this.policy(), tenant = policy.bootstrapTenant || 'default';
        let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(tenant);
        if (!token) return { active: false };
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: policy.moduleName || 'storefront',
            apiVersion: policy.apiVersion || 'v0', apiName: policy.apiName || '/context/introspect', methodName: 'POST',
            requestBody: Object.assign({ handle: handle, audience: 'cms' }, binding === undefined ? {} : { binding: binding }), header: { Authorization: 'Bearer ' + token },
            timeoutMs: Number(policy.requestTimeoutMs || 1000), maxAttempts: Number(policy.maximumAttempts || 1),
            maxResponseBytes: Number(policy.maximumResponseBytes || 32768), followRedirects: false });
        let response = await SERVICE.DefaultModuleService.fetch(descriptor);
        return response && ((response.data && response.data.data) || response.data) || { active: false };
    },
    /** Applies trusted CMS Site, locale, channel, tenant, and enterprise scope or fails closed. */
    apply: async function (request) {
        let handle = this.handle(request), binding = this.binding(request), policy = this.policy(), result;
        if (typeof handle !== 'string' || handle.length < 32) throw this.error();
        try {
            result = policy.preferLocal !== false && SERVICE.DefaultStorefrontContextAccessService
                ? await this.resolveLocal(handle, binding) : await this.resolveRemote(handle, binding);
        } catch (error) { result = { active: false }; }
        if (!result || result.active !== true || result.audience !== 'cms' || !result.context ||
            !result.context.site || !result.tenantCode || !result.enterpriseCode) throw this.error();
        request.tenant = result.tenantCode;
        request.authData = { tokenType: 'storefront_context', principalId: 'storefront:' + result.storefrontCode,
            tenant: result.tenantCode, entCode: result.enterpriseCode, enterpriseCode: result.enterpriseCode };
        request.delivery = Object.assign({}, request.delivery || {}, {
            site: result.context.site, locale: result.context.locale, channel: result.context.channel
        });
        return request;
    },
    /** Creates the stable CMS fail-closed context error. */
    error: function () {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError
            ? new CLASSES.NodicsError('ERR_CMS_00082', 'Active Storefront context is required')
            : new Error('Active Storefront context is required');
        error.code = error.code || 'ERR_CMS_00082';
        return error;
    }
};
