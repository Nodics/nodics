/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const path = require('path');
const redis = require('redis');

/**
 * @module redisCache/test/cacheRedisLive
 * @description Verifies the complete Redis cache adapter contract against the environment override or authoritative local runtime endpoint, or fails closed when neither exists.
 * @layer test
 * @owner nCache/redisCache
 * @override CI and deployment pipelines may provide NODICS_CACHE_REDIS_URL; local qualification follows startioLocal runtime configuration.
 */

class CacheError extends Error {
    constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; }
}
global.CLASSES = { CacheError };
const configurationService = require('../../cache/src/service/config/defaultCacheConfigurationService');
global.SERVICE = { DefaultCacheConfigurationService: configurationService };

function configuredRedisUrl() {
    if (process.env.NODICS_CACHE_REDIS_URL) return process.env.NODICS_CACHE_REDIS_URL;
    const properties = require(path.resolve(__dirname, '../../../../startio/envs/startioLocal/config/properties.js'));
    return properties.cache && properties.cache.default && properties.cache.default.engines &&
        properties.cache.default.engines.redis && properties.cache.default.engines.redis.options &&
        properties.cache.default.engines.redis.options.url;
}

(async function () {
    const url = configuredRedisUrl();
    const requireLive = process.argv.includes('--require-live') || process.env.NODICS_CACHE_REQUIRE_LIVE === 'true';
    if (!url) {
        assert(!requireLive, 'A Redis endpoint is required for the cache Redis release gate');
        console.log('Redis cache live contract NOT EXECUTED: configure the runtime endpoint or NODICS_CACHE_REDIS_URL');
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
