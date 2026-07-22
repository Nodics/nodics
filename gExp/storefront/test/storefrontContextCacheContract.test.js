/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontContextCacheContract
 * @description Validates provider-neutral hostname caching, safe fallback, tenant partitioning, invalidation, and layered customization.
 * @layer test
 * @owner storefront
 * @override Projects must retain authoritative fallback and mutation invalidation when replacing cache policy or keying.
 */
const assert = require('assert');
const fs = require('fs');
const properties = require('../config/properties');

global.CONFIG = { get: (name) => name === 'storefront' ? properties.storefront : undefined };
global.SERVICE = {};
let authorityCalls = 0, hit, puts = [], flushes = [], getMode = 'miss';
let resolutionOutcomes = [], cacheOutcomes = [];
SERVICE.DefaultStorefrontEndpointFoundationService = {
    normalizeHostname: (value) => String(value || '').trim().toLowerCase()
};
SERVICE.DefaultStorefrontEnterpriseScopeService = {
    error: (code, message) => Object.assign(new Error(message), { code: code })
};
SERVICE.DefaultStorefrontContextService = {
    requestHostname: (request) => request.hostname,
    resolve: async (request) => {
        authorityCalls += 1;
        return { hostname: request.hostname, storefrontCode: 'web', authorityCall: authorityCalls };
    }
};
SERVICE.DefaultCacheService = {
    get: async () => {
        if (getMode === 'failure') throw new Error('provider unavailable');
        if (!hit) throw Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' });
        return hit;
    },
    put: async (options) => { puts.push(options); hit = options.value; return true; },
    flushCache: async (options) => { flushes.push(options); hit = undefined; return true; }
};
SERVICE.DefaultStorefrontObservabilityService = {
    recordResolution: (outcome) => resolutionOutcomes.push(outcome),
    recordCacheOutcome: (outcome) => cacheOutcomes.push(outcome)
};
const cache = require('../src/service/defaultStorefrontContextCacheService');

(async function () {
    let first = await cache.resolve({ hostname: 'electronics.nodics.com' });
    assert.strictEqual(first.authorityCall, 1);
    assert.strictEqual(puts.length, 1);
    assert(cacheOutcomes.includes('cacheMiss'));
    assert(resolutionOutcomes.includes('authoritativeSuccess'));
    assert.strictEqual(puts[0].tenant, 'default');
    assert.strictEqual(puts[0].moduleName, 'storefront');
    assert.strictEqual(puts[0].channelName, 'context');
    assert.strictEqual(puts[0].ttl, 60);
    assert(puts[0].key.startsWith('storefrontContext:'));

    let second = await cache.resolve({ hostname: 'electronics.nodics.com' });
    assert.deepStrictEqual(second, first);
    assert.strictEqual(authorityCalls, 1, 'a valid cache hit must avoid authoritative resolution');
    assert(resolutionOutcomes.includes('cacheHit'));
    assert.strictEqual(cache.buildKey('electronics.nodics.com'), cache.buildKey('ELECTRONICS.NODICS.COM'));
    assert.notStrictEqual(cache.buildKey('electronics.nodics.com'), cache.buildKey('apparel.nodics.com'));

    hit = { contractVersion: 999, value: { storefrontCode: 'stale-contract' } };
    await cache.resolve({ hostname: 'electronics.nodics.com' });
    assert.strictEqual(authorityCalls, 2, 'a stale contract version must be recomputed');
    assert(cacheOutcomes.includes('contractMiss'));

    getMode = 'failure';
    let recovered = await cache.resolve({ hostname: 'electronics.nodics.com' });
    assert.strictEqual(recovered.authorityCall, 3, 'provider failure must fall through to database-backed resolution');
    assert(cacheOutcomes.includes('cacheError'));
    getMode = 'miss';

    await cache.invalidate({ tenant: 'tenantA' });
    assert.strictEqual(flushes.length, 1);
    assert.strictEqual(flushes[0].tenant, 'default', 'public hostname cache is partitioned by the bootstrap tenant');
    assert.strictEqual(flushes[0].prefix, 'storefrontContext:');
    assert.strictEqual(flushes[0].internalCacheOperation, true);

    let originalResolve = SERVICE.DefaultStorefrontContextService.resolve;
    let unknownCalls = 0;
    SERVICE.DefaultStorefrontContextService.resolve = async () => {
        unknownCalls += 1;
        throw Object.assign(new Error('not found'), { code: 'ERR_STOREFRONT_00009' });
    };
    hit = undefined;
    await assert.rejects(cache.resolve({ hostname: 'unknown.nodics.com' }), (error) => error.code === 'ERR_STOREFRONT_00009');
    assert.strictEqual(puts[puts.length - 1].ttl, properties.storefront.contextCache.negativeTtlSeconds);
    assert.strictEqual(puts[puts.length - 1].value.negative, true);
    await assert.rejects(cache.resolve({ hostname: 'unknown.nodics.com' }), (error) => error.code === 'ERR_STOREFRONT_00009');
    assert.strictEqual(unknownCalls, 1, 'negative cache hit must suppress repeated unknown-hostname authority scans');
    assert(cacheOutcomes.includes('negativeHit'));
    SERVICE.DefaultStorefrontContextService.resolve = originalResolve;
    await cache.invalidate({ tenant: 'tenantA' });
    let activated = await cache.resolve({ hostname: 'unknown.nodics.com' });
    assert.strictEqual(activated.storefrontCode, 'web', 'endpoint activation invalidation must remove a prior negative result');

    ['local', 'redis', 'hazelcast'].forEach((engine) => {
        properties.cache.storefront.channels.context.engine = engine;
        assert.strictEqual(properties.cache.storefront.channels.context.engine, engine);
    });
    properties.cache.storefront.channels.context.engine = 'local';

    let originalPolicy = cache.policy;
    cache.policy = () => Object.assign({}, properties.storefront.contextCache, { keyPrefix: 'projectContext:', ttlSeconds: 12 });
    hit = undefined;
    await cache.resolve({ hostname: 'electronics.nodics.com' });
    assert(puts[puts.length - 1].key.startsWith('projectContext:'), 'later modules can replace effective key policy');
    assert.strictEqual(puts[puts.length - 1].ttl, 12, 'later modules can replace effective TTL policy');
    cache.policy = originalPolicy;

    let source = fs.readFileSync(require.resolve('../src/service/defaultStorefrontContextCacheService'), 'utf8');
    assert(source.includes('DefaultCacheService'));
    assert(!source.includes('DefaultRedisCacheService'));
    assert(!source.includes('DefaultHazelcastCacheService'));
    assert(!source.includes('DefaultLocalCacheService'));
    console.log('Storefront context cache contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
