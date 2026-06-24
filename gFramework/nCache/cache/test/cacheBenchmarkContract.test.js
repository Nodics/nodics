const assert = require('assert');

/**
 * @module cache/test/cacheBenchmarkContract
 * @description Provides deterministic lightweight benchmark evidence that router/API and DAO/schema cache hits avoid downstream recomputation.
 * @layer test
 * @owner cache
 * @override Projects may add heavier workload benchmarks while preserving these cache-hit bypass contracts.
 */

class CacheError extends Error {
    constructor(error, message) {
        super(message || error && error.message || String(error));
        this.code = typeof error === 'string' ? error : error && error.code;
    }
}

global.CLASSES = {
    CacheError,
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || error && error.message || String(error));
            this.code = code || error && error.code;
        }
    }
};
global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : undefined };
global.UTILS = {
    generateHash: value => value,
    isApiCashable: () => true,
    isItemCashable: () => true,
    isBlank: value => value === undefined || value === null
};

const routerPipeline = Object.assign({}, require('../../../nRouter/src/service/request/defaultRequestHandlerPipelineService'), {
    LOG: { debug: () => {}, warn: () => {} }
});
const itemPipeline = Object.assign({}, require('../../../nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'), {
    LOG: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    applyReadAccessPolicies: (_request, _response, process) => process.nextSuccess()
});

function nowNs() {
    return process.hrtime.bigint();
}

function elapsedMs(startedAt) {
    return Number(process.hrtime.bigint() - startedAt) / 1000000;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function requestForRouter() {
    return {
        tenant: 'tenant-a',
        entCode: 'enterprise-a',
        moduleName: 'profile',
        originalUrl: '/nodics/profile/v0/employee',
        authData: { tenant: 'tenant-a', loginId: 'alice', userGroups: ['reader'], permissions: ['profile.read'] },
        httpRequest: { method: 'GET', originalUrl: '/nodics/profile/v0/employee', body: {}, get: () => undefined },
        router: {
            routerName: 'profile_employee_get',
            controller: 'BenchmarkController',
            operation: 'get',
            prefix: 'employee_get',
            cache: { enabled: true, ttl: 30 }
        }
    };
}

function runRouterLookup(request) {
    return new Promise((resolve, reject) => {
        routerPipeline.lookupCache(request, {}, {
            stop: (_request, _response, value) => resolve({ state: 'hit', value }),
            nextSuccess: () => resolve({ state: 'miss' }),
            error: (_request, _response, error) => reject(error)
        });
    });
}

function runRouterHandle(request) {
    return new Promise((resolve, reject) => {
        routerPipeline.handleRequest(request, {}, {
            nextSuccess: (_request, response) => resolve(response.success),
            error: (_request, _response, error) => reject(error)
        });
    });
}

async function runRouterIteration() {
    const request = requestForRouter();
    const lookup = await runRouterLookup(request);
    if (lookup.state === 'hit') return lookup.value;
    return runRouterHandle(request);
}

function requestForItem() {
    return {
        tenant: 'tenant-a',
        options: { recursive: false },
        searchOptions: { limit: 10 },
        query: { code: 'employee-a' },
        schemaModel: {
            moduleName: 'profile',
            schemaName: 'employee',
            cache: { enabled: true, ttl: 30 },
            getItems: async function (request) {
                await delay(4);
                itemQueryCalls += 1;
                return {
                    query: request.query,
                    options: {},
                    count: 1,
                    result: [{ code: 'employee-a' }]
                };
            }
        }
    };
}

function runItemLookup(request) {
    return new Promise((resolve, reject) => {
        itemPipeline.lookupCache(request, {}, {
            stop: (_request, _response, value) => resolve({ state: 'hit', value }),
            nextSuccess: () => resolve({ state: 'miss' }),
            error: (_request, _response, error) => reject(error)
        });
    });
}

function runItemExecute(request) {
    return new Promise((resolve, reject) => {
        const response = {};
        itemPipeline.executeQuery(request, response, {
            nextSuccess: () => resolve(response.success),
            error: (_request, _response, error) => reject(error)
        });
    });
}

async function runItemIteration() {
    const request = requestForItem();
    const lookup = await runItemLookup(request);
    if (lookup.state === 'hit') return lookup.value;
    return runItemExecute(request);
}

async function measure(iterations, runner) {
    const startedAt = nowNs();
    for (let index = 0; index < iterations; index++) {
        await runner();
    }
    return elapsedMs(startedAt);
}

let controllerCalls = 0;
let itemQueryCalls = 0;

(async function () {
    const iterations = 12;

    global.CONTROLLER = {
        BenchmarkController: {
            get: async (_request, callback) => {
                await delay(4);
                controllerCalls += 1;
                callback(null, { code: 'SUC_BENCH_00000', result: [{ code: 'employee-a' }] });
            }
        }
    };
    global.SERVICE = {
        DefaultCacheConfigurationService: {
            createApiKey: request => JSON.stringify({ tenant: request.tenant, url: request.originalUrl })
        },
        DefaultCacheService: {
            getRouterCacheChannel: () => 'router',
            get: () => Promise.resolve({ code: 'SUC_BENCH_00000', result: [{ code: 'employee-a' }] }),
            put: () => Promise.resolve({ code: 'SUC_CACHE_00000' })
        }
    };
    controllerCalls = 0;
    const routerHitMs = await measure(iterations, runRouterIteration);
    assert.strictEqual(controllerCalls, 0, 'Router cache hits must not call the controller');

    global.SERVICE.DefaultCacheService.get = () => Promise.reject(new CacheError('ERR_CACHE_00001'));
    controllerCalls = 0;
    const routerMissMs = await measure(iterations, runRouterIteration);
    assert.strictEqual(controllerCalls, iterations, 'Router cache misses must call the controller once per request');

    global.SERVICE = {
        DefaultCacheConfigurationService: {
            createItemKey: () => 'employee_tenant-a_hash'
        },
        DefaultCacheService: {
            getSchemaCacheChannel: () => 'schema',
            get: () => Promise.resolve({ code: 'SUC_FIND_00000', result: [{ code: 'employee-a' }] }),
            put: () => Promise.resolve({ code: 'SUC_CACHE_00000' })
        }
    };
    itemQueryCalls = 0;
    const itemHitMs = await measure(iterations, runItemIteration);
    assert.strictEqual(itemQueryCalls, 0, 'DAO/schema cache hits must not call the model query');

    global.SERVICE.DefaultCacheService.get = () => Promise.reject(new CacheError('ERR_CACHE_00001'));
    itemQueryCalls = 0;
    const itemMissMs = await measure(iterations, runItemIteration);
    assert.strictEqual(itemQueryCalls, iterations, 'DAO/schema cache misses must call the model query once per request');

    assert(routerHitMs < routerMissMs, 'Router cache hit path should be faster than miss/controller path');
    assert(itemHitMs < itemMissMs, 'DAO/schema cache hit path should be faster than miss/query path');

    console.log('Cache benchmark evidence validated: ' +
        'routerHitMs=' + routerHitMs.toFixed(3) +
        ', routerMissMs=' + routerMissMs.toFixed(3) +
        ', itemHitMs=' + itemHitMs.toFixed(3) +
        ', itemMissMs=' + itemMissMs.toFixed(3));
})().catch(error => {
    console.error(error);
    process.exit(1);
});
