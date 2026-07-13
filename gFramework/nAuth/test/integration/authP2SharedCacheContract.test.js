/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthP2SharedCacheContract
 * @description Proves concurrent single-use refresh consumption and strict
 * distributed auth-cache capability validation.
 * @layer test
 * @owner nAuth
 * @override Distributed cache adapters may extend this contract with their own
 * live engine suite while preserving exactly-once consumption.
 */
const assert = require('assert');
const configuration = require('./authP2TestConfiguration').load();

class CacheError extends Error {
    constructor(code, message) {
        super(message || code && code.message || String(code));
        this.code = typeof code === 'string' ? code : code && code.code;
    }
}
class NodicsError extends Error {
    constructor(code, message) { super(message || code && code.message || String(code)); this.code = typeof code === 'string' ? code : code && code.code; }
}

global.CLASSES = { CacheError, NodicsError };
global.SERVICE = {
    DefaultCacheConfigurationService: require('../../../nCache/cache/src/service/config/defaultCacheConfigurationService')
};

function channel(client, engine) {
    return {
        channelName: 'auth',
        client: client,
        chennalOptions: { ttl: 60 },
        engineOptions: { ttl: 60, options: { prefix: configuration.tenant }, distributed: engine === 'redis', atomicConsume: true }
    };
}

class AtomicRedisClient {
    constructor(values) { this.values = values; }
    set(key, value) { this.values.set(key, value); return Promise.resolve('OK'); }
    get(key) { return Promise.resolve(this.values.get(key)); }
    getDel(key) {
        let value = this.values.get(key);
        if (value !== undefined) this.values.delete(key);
        return Promise.resolve(value);
    }
    del(keys) { [].concat(keys || []).forEach(key => this.values.delete(key)); return Promise.resolve(1); }
    async *scanIterator() { for (let key of this.values.keys()) yield key; }
}

async function run() {
    const redisService = require('../../../nCache/redisCache/src/service/cache/defaultRedisCacheService');
    redisService.LOG = { debug: function () {} };
    let values = new Map();
    let clients = [new AtomicRedisClient(values), new AtomicRedisClient(values)];
    let options = { key: 'concurrent-refresh', value: { tenant: configuration.tenant, loginId: 'p2-user' }, channel: channel(clients[0], 'redis') };
    await redisService.put(options);
    let attempts = await Promise.allSettled(Array.from({ length: 32 }, (unused, index) => redisService.consume({
        key: 'concurrent-refresh',
        channel: channel(clients[index % clients.length], 'redis')
    })));
    assert.strictEqual(attempts.filter(result => result.status === 'fulfilled').length, 1, 'Exactly one concurrent refresh consume may succeed');
    assert.strictEqual(attempts.filter(result => result.status === 'rejected').length, 31);

    await assert.rejects(redisService.consume({ key: 'unsupported', channel: channel({ get: function () {} }, 'redis') }), /atomic GETDEL/);

    const stampService = require('../../src/service/identity/defaultPrincipalSecurityStampService');
    function stampConfig(engineName, engineDefinition, fallback, overrides) {
        overrides = overrides || {};
        global.CONFIG = { get: key => key === 'authSecurity' ? { securityStamp: { enabled: true, failClosed: true, allowMissingStamp: false } } : key === 'cache' ? {
            enabled: overrides.cacheEnabled,
            profile: { channels: { auth: Object.assign({ engine: engineName, fallback: fallback }, overrides.channel || {}) } },
            default: { engines: { [engineName]: Object.assign({}, engineDefinition, overrides.engine || {}) } }
        } : undefined };
    }
    stampConfig('local', { distributed: false, atomicConsume: true }, false);
    await assert.rejects(stampService.validateConfiguration(), /distributed auth cache/);
    stampConfig('hazelcast', { distributed: false, atomicConsume: false }, false);
    await assert.rejects(stampService.validateConfiguration(), /distributed auth cache/);
    stampConfig('redis', { distributed: true, atomicConsume: true }, true);
    await assert.rejects(stampService.validateConfiguration(), /fallback disabled/);
    stampConfig('redis', { distributed: true, atomicConsume: true }, false, { cacheEnabled: false });
    await assert.rejects(stampService.validateConfiguration(), /enabled distributed auth cache/);
    stampConfig('redis', { distributed: true, atomicConsume: true }, false, { channel: { enabled: false } });
    await assert.rejects(stampService.validateConfiguration(), /enabled distributed auth cache/);
    stampConfig('redis', { distributed: true, atomicConsume: true }, false, { engine: { enabled: false } });
    await assert.rejects(stampService.validateConfiguration(), /enabled distributed auth cache/);
    stampConfig('redis', { distributed: true, atomicConsume: true }, false);
    await stampService.validateConfiguration();

    console.log('nAuth P2 shared-cache contract validated');
}

run().catch(error => { console.error(error); process.exit(1); });
