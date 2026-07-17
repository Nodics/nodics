/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * @module cache/test/cacheInvalidationContract
 * @description Verifies tenant-partitioned storage, layered resource invalidation, local peer propagation, shared-adapter suppression, and write-pipeline integration.
 * @layer test
 * @owner cache
 * @override Projects may replace invalidation transport or channel mappings while preserving tenant scope and peer-node consistency.
 */

class CacheError extends Error {
    constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; }
}
global.CLASSES = { CacheError };
global.UTILS = { isBlank: value => value === undefined || value === null };
global.ENUMS = { TargetType: { MODULE_NODES: { key: 'MODULE_NODES' } } };
global.NODICS = {
    getModules: () => ({ profile: { name: 'profile' } }),
    getModule: name => name === 'profile' ? { name: 'profile' } : undefined,
    getActiveTenants: () => ['tenant-a', 'tenant-b']
};

const cacheConfig = {
    invalidation: { crossNode: true, eventName: 'cacheInvalidation' },
    schemaCacheChannelNameMapping: { employee: 'schemaCustom' },
    routerCacheChannelNameMapping: { get: 'routerCustom' },
    authCacheChannelNameMapping: {}
};
global.CONFIG = { get: key => key === 'cache' ? cacheConfig : key === 'nodeId' ? 'node-a' : undefined };

const configurationService = require('../src/service/config/defaultCacheConfigurationService');
configurationService.channels = { profile: { router: {}, routerCustom: {}, schemaCustom: {} } };
const localService = Object.assign({}, require('../../nodeCache/src/service/cache/defaultLocalCacheService'), { LOG: { debug: () => {} } });
const cacheService = require('../src/service/cache/defaultCacheService');
const listenerService = require('../src/service/event/defaultCacheChangeListenerService');

const values = new Map();
const client = {
    set: (key, value) => { values.set(key, value); return true; },
    get: key => values.get(key),
    del: keys => { [].concat(keys || []).forEach(key => values.delete(key)); return true; },
    keys: () => Array.from(values.keys()),
    flushAll: () => values.clear()
};
const localChannel = {
    channelName: 'schemaCustom',
    channelOptions: { ttl: 10 },
    engineOptions: { cacheHandler: 'DefaultLocalCacheService', capabilities: { distributed: false, prefixFlush: true, keyFlush: true, ttl: true, nonExpiringTtl: true, atomicConsume: true }, options: { prefix: 'profile' } },
    client
};

let published = [];
global.SERVICE = {
    DefaultCacheConfigurationService: configurationService,
    DefaultCacheEngineService: { getCacheEngine: () => localChannel },
    DefaultLocalCacheService: localService,
    DefaultEventService: { publish: event => { published.push(event); return Promise.resolve(true); } }
};

(async function () {
    assert.deepStrictEqual(cacheService.resolveInvalidationChannels({ moduleName: 'profile', cacheType: 'router', resourceName: 'employee' }), ['router', 'routerCustom']);
    await localService.put({ tenant: 'tenant-a', channel: localChannel, key: 'employee_hash', value: { result: 'a' }, ttl: 10 });
    await localService.put({ tenant: 'tenant-b', channel: localChannel, key: 'employee_hash', value: { result: 'b' }, ttl: 10 });
    assert.strictEqual(values.has('schemaCustom_profile_tenant-a_employee_hash'), true);
    assert.strictEqual(values.has('schemaCustom_profile_tenant-b_employee_hash'), true);

    await cacheService.invalidateResource({
        tenant: 'tenant-a', authData: { tenant: 'tenant-a' }, moduleName: 'profile', cacheType: 'schema', resourceName: 'employee'
    });
    assert.strictEqual(values.has('schemaCustom_profile_tenant-a_employee_hash'), false);
    assert.strictEqual(values.has('schemaCustom_profile_tenant-b_employee_hash'), true);
    assert.strictEqual(published.length, 1);
    assert.strictEqual(published[0].target, 'profile');
    assert.strictEqual(published[0].tenant, 'tenant-a');
    assert.strictEqual(published[0].data.channelName, 'schemaCustom');
    let invalidationMetric = cacheService.getCacheMetricsSnapshot({ operation: 'invalidateResource', resourceName: 'employee' }).operations['profile|tenant-a|schemaCustom|invalidateResource'];
    assert.strictEqual(invalidationMetric.results.success, 1);
    assert.strictEqual(invalidationMetric.resources.employee, 1);
    assert.strictEqual(invalidationMetric.layers.schema, 1);

    localChannel.engineOptions.capabilities.distributed = true;
    await cacheService.invalidateResource({
        tenant: 'tenant-b', authData: { tenant: 'tenant-b' }, moduleName: 'profile', cacheType: 'schema', resourceName: 'employee'
    });
    assert.strictEqual(published.length, 1, 'Shared adapters must not publish redundant peer invalidation');
    localChannel.engineOptions.capabilities.distributed = false;

    let peerRequest;
    global.SERVICE.DefaultCacheService = {
        flushCache: request => { peerRequest = request; return Promise.resolve(true); }
    };
    await new Promise((resolve, reject) => listenerService.handleCacheInvalidationEvent({
        tenant: 'tenant-a', target: 'profile', data: { channelName: 'schemaCustom', prefix: 'employee' }
    }, error => error ? reject(error) : resolve()));
    assert.strictEqual(peerRequest.suppressPropagation, true);
    assert.strictEqual(peerRequest.internalCacheOperation, true);
    assert.strictEqual(peerRequest.tenant, 'tenant-a');

    await new Promise(resolve => listenerService.handleCacheInvalidationEvent({
        tenant: 'tenant-a', target: 'profile', data: { prefix: 'employee' }
    }, error => {
        assert.strictEqual(error.success, false);
        assert.strictEqual(error.message.code, 'ERR_CACHE_00010');
        resolve();
    }));

    const repositoryRoot = path.resolve(__dirname, '../../../..');
    [
        'gFramework/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService.js',
        'gFramework/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService.js',
        'gFramework/nDatabase/database/src/service/procs/remove/defaultModelsRemoveInitializerService.js',
        'gFramework/nSearch/search/src/service/procs/dosave/defaultDoSaveModelInitializerService.js',
        'gFramework/nSearch/search/src/service/procs/doremove/defaultDoRemoveModelsInitializerService.js',
        'gFramework/nSearch/search/src/service/procs/doremove/defaultDoRemoveModelsByQueryInitializerService.js',
        'gFramework/nSearch/search/src/service/procs/doRemoveIndex/defaultDoRemoveIndexInitializerService.js'
    ].forEach(relativePath => {
        const source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
        assert(source.includes('DefaultCacheService.invalidateResource'), relativePath + ' must use governed resource invalidation');
        assert(!source.includes('DefaultCacheService.flushCache({'), relativePath + ' must not bypass tenant-aware resource invalidation');
    });
    console.log('Cache invalidation contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
