const assert = require('assert');

/**
 * @module cache/test/cachePolicyContract
 * @description Verifies layered cacheability governance for payload size, sensitive fields, empty results, binary payloads, skip reasons, and write-path integration.
 * @layer test
 * @owner cache
 * @override Projects may override `DefaultCachePolicyService` or `cache.cacheability` while preserving safe skip behavior and observable decisions.
 */

const baseCacheConfig = require('../config/properties').cache;
let cacheConfig = JSON.parse(JSON.stringify(baseCacheConfig));
global.CONFIG = { get: key => key === 'cache' ? cacheConfig : key === 'defaultTenant' ? 'default' : undefined };
const defaultUtils = {
    isBlank: value => value === undefined || value === null || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0),
    isApiCashable: (result, router) => !!(router && router.cache && router.cache.enabled && result),
    isItemCashable: (result, model) => !!(model && model.cache && model.cache.enabled && result)
};
global.UTILS = Object.assign({}, defaultUtils);

const policyService = require('../src/service/policy/defaultCachePolicyService');
const routerPipeline = Object.assign({}, require('../../../nRouter/src/service/request/defaultRequestHandlerPipelineService'), {
    LOG: { debug: () => {}, warn: () => {} }
});
const itemPipeline = Object.assign({}, require('../../../nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'), {
    LOG: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }
});

function resetPolicy(overrides) {
    cacheConfig = JSON.parse(JSON.stringify(baseCacheConfig));
    cacheConfig.cacheability = Object.assign({}, cacheConfig.cacheability, overrides || {});
    global.UTILS = Object.assign({}, defaultUtils);
}

function apiRequest() {
    return {
        tenant: 'tenant-a',
        moduleName: 'profile',
        originalUrl: '/nodics/profile/v0/employee',
        apiCacheKeyHash: 'api-key',
        router: {
            routerName: 'profile_employee_get',
            controller: 'PolicyController',
            operation: 'get',
            cache: { enabled: true, ttl: 30 }
        }
    };
}

function itemRequest() {
    return {
        tenant: 'tenant-a',
        cacheKeyHash: 'item-key',
        schemaModel: {
            moduleName: 'profile',
            schemaName: 'employee',
            cache: { enabled: true, ttl: 30 }
        }
    };
}

function runRouterHandle(request) {
    return new Promise((resolve, reject) => {
        routerPipeline.handleRequest(request, {}, {
            nextSuccess: (_request, response) => resolve(response.success),
            error: (_request, _response, error) => reject(error)
        });
    });
}

function runItemUpdate(request, success) {
    return new Promise((resolve, reject) => {
        itemPipeline.updateCache(request, { success }, {
            nextSuccess: () => resolve(true),
            error: (_request, _response, error) => reject(error)
        });
    });
}

(async function () {
    resetPolicy();
    assert.strictEqual(policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'a' }] }).cacheable, true);

    resetPolicy({ maxPayloadBytes: 10 });
    let decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'payloadTooLarge');
    assert(decision.payloadBytes > decision.maxPayloadBytes);

    resetPolicy();
    decision = policyService.isItemCacheable(itemRequest(), { code: 'SUC', result: [{ code: 'employee-a', password: 'secret' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'sensitiveField');
    assert.strictEqual(decision.sensitiveField, 'password');

    resetPolicy({ allowSensitiveFields: true });
    assert.strictEqual(policyService.isItemCacheable(itemRequest(), { code: 'SUC', result: [{ code: 'employee-a', password: 'secret' }] }).cacheable, true);

    resetPolicy();
    const disabledItemRequest = itemRequest();
    disabledItemRequest.schemaModel.cache.enabled = false;
    decision = policyService.isItemCacheable(disabledItemRequest, { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'legacyPolicyRejected');

    resetPolicy({ skipEmptyResults: true });
    decision = policyService.isItemCacheable(itemRequest(), { code: 'SUC', result: [] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'emptyResult');

    resetPolicy();
    decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: Buffer.from('secret') });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'binaryPayload');

    const circular = { code: 'SUC', result: [{ code: 'employee-a' }] };
    circular.self = circular;
    decision = policyService.isApiCacheable(apiRequest(), circular);
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'payloadNotSerializable');

    let putCalls = 0;
    global.CONTROLLER = {
        PolicyController: {
            get: (_request, callback) => callback(null, { code: 'SUC', result: [{ code: 'employee-a', token: 'secret' }] })
        }
    };
    global.SERVICE = {
        DefaultCachePolicyService: policyService,
        DefaultCacheService: {
            getRouterCacheChannel: () => 'router',
            getSchemaCacheChannel: () => 'schema',
            put: () => { putCalls += 1; return Promise.resolve(true); }
        }
    };
    resetPolicy({ allowSensitiveFields: false });
    const request = apiRequest();
    await runRouterHandle(request);
    assert.strictEqual(putCalls, 0);
    assert.strictEqual(request.cachePolicyDecision.reason, 'sensitiveField');

    putCalls = 0;
    resetPolicy({ allowSensitiveFields: true });
    await runRouterHandle(apiRequest());
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(putCalls, 1);

    putCalls = 0;
    resetPolicy({ maxPayloadBytes: 1 });
    const modelRequest = itemRequest();
    await runItemUpdate(modelRequest, { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(putCalls, 0);
    assert.strictEqual(modelRequest.cachePolicyDecision.reason, 'payloadTooLarge');

    console.log('Cache policy contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
