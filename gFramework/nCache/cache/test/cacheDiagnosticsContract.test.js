const assert = require('assert');

/**
 * @module cache/test/cacheDiagnosticsContract
 * @description Verifies process-local cache diagnostics counters for hits, misses, writes, errors, cacheability decisions, invalidation results, filters, and tenant-redaction configuration.
 * @layer test
 * @owner cache
 * @override Projects may replace diagnostics export/forwarding while preserving non-sensitive operation counters and filter semantics.
 */

class CacheError extends Error {
    constructor(error, message) {
        super(message || error && error.message || String(error));
        this.code = typeof error === 'string' ? error : error && error.code;
    }
}

let cacheConfig = { diagnostics: { enabled: true, includeTenant: true } };
global.CONFIG = { get: key => key === 'cache' ? cacheConfig : undefined };
global.CLASSES = { CacheError };

const cacheService = require('../src/service/cache/defaultCacheService');

const channel = {
    channelName: 'router',
    engineOptions: {
        cacheHandler: 'DiagnosticsCacheHandler',
        capabilities: {
            ttl: true,
            nonExpiringTtl: true,
            prefixFlush: true,
            keyFlush: true,
            atomicConsume: true
        }
    }
};

let cacheValue = { code: 'SUC_TEST_00000', result: [{ code: 'employee-a' }] };
global.SERVICE = {
    DefaultCacheEngineService: { getCacheEngine: () => channel },
    DiagnosticsCacheHandler: {
        put: () => Promise.resolve({ code: 'SUC_CACHE_00000' }),
        get: options => options.key === 'missing' ? Promise.reject(new CacheError('ERR_CACHE_00001')) : Promise.resolve(cacheValue),
        consume: options => options.key === 'missing' ? Promise.reject(new CacheError('ERR_CACHE_00001')) : Promise.resolve(cacheValue),
        flushByPrefix: () => Promise.resolve({ code: 'SUC_CACHE_00000' }),
        flushByKeys: () => Promise.reject(new CacheError('ERR_CACHE_00010', 'forced flush failure'))
    }
};

(async function () {
    cacheService.resetCacheMetrics();

    await cacheService.get({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', key: 'hit' });
    await assert.rejects(cacheService.get({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', key: 'missing' }), error => error.code === 'ERR_CACHE_00001');
    await cacheService.put({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', key: 'hit', value: cacheValue, ttl: 10 });
    await cacheService.consume({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', key: 'hit' });
    await cacheService.flushByPrefix({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', prefix: 'employee', internalCacheOperation: true, suppressPropagation: true });
    await assert.rejects(cacheService.flushByKeys({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', keys: ['hit'], internalCacheOperation: true, suppressPropagation: true }), error => error.code === 'ERR_CACHE_00010');

    let snapshot = cacheService.getCacheMetricsSnapshot();
    let getMetric = snapshot.operations['profile|tenant-a|router|get'];
    assert.strictEqual(getMetric.count, 2);
    assert.strictEqual(getMetric.results.hit, 1);
    assert.strictEqual(getMetric.results.miss, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|put'].results.success, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|consume'].results.hit, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|flushByPrefix'].results.success, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|flushByKeys'].results.error, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|flushByKeys'].lastErrorCode, 'ERR_CACHE_00010');

    cacheService.recordPolicyDecision({
        cacheable: false,
        layer: 'router',
        reason: 'sensitiveField',
        reasonCode: 'RSN_CACHE_00005'
    }, {
        tenant: 'tenant-a',
        moduleName: 'profile',
        layer: 'router',
        channelName: 'router'
    });
    cacheService.recordPolicyDecision({
        cacheable: true,
        layer: 'search',
        reason: 'accepted',
        reasonCode: 'RSN_CACHE_00000'
    }, {
        tenant: 'tenant-a',
        moduleName: 'search',
        layer: 'search',
        channelName: 'search'
    });
    snapshot = cacheService.getCacheMetricsSnapshot();
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|policyDecision'].results.skipped, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|policyDecision'].reasonCodes.RSN_CACHE_00005, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|router|policyDecision'].layers.router, 1);
    assert.strictEqual(snapshot.operations['search|tenant-a|search|policyDecision'].results.accepted, 1);
    assert.strictEqual(snapshot.operations['search|tenant-a|search|policyDecision'].reasonCodes.RSN_CACHE_00000, 1);

    cacheService.recordCacheMetric('invalidateResource', {
        tenant: 'tenant-a',
        moduleName: 'profile',
        channelName: 'schema',
        cacheLayer: 'schema',
        resourceName: 'employee'
    }, 'success', Date.now());
    snapshot = cacheService.getCacheMetricsSnapshot({ operation: 'invalidateResource', resourceName: 'employee' });
    assert.strictEqual(snapshot.operations['profile|tenant-a|schema|invalidateResource'].resources.employee, 1);
    assert.strictEqual(snapshot.operations['profile|tenant-a|schema|invalidateResource'].layers.schema, 1);

    let filtered = cacheService.getCacheMetricsSnapshot({ operation: 'get' });
    assert.strictEqual(Object.keys(filtered.operations).length, 1);
    assert(filtered.operations['profile|tenant-a|router|get']);

    cacheService.resetCacheMetrics();
    cacheConfig = { diagnostics: { enabled: true, includeTenant: false } };
    await cacheService.get({ tenant: 'tenant-secret', moduleName: 'profile', channelName: 'router', key: 'hit' });
    cacheService.recordPolicyDecision({
        cacheable: false,
        layer: 'router',
        reason: 'payloadTooLarge',
        reasonCode: 'RSN_CACHE_00007'
    }, {
        tenant: 'tenant-secret',
        moduleName: 'profile',
        layer: 'router',
        channelName: 'router'
    });
    snapshot = cacheService.getCacheMetricsSnapshot();
    assert(snapshot.operations['profile|<redacted>|router|get']);
    assert(snapshot.operations['profile|<redacted>|router|policyDecision']);

    cacheService.resetCacheMetrics();
    cacheConfig = { diagnostics: { enabled: false } };
    await cacheService.get({ tenant: 'tenant-a', moduleName: 'profile', channelName: 'router', key: 'hit' });
    assert.strictEqual(Object.keys(cacheService.getCacheMetricsSnapshot().operations).length, 0);

    console.log('Cache diagnostics contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
