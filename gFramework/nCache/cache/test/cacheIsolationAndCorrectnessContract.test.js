/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module cache/test/cacheIsolationAndCorrectnessContract
 * @description Verifies tenant/principal-safe API keys, response-envelope cache hits, mutation-free local storage, custom key flush dispatch, schema configuration compatibility, and event target propagation.
 * @layer test
 * @owner cache
 * @override Projects may extend cache channels and adapters while preserving these isolation and compatibility contracts.
 */

global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : key === 'cache' ? {} : undefined };
global.CLASSES = {
    CacheError: class CacheError extends Error {
        constructor(error, message) { super(message || error && error.message || String(error)); this.code = error && error.code || error; }
    }
};
global.UTILS = {
    generateHash: value => value,
    isApiCashable: () => true,
    isBlank: value => value === undefined || value === null
};

const configurationService = require('../src/service/config/defaultCacheConfigurationService');
const localCacheService = Object.assign({}, require('../../nodeCache/src/service/cache/defaultLocalCacheService'), { LOG: { debug: () => {} } });
const cacheServiceDefinition = require('../src/service/cache/defaultCacheService');
const requestPipeline = Object.assign({}, require('../../../nRouter/src/service/request/defaultRequestHandlerPipelineService'), { LOG: { debug: () => {}, warn: () => {} } });
const itemPipeline = Object.assign({}, require('../../../nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'), {
    LOG: { debug: () => {}, warn: () => {} },
    applyReadAccessPolicies: (_request, _response, process) => process.nextSuccess()
});
const eventService = require('../src/service/event/defaultCacheChangeListenerService');
global.SERVICE = { DefaultCacheConfigurationService: configurationService };

function requestFor(tenant, principal, groups = ['reader'], permissions = ['profile.read']) {
    return {
        tenant,
        entCode: 'enterprise-a',
        authData: { loginId: principal, tenant, userGroups: groups, permissions },
        httpRequest: { method: 'GET', originalUrl: '/nodics/profile/v0/employee', body: {}, get: () => undefined }
    };
}

(async function () {
    const tenantA = configurationService.createApiKey(requestFor('tenant-a', 'alice'));
    const tenantB = configurationService.createApiKey(requestFor('tenant-b', 'alice'));
    const principalB = configurationService.createApiKey(requestFor('tenant-a', 'bob'));
    const reordered = configurationService.createApiKey(requestFor('tenant-a', 'alice', ['reader'], ['profile.read']));
    assert.notStrictEqual(tenantA, tenantB);
    assert.notStrictEqual(tenantA, principalB);
    assert.strictEqual(tenantA, reordered);
    assert(!tenantA.includes('Bearer'));

    const values = new Map();
    const client = {
        set: (key, value) => values.set(key, value),
        get: key => values.get(key),
        del: key => values.delete(key)
    };
    const channel = { channelName: 'router', chennalOptions: {}, engineOptions: { ttl: 10, options: { prefix: 'profile', ttl: 10 } }, client };
    const original = { code: 'SUC_PRFL_00000', result: [{ code: 'employee-a' }] };
    await localCacheService.put({ channel, key: 'key-a', value: original, ttl: 10 });
    assert.strictEqual(original.code, 'SUC_PRFL_00000');
    original.result[0].code = 'mutated';
    const cached = await localCacheService.get({ channel, key: 'key-a' });
    assert.strictEqual(cached.result[0].code, 'employee-a');

    let stopped;
    global.SERVICE = {
        DefaultCacheConfigurationService: configurationService,
        DefaultCacheService: {
            getRouterCacheChannel: () => 'router',
            get: () => Promise.resolve({ code: 'SUC_PRFL_00000', result: [{ code: 'employee-a' }] })
        }
    };
    requestPipeline.lookupCache(Object.assign(requestFor('tenant-a', 'alice'), {
        originalUrl: '/nodics/profile/v0/employee', moduleName: 'profile', router: { routerName: 'get', cache: { enabled: true } }
    }), {}, {
        stop: (_request, _response, value) => { stopped = value; },
        nextSuccess: () => {},
        error: (_request, _response, error) => { throw error; }
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(stopped.code, 'SUC_PRFL_00000');
    assert.strictEqual(stopped.result[0].code, 'employee-a');
    assert.strictEqual(stopped.cache, 'api hit');

    let cacheLookupAttempted = false;
    let cacheBypassed = false;
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : key === 'cache' ? { enabled: false } : undefined };
    global.SERVICE = {
        DefaultCacheConfigurationService: configurationService,
        DefaultCacheService: {
            getRouterCacheChannel: () => 'router',
            get: () => { cacheLookupAttempted = true; return Promise.resolve({}); }
        }
    };
    requestPipeline.lookupCache(Object.assign(requestFor('tenant-a', 'alice'), {
        originalUrl: '/nodics/profile/v0/employee', moduleName: 'profile', router: { routerName: 'get', cache: { enabled: true } }
    }), {}, {
        stop: () => { throw new Error('Global cache disable must not stop from API cache'); },
        nextSuccess: () => { cacheBypassed = true; },
        error: (_request, _response, error) => { throw error; }
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(cacheLookupAttempted, false);
    assert.strictEqual(cacheBypassed, true);
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : key === 'cache' ? {} : undefined };

    stopped = undefined;
    global.SERVICE = {
        DefaultCacheConfigurationService: { createItemKey: () => 'employee_tenant-a_hash' },
        DefaultCacheService: {
            getSchemaCacheChannel: () => 'schema',
            get: () => Promise.resolve({ code: 'SUC_PRFL_00000', result: [{ code: 'employee-a' }] })
        }
    };
    itemPipeline.lookupCache({
        tenant: 'tenant-a',
        schemaModel: { moduleName: 'profile', schemaName: 'employee', cache: { enabled: true } }
    }, {}, {
        stop: (_request, _response, value) => { stopped = value; },
        nextSuccess: () => {},
        error: (_request, _response, error) => { throw error; }
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(stopped.result[0].code, 'employee-a');
    assert.strictEqual(stopped.cache, 'item hit');

    cacheLookupAttempted = false;
    cacheBypassed = false;
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : key === 'cache' ? { enabled: false } : undefined };
    global.SERVICE = {
        DefaultCacheConfigurationService: { createItemKey: () => 'employee_tenant-a_hash' },
        DefaultCacheService: {
            getSchemaCacheChannel: () => 'schema',
            get: () => { cacheLookupAttempted = true; return Promise.resolve({}); }
        }
    };
    itemPipeline.lookupCache({
        tenant: 'tenant-a',
        schemaModel: { moduleName: 'profile', schemaName: 'employee', cache: { enabled: true } }
    }, {}, {
        stop: () => { throw new Error('Global cache disable must not stop from item cache'); },
        nextSuccess: () => { cacheBypassed = true; },
        error: (_request, _response, error) => { throw error; }
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(cacheLookupAttempted, false);
    assert.strictEqual(cacheBypassed, true);
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : key === 'cache' ? {} : undefined };

    let flushed = false;
    const cacheService = Object.assign({}, cacheServiceDefinition);
    global.SERVICE = {
        DefaultCacheEngineService: { getCacheEngine: () => ({ engineOptions: { cacheHandler: 'CustomCacheHandler' } }) },
        CustomCacheHandler: { routerFlushByKeys: options => { flushed = options.keys[0] === 'key-a'; return Promise.resolve(true); } }
    };
    await cacheService.flushByKeys({ moduleName: 'profile', channelName: 'router', keys: ['key-a'] });
    assert.strictEqual(flushed, true);
    let schemaAlias = false;
    cacheService.updateItemCacheConfiguration = () => { schemaAlias = true; return Promise.resolve(true); };
    await cacheService.updateSchemaCacheConfiguration({});
    assert.strictEqual(schemaAlias, true);

    const tenantModel = { cache: { enabled: false } };
    global.UTILS.createModelName = () => 'EmployeeModel';
    global.NODICS = {
        getActiveTenants: () => ['tenant-a'],
        getModels: () => ({ EmployeeModel: tenantModel })
    };
    const itemResult = await cacheServiceDefinition.handleItemCacheChangeEvent({
        moduleName: 'profile',
        config: { schemaName: 'employee', cache: { enabled: true, ttl: 30 } }
    });
    assert.strictEqual(itemResult.code, 'SUC_CACHE_00000');
    assert.strictEqual(tenantModel.cache.enabled, true);

    let eventTarget;
    global.SERVICE = {
        DefaultCacheService: {
            handleRouterCacheChangeEvent: request => { eventTarget = request; return Promise.resolve(true); }
        }
    };
    await new Promise((resolve, reject) => eventService.handleRouterCacheChangeEvent({ tenant: 'tenant-a', target: 'profile', data: { routerName: 'get' } }, error => error ? reject(error) : resolve()));
    assert.strictEqual(eventTarget.moduleName, 'profile');
    assert.strictEqual(eventTarget.tenant, 'tenant-a');

    global.SERVICE.DefaultCacheService.handleItemCacheChangeEvent = request => { eventTarget = request; return Promise.resolve(true); };
    await new Promise((resolve, reject) => eventService.handleItemCacheChangeEvent({ tenant: 'tenant-a', target: 'profile', data: { schemaName: 'employee' } }, error => error ? reject(error) : resolve()));
    assert.strictEqual(eventTarget.moduleName, 'profile');
    assert.strictEqual(eventTarget.tenant, 'tenant-a');
    console.log('Cache isolation and correctness contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
