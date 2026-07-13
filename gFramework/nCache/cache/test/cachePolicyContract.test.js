/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

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
    let decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'a' }] });
    assert.strictEqual(decision.cacheable, true);
    assert.strictEqual(decision.reason, 'accepted');
    assert.strictEqual(decision.reasonCode, 'RSN_CACHE_00000');

    resetPolicy({ maxPayloadBytes: 10 });
    decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'payloadTooLarge');
    assert.strictEqual(decision.reasonCode, 'RSN_CACHE_00007');
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

    resetPolicy({
        policyHandlers: [
            { code: 'tenant-cache-deny', index: 10, handler: 'TenantCachePolicyService.evaluate' }
        ]
    });
    global.SERVICE = {
        TenantCachePolicyService: {
            evaluate: () => ({
                cacheable: false,
                reason: 'tenantRuleDenied',
                reasonCode: 'RSN_TENANTCACHE_00001'
            })
        }
    };
    decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'tenantRuleDenied');
    assert.strictEqual(decision.reasonCode, 'RSN_TENANTCACHE_00001');
    assert.strictEqual(decision.handlerCode, 'tenant-cache-deny');

    resetPolicy({
        policyHandlers: [
            { code: 'default-handler-deny', index: 10, handler: 'DefaultDenyCachePolicyService.evaluate' }
        ]
    });
    global.SERVICE = {
        DefaultDenyCachePolicyService: {
            evaluate: () => ({ cacheable: false })
        }
    };
    decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'handlerRejected');
    assert.strictEqual(decision.reasonCode, 'RSN_CACHE_00008');
    assert.strictEqual(decision.handlerCode, 'default-handler-deny');

    resetPolicy({
        policyHandlers: [
            { code: 'second', index: 20, handler: 'SecondCachePolicyService.evaluate' },
            { code: 'first', index: 10, handler: 'FirstCachePolicyService.evaluate' }
        ]
    });
    const handlerOrder = [];
    global.SERVICE = {
        FirstCachePolicyService: {
            evaluate: () => { handlerOrder.push('first'); return { cacheable: true }; }
        },
        SecondCachePolicyService: {
            evaluate: () => { handlerOrder.push('second'); return { cacheable: true }; }
        }
    };
    decision = policyService.isItemCacheable(itemRequest(), { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, true);
    assert.deepStrictEqual(handlerOrder, ['first', 'second']);

    resetPolicy({
        policyHandlers: [
            { code: 'missing', index: 10, handler: 'MissingCachePolicyService.evaluate' }
        ]
    });
    global.SERVICE = {};
    decision = policyService.isApiCacheable(apiRequest(), { code: 'SUC', result: [{ code: 'employee-a' }] });
    assert.strictEqual(decision.cacheable, false);
    assert.strictEqual(decision.reason, 'handlerError');
    assert.strictEqual(decision.reasonCode, 'RSN_CACHE_00009');
    assert.strictEqual(decision.handlerCode, 'missing');

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
    assert.strictEqual(request.cachePolicyDecision.reasonCode, 'RSN_CACHE_00005');

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
    assert.strictEqual(modelRequest.cachePolicyDecision.reasonCode, 'RSN_CACHE_00007');

    console.log('Cache policy contracts validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
