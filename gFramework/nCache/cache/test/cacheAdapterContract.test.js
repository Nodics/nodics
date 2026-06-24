const assert = require('assert');
const NodeCache = require('node-cache');

/**
 * @module cache/test/cacheAdapterContract
 * @description Verifies adapter capability metadata, TTL semantics, Local/Redis operation parity, and fail-closed Hazelcast activation.
 * @layer test
 * @owner cache
 * @override Projects may contribute custom adapter tests while preserving the versioned capability and operation contract.
 */

class CacheError extends Error {
    constructor(error, message) {
        super(message || error && error.message || String(error));
        this.code = typeof error === 'string' ? error : error && error.code;
    }
}
global.CLASSES = { CacheError };
global.CONFIG = { get: () => undefined };

const properties = require('../config/properties');
const configurationService = require('../src/service/config/defaultCacheConfigurationService');
const engineService = require('../src/service/engine/defaultCacheEngineService');
const cacheService = require('../src/service/cache/defaultCacheService');
const localService = Object.assign({}, require('../../nodeCache/src/service/cache/defaultLocalCacheService'), { LOG: { debug: () => {} } });
const redisService = Object.assign({}, require('../../redisCache/src/service/cache/defaultRedisCacheService'), { LOG: { debug: () => {} } });
const hazelcastService = require('../../hazelcastCache/src/service/cache/defaultHazelcastCacheService');
const hazelcastEngine = require('../../hazelcastCache/src/service/engine/defaultHazelcastCacheEngineService');

global.SERVICE = {
    DefaultCacheConfigurationService: configurationService,
    DefaultLocalCacheService: localService,
    DefaultRedisCacheService: redisService,
    DefaultLocalCacheEngineService: { initCache: () => Promise.resolve(true) },
    DefaultRedisCacheEngineService: { initCache: () => Promise.resolve(true) }
};

const engines = properties.cache.default.engines;
assert.strictEqual(engineService.validateEngineContract('local', engines.local, 'schema').serialization, 'clone');
assert.strictEqual(engineService.validateEngineContract('redis', engines.redis, 'schema').distributed, true);
assert.throws(() => engineService.validateEngineContract('hazelcast', engines.hazelcast, 'schema'), error => error.code === 'ERR_CACHE_00008');

const ttlChannel = { channelOptions: { ttl: 12 }, engineOptions: { ttl: 20, options: { ttl: 30 } } };
assert.strictEqual(configurationService.resolveTtl({ channel: ttlChannel }), 12);
assert.strictEqual(configurationService.resolveTtl({ channel: ttlChannel, ttl: 4 }), 4);
assert.strictEqual(configurationService.resolveTtl({ channel: ttlChannel, ttl: 0 }), 0);
assert.throws(() => configurationService.resolveTtl({ channel: ttlChannel, ttl: -1 }), error => error.code === 'ERR_CACHE_00009');
assert.throws(() => configurationService.resolveTtl({ channel: ttlChannel, ttl: 'invalid' }), error => error.code === 'ERR_CACHE_00009');

function localClient() {
    const values = new Map();
    return {
        values,
        ttlWrites: [],
        set: function (key, value, ttl) { this.values.set(key, value); this.ttlWrites.push(ttl); return true; },
        get: function (key) { return this.values.get(key); },
        del: function (keys) { [].concat(keys || []).forEach(key => this.values.delete(key)); return true; },
        keys: function () { return Array.from(this.values.keys()); },
        flushAll: function () { this.values.clear(); }
    };
}

function redisClient() {
    const values = new Map();
    return {
        values,
        writes: [],
        set: function (key, value, options) { this.values.set(key, value); this.writes.push({ key, options }); return Promise.resolve('OK'); },
        get: function (key) { return Promise.resolve(this.values.get(key)); },
        getDel: function (key) { let value = this.values.get(key); this.values.delete(key); return Promise.resolve(value); },
        del: function (keys) { [].concat(keys || []).forEach(key => this.values.delete(key)); return Promise.resolve(1); },
        scanIterator: async function* (options) {
            const prefix = String(options.MATCH || '').replace(/\*$/, '');
            for (const key of this.values.keys()) if (key.startsWith(prefix)) yield key;
        }
    };
}

(async function () {
    const local = localClient();
    const localChannel = { channelName: 'schema', channelOptions: { ttl: 8 }, engineOptions: Object.assign({}, engines.local, { options: { prefix: 'profile', ttl: 30 } }), client: local };
    const original = { result: { code: 'a' } };
    await localService.put({ channel: localChannel, key: 'one', value: original, ttl: 0 });
    assert.strictEqual(local.ttlWrites[0], 0);
    original.result.code = 'changed';
    assert.strictEqual((await localService.get({ channel: localChannel, key: 'one' })).result.code, 'a');
    assert.strictEqual((await localService.consume({ channel: localChannel, key: 'one' })).result.code, 'a');
    await assert.rejects(localService.get({ channel: localChannel, key: 'one' }), error => error.code === 'ERR_CACHE_00001');
    await localService.put({ channel: localChannel, key: 'prefix-a', value: { result: 1 }, ttl: 3 });
    await localService.put({ channel: localChannel, key: 'other', value: { result: 2 }, ttl: 3 });
    await localService.flushByPrefix({ channel: localChannel, prefix: 'prefix' });
    assert.strictEqual(local.values.has('schema_profile_prefix-a'), false);
    assert.strictEqual(local.values.has('schema_profile_other'), true);

    const actualLocalClient = new NodeCache({ useClones: true, checkperiod: 0 });
    const actualLocalChannel = Object.assign({}, localChannel, { client: actualLocalClient });
    await localService.put({ tenant: 'tenant-a', channel: actualLocalChannel, key: 'actual', value: { result: 'a' }, ttl: 10 });
    await localService.put({ tenant: 'tenant-b', channel: actualLocalChannel, key: 'actual', value: { result: 'b' }, ttl: 10 });
    await localService.flushByPrefix({ tenant: 'tenant-a', channel: actualLocalChannel });
    await assert.rejects(localService.get({ tenant: 'tenant-a', channel: actualLocalChannel, key: 'actual' }));
    assert.strictEqual((await localService.get({ tenant: 'tenant-b', channel: actualLocalChannel, key: 'actual' })).result, 'b');
    actualLocalClient.close();

    let now = 0;
    let expiringValue;
    const expiringClient = {
        set: (_key, value, ttl) => { expiringValue = { value, expiresAt: ttl > 0 ? now + ttl * 1000 : Infinity }; return true; },
        get: () => expiringValue && now < expiringValue.expiresAt ? expiringValue.value : undefined,
        del: () => { expiringValue = undefined; }
    };
    const expiringChannel = Object.assign({}, localChannel, { client: expiringClient });
    await localService.put({ channel: expiringChannel, key: 'expires', value: { result: true }, ttl: 2 });
    now = 2001;
    await assert.rejects(localService.get({ channel: expiringChannel, key: 'expires' }), error => error.code === 'ERR_CACHE_00001');

    const redis = redisClient();
    const redisChannel = { channelName: 'schema', channelOptions: { ttl: 9 }, engineOptions: Object.assign({}, engines.redis, { options: { prefix: 'profile', ttl: 30 } }), client: redis };
    await redisService.put({ channel: redisChannel, key: 'one', value: { result: { code: 'r' } }, ttl: 5 });
    assert.deepStrictEqual(redis.writes[0].options, { EX: 5 });
    assert.strictEqual((await redisService.get({ channel: redisChannel, key: 'one' })).result.code, 'r');
    assert.strictEqual((await redisService.consume({ channel: redisChannel, key: 'one' })).result.code, 'r');
    await assert.rejects(redisService.get({ channel: redisChannel, key: 'one' }), error => error.code === 'ERR_CACHE_00001');
    await redisService.put({ channel: redisChannel, key: 'forever', value: { result: true }, ttl: 0 });
    assert.strictEqual(redis.writes[1].options, undefined);
    await redisService.flushByKeys({ channel: redisChannel, keys: ['forever'] });
    assert.strictEqual(redis.values.has('schema_profile_forever'), false);

    assert.throws(() => cacheService.assertCapability({ engineOptions: { capabilities: { atomicConsume: false } } }, 'atomicConsume'), error => error.code === 'ERR_CACHE_00009');
    await assert.rejects(hazelcastService.get({}), error => error.code === 'ERR_CACHE_00008');
    await assert.rejects(hazelcastEngine.initCache({}, 'profile'), error => error.code === 'ERR_CACHE_00008');
    console.log('Cache adapter contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
