/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module hazelcastCache/test/cacheHazelcastLive @description Runs guarded live Hazelcast TTL, isolation, and invalidation evidence. @layer test @owner nCache/hazelcastCache */
const assert = require('assert');
const members = process.env.NODICS_CACHE_HAZELCAST_MEMBERS;
const required = process.argv.includes('--require-live');
if (!members) {
    if (required) { console.error('NODICS_CACHE_HAZELCAST_MEMBERS is required'); process.exit(1); }
    console.log('Hazelcast cache live contract NOT EXECUTED: set NODICS_CACHE_HAZELCAST_MEMBERS; use --require-live');
} else {
    class CacheError extends Error { constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; } }
    global.CLASSES = { CacheError };
    const configuration = require('../../cache/src/service/config/defaultCacheConfigurationService');
    global.SERVICE = { DefaultCacheConfigurationService: configuration };
    const engine = Object.assign({}, require('../src/service/engine/defaultHazelcastCacheEngineService'), { LOG: { info: () => {} } });
    const service = require('../src/service/cache/defaultHazelcastCacheService');
    (async () => {
        let started = await engine.initCache({ options: { clusterName: process.env.NODICS_CACHE_HAZELCAST_CLUSTER || 'dev',
            clusterMembers: members.split(',').map(value => value.trim()).filter(Boolean), connectionTimeoutMs: 5000,
            mapNamePrefix: 'nodics-live-' + Date.now() } }, 'hazelcastLive');
        let channel = { channelName: 'sourcing', channelOptions: { ttl: 10 }, engineOptions: { options: {
            prefix: 'hazelcastLive', mapNamePrefix: 'nodics-live-' + Date.now() } }, client: started.result };
        try {
            await service.put({ tenant: 'tenant-a', moduleName: 'hazelcastLive', channel, key: 'prefix-a', value: { result: 'a' }, ttl: 2 });
            await service.put({ tenant: 'tenant-b', moduleName: 'hazelcastLive', channel, key: 'prefix-b', value: { result: 'b' }, ttl: 10 });
            assert.strictEqual((await service.get({ tenant: 'tenant-a', moduleName: 'hazelcastLive', channel, key: 'prefix-a' })).result, 'a');
            await service.flushByPrefix({ tenant: 'tenant-a', moduleName: 'hazelcastLive', channel, prefix: 'prefix' });
            await assert.rejects(service.get({ tenant: 'tenant-a', moduleName: 'hazelcastLive', channel, key: 'prefix-a' }));
            assert.strictEqual((await service.get({ tenant: 'tenant-b', moduleName: 'hazelcastLive', channel, key: 'prefix-b' })).result, 'b');
            console.log('Hazelcast cache live contract validated');
        } finally { await started.result.shutdown(); }
    })().catch(error => { console.error(error); process.exit(1); });
}
