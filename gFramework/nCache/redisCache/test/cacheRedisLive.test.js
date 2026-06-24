const assert = require('assert');
const redis = require('redis');

/**
 * @module redisCache/test/cacheRedisLive
 * @description Optionally verifies the complete Redis cache adapter contract against an explicitly supplied isolated Redis endpoint, or fails closed for release gates.
 * @layer test
 * @owner nCache/redisCache
 * @override CI and deployment pipelines may provide NODICS_CACHE_REDIS_URL for guarded live qualification and use --require-live for release enforcement.
 */

class CacheError extends Error {
    constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; }
}
global.CLASSES = { CacheError };
const configurationService = require('../../cache/src/service/config/defaultCacheConfigurationService');
global.SERVICE = { DefaultCacheConfigurationService: configurationService };

(async function () {
    const url = process.env.NODICS_CACHE_REDIS_URL;
    const requireLive = process.argv.includes('--require-live') || process.env.NODICS_CACHE_REQUIRE_LIVE === 'true';
    if (!url) {
        assert(!requireLive, 'NODICS_CACHE_REDIS_URL is required for the cache Redis release gate');
        console.log('Redis cache live contract NOT EXECUTED: set NODICS_CACHE_REDIS_URL; use test:cache:release to require it');
        return;
    }
    const client = redis.createClient({ url });
    await client.connect();
    const service = Object.assign({}, require('../src/service/cache/defaultRedisCacheService'), { LOG: { debug: () => {} } });
    const prefix = 'nodics-cache-live-' + Date.now();
    const channel = {
        channelName: 'contract',
        channelOptions: { ttl: 10 },
        engineOptions: { options: { prefix }, ttl: 10 },
        client
    };
    try {
        await service.put({ tenant: 'test-tenant', channel, key: 'read', value: { result: 'ok' }, ttl: 10 });
        assert.strictEqual((await service.get({ tenant: 'test-tenant', channel, key: 'read' })).result, 'ok');
        assert.strictEqual((await service.consume({ tenant: 'test-tenant', channel, key: 'read' })).result, 'ok');
        await assert.rejects(service.get({ tenant: 'test-tenant', channel, key: 'read' }), error => error.code === 'ERR_CACHE_00001');
        await service.put({ tenant: 'test-tenant', channel, key: 'prefix-a', value: { result: 1 }, ttl: 10 });
        await service.put({ tenant: 'test-tenant', channel, key: 'keep', value: { result: 2 }, ttl: 10 });
        await service.flushByPrefix({ tenant: 'test-tenant', channel, prefix: 'prefix' });
        await assert.rejects(service.get({ tenant: 'test-tenant', channel, key: 'prefix-a' }));
        assert.strictEqual((await service.get({ tenant: 'test-tenant', channel, key: 'keep' })).result, 2);
        await service.flushByKeys({ tenant: 'test-tenant', channel, keys: ['keep'] });
        await assert.rejects(service.get({ tenant: 'test-tenant', channel, key: 'keep' }));
        console.log('Redis cache live contract validated');
    } finally {
        await service.flushByPrefix({ tenant: 'test-tenant', channel }).catch(() => false);
        await client.quit().catch(() => false);
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
