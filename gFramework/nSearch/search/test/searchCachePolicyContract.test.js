/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module nSearch/search/test/searchCachePolicyContract
 * @description Verifies search query cache writes use the centralized cacheability policy and preserve configured doSearch caching.
 * @layer test
 * @owner nSearch/search
 * @override Projects may add search-specific cacheability handlers while preserving the shared cache policy decision contract.
 */

const baseCacheConfig = require('../../../nCache/cache/config/properties').cache;
let cacheConfig = JSON.parse(JSON.stringify(baseCacheConfig));
global.CONFIG = { get: key => key === 'cache' ? cacheConfig : undefined };
global.UTILS = {
    isBlank: value => value === undefined || value === null || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
};

const policyService = require('../../../nCache/cache/src/service/policy/defaultCachePolicyService');
const doSearchPipeline = Object.assign({}, require('../src/service/procs/doSearch/defaultDoSearchModelsInitializerService'), {
    LOG: { debug: () => {}, info: () => {}, error: () => {} }
});
const doGetPipeline = Object.assign({}, require('../src/service/procs/doget/defaultDoGetModelsInitializerService'), {
    LOG: { debug: () => {}, info: () => {}, error: () => {} }
});

function resetPolicy(overrides) {
    cacheConfig = JSON.parse(JSON.stringify(baseCacheConfig));
    cacheConfig.cacheability = Object.assign({}, cacheConfig.cacheability, overrides || {});
}

function searchRequest() {
    return {
        tenant: 'tenant-a',
        moduleName: 'search',
        cacheKeyHash: 'search-key',
        searchModel: {
            moduleName: 'search',
            indexName: 'employeeIndex',
            indexDef: {
                cache: { enabled: true, ttl: 30 }
            }
        }
    };
}

function runUpdate(pipeline, request, success) {
    return new Promise((resolve, reject) => {
        pipeline.updateCache(request, { success }, {
            nextSuccess: () => resolve(true),
            error: (_request, _response, error) => reject(error)
        });
    });
}

(async function () {
    let putCalls = 0;
    global.SERVICE = {
        DefaultCachePolicyService: policyService,
        DefaultCacheService: {
            getSearchCacheChannel: () => 'search',
            put: () => { putCalls += 1; return Promise.resolve(true); }
        }
    };

    resetPolicy();
    const sensitiveSearchRequest = searchRequest();
    await runUpdate(doSearchPipeline, sensitiveSearchRequest, { code: 'SUC_SRCH_00000', result: [{ code: 'employee-a', token: 'secret' }] });
    assert.strictEqual(putCalls, 0);
    assert.strictEqual(sensitiveSearchRequest.cachePolicyDecision.reason, 'sensitiveField');
    assert.strictEqual(sensitiveSearchRequest.cachePolicyDecision.reasonCode, 'RSN_CACHE_00005');

    resetPolicy({ allowSensitiveFields: true });
    await runUpdate(doSearchPipeline, searchRequest(), { code: 'SUC_SRCH_00000', result: [{ code: 'employee-a' }] });
    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(putCalls, 1, 'doSearch cache writes must not require a non-standard success flag');

    resetPolicy({ maxPayloadBytes: 1 });
    const doGetRequest = searchRequest();
    await runUpdate(doGetPipeline, doGetRequest, { success: true, code: 'SUC_SRCH_00000', result: [{ code: 'employee-a' }] });
    assert.strictEqual(putCalls, 1);
    assert.strictEqual(doGetRequest.cachePolicyDecision.reason, 'payloadTooLarge');
    assert.strictEqual(doGetRequest.cachePolicyDecision.reasonCode, 'RSN_CACHE_00007');

    console.log('Search cache policy contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
