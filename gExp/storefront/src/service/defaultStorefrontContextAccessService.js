/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const crypto = require('crypto');

/**
 * @module storefront/service/DefaultStorefrontContextAccessService
 * @description Issues opaque short-lived Storefront context handles and performs service-authenticated, audience-bound introspection through nCache.
 * @layer service
 * @owner storefront
 * @override Projects may replace storage or risk policy while preserving opacity, bounded lifetime, target binding, tenant isolation, and fail-closed introspection.
 */
module.exports = {
    /** Initializes Storefront context-access handling. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context-access initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective governed context-access policy. */
    policy: function () { return (CONFIG.get('storefront') || {}).contextAccess || {}; },
    /** Creates a stable cache key without retaining the bearer handle in storage diagnostics. */
    key: function (handle) {
        return String(this.policy().keyPrefix || 'storefrontContextAccess:') + crypto.createHash('sha256').update(handle).digest('hex');
    },
    /** Returns provider-neutral cache options for ephemeral access state. */
    options: function (handle) {
        let policy = this.policy(), tenant = ((CONFIG.get('storefront') || {}).contextResolution || {}).defaultTenant || 'default';
        return { tenant: tenant, authData: { tokenType: 'service', principalId: 'storefront-context-access', tenant: tenant },
            moduleName: policy.moduleName || 'storefront', channelName: policy.channelName || 'contextAccess',
            cacheLayer: 'contextAccess', resourceName: 'storefrontContextAccess', key: this.key(handle) };
    },
    /** Issues one opaque handle; cache unavailability fails closed because no client authority may be self-asserted. */
    issue: async function (resolved) {
        let policy = this.policy(), authority = resolved && resolved._authority, ttl = Number(policy.ttlSeconds || 120);
        if (policy.enabled === false || !SERVICE.DefaultCacheService || !authority || !authority.tenantCode || !authority.enterpriseCode)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00016', 'Storefront context access is unavailable');
        if (!Number.isInteger(ttl) || ttl < 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00016', 'Storefront context access lifetime is invalid');
        let handle = crypto.randomBytes(Math.max(24, Number(policy.tokenBytes || 32))).toString('base64url'), now = Date.now();
        let value = { active: true, issuedAt: now, expiresAt: now + ttl * 1000,
            tenantCode: authority.tenantCode, enterpriseCode: authority.enterpriseCode,
            storefrontCode: resolved.storefrontCode, audiences: (policy.audiences || []).slice(), context: resolved.downstream };
        await SERVICE.DefaultCacheService.put(Object.assign({}, this.options(handle), { value: value, ttl: ttl }));
        return { handle: handle, header: policy.headerName || 'x-nodics-storefront-context', expiresInSeconds: ttl };
    },
    /** Introspects one handle for an authenticated target module and returns only its audience projection. */
    introspect: async function (request) {
        let auth = request && request.authData || {}, input = request && request.body || {}, policy = this.policy();
        if (auth.tokenType !== 'service')
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00011', 'Module service identity is required');
        if (typeof input.handle !== 'string' || input.handle.length < 32 || input.handle.length > Number(policy.maximumHandleLength || 256))
            return { active: false };
        if (!(policy.audiences || []).includes(input.audience)) return { active: false };
        try {
            let value = await SERVICE.DefaultCacheService.get(this.options(input.handle));
            if (!value || value.active !== true || Number(value.expiresAt) <= Date.now() || !(value.audiences || []).includes(input.audience))
                return { active: false };
            return { active: true, tokenType: 'storefront_context', audience: input.audience,
                expiresAt: value.expiresAt, tenantCode: value.tenantCode, enterpriseCode: value.enterpriseCode,
                storefrontCode: value.storefrontCode, context: value.context && value.context[input.audience] };
        } catch (error) {
            return { active: false };
        }
    }
};
