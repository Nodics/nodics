/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const crypto = require('crypto');

/**
 * @module storefront/service/DefaultStorefrontContextCacheService
 * @description Caches public hostname resolution through the provider-neutral nCache contract while keeping Storefront persistence authoritative.
 * @layer service
 * @owner storefront
 * @override Projects may replace keying or cache policy while retaining bootstrap-tenant isolation, bounded TTL, and mutation invalidation.
 */
module.exports = {
    /** Initializes Storefront context caching. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context caching initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered context-cache policy. */
    policy: function () { return ((CONFIG.get('storefront') || {}).contextCache) || {}; },
    /** Returns the authoritative bootstrap tenant used by hostname mappings. */
    bootstrapTenant: function () {
        return (((CONFIG.get('storefront') || {}).contextResolution) || {}).defaultTenant || 'default';
    },
    /** Creates a bounded opaque key from the normalized hostname. */
    buildKey: function (hostname) {
        let policy = this.policy(), normalized = SERVICE.DefaultStorefrontEndpointFoundationService.normalizeHostname(hostname);
        let key = String(policy.keyPrefix || 'storefrontContext:') + crypto.createHash('sha256').update(normalized).digest('hex');
        if (key.length > Number(policy.maximumKeyLength || 320))
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00010', 'Storefront context cache key exceeds configured boundary');
        return key;
    },
    /** Builds provider-neutral nCache options partitioned by the bootstrap tenant. */
    options: function (key) {
        let policy = this.policy(), tenant = this.bootstrapTenant();
        return {
            tenant: tenant,
            authData: { tokenType: 'service', principalId: 'storefront-context-cache', tenant: tenant },
            moduleName: policy.moduleName || 'storefront',
            channelName: policy.channelName || 'context',
            key: key,
            cacheLayer: 'context',
            resourceName: 'storefrontContext'
        };
    },
    /** Resolves from cache or falls through to the authoritative Storefront resolver on misses and provider failures. */
    resolve: async function (request) {
        let policy = this.policy(), startedAt = Date.now(), observer = SERVICE.DefaultStorefrontObservabilityService;
        if (policy.enabled === false || !SERVICE.DefaultCacheService) {
            try {
                let value = await SERVICE.DefaultStorefrontContextService.resolve(request);
                if (observer) observer.recordResolution('authoritativeSuccess', startedAt);
                return value;
            } catch (error) {
                if (observer) observer.recordResolution('authoritativeFailure', startedAt, error);
                throw error;
            }
        }
        let hostname = SERVICE.DefaultStorefrontContextService.requestHostname(request), key = this.buildKey(hostname), options = this.options(key);
        try {
            let cached = await SERVICE.DefaultCacheService.get(options);
            if (cached && Number(cached.contractVersion) === Number(policy.contractVersion || 1) && cached.negative === true) {
                if (observer) {
                    observer.recordCacheOutcome('negativeHit');
                    observer.recordResolution('negativeHit', startedAt, { code: 'ERR_STOREFRONT_00009' });
                }
                throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00009', 'Active hostname mapping was not found');
            }
            if (cached && Number(cached.contractVersion) === Number(policy.contractVersion || 1) && cached.value) {
                if (observer) observer.recordResolution('cacheHit', startedAt);
                return cached.value;
            }
            if (observer) observer.recordCacheOutcome('contractMiss');
        } catch (error) {
            if (error && error.code === 'ERR_STOREFRONT_00009') throw error;
            if (observer) observer.recordCacheOutcome(error && error.code === 'ERR_CACHE_00001' ? 'cacheMiss' : 'cacheError', error);
        }
        try {
            let value = await SERVICE.DefaultStorefrontContextService.resolve(request), ttl = Number(policy.ttlSeconds || 60);
            if (Number.isFinite(ttl) && ttl > 0) {
                await SERVICE.DefaultCacheService.put(Object.assign({}, options, {
                    value: { contractVersion: Number(policy.contractVersion || 1), value: value },
                    ttl: ttl
                })).catch((error) => {
                    if (observer) observer.recordCacheOutcome('cacheWriteError', error);
                    return false;
                });
            }
            if (observer) observer.recordResolution('authoritativeSuccess', startedAt);
            return value;
        } catch (error) {
            if (error && error.code === 'ERR_STOREFRONT_00009' && policy.negativeCachingEnabled !== false) {
                let negativeTtl = Number(policy.negativeTtlSeconds || 5);
                if (Number.isFinite(negativeTtl) && negativeTtl > 0) {
                    await SERVICE.DefaultCacheService.put(Object.assign({}, options, {
                        value: { contractVersion: Number(policy.contractVersion || 1), negative: true },
                        ttl: negativeTtl
                    })).catch((cacheError) => {
                        if (observer) observer.recordCacheOutcome('cacheWriteError', cacheError);
                        return false;
                    });
                }
            }
            if (observer) observer.recordResolution('authoritativeFailure', startedAt, error);
            throw error;
        }
    },
    /** Invalidates all hostname contexts after Storefront or endpoint mutation and lets nCache propagate to peer nodes. */
    invalidate: function () {
        let policy = this.policy();
        if (policy.enabled === false || !SERVICE.DefaultCacheService) return Promise.resolve(true);
        let options = this.options(String(policy.keyPrefix || 'storefrontContext:'));
        delete options.key;
        options.prefix = policy.keyPrefix || 'storefrontContext:';
        options.internalCacheOperation = true;
        return SERVICE.DefaultCacheService.flushCache(options);
    }
};
