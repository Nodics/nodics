/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module database/test/ModelsGetInitializerPipelineContractTest
 * @description Verifies the generated get pipeline keeps schema lineage and
 * cache-hit responses immutable enough for repeated reads, layered overrides,
 * read-access policies, and custom cache adapters.
 * @layer test
 * @owner nDatabase
 * @override Project modules may add layer-specific get-pipeline contract tests
 * while preserving the framework get lifecycle guarantees validated here.
 */

global.SERVICE = {};
global.CONFIG = {
    get: function (key) {
        if (key === 'cache') return { enabled: true };
        return undefined;
    }
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || error;
        }
    }
};

const getInitializerService = require('../src/service/procs/get/defaultModelsGetInitializerService');

getInitializerService.LOG = {
    debug: function () {},
    warn: function () {},
    info: function () {},
    error: function () {}
};

const request = {
    tenant: 'electronics',
    schemaModel: {
        moduleName: 'catalog',
        schemaName: 'product',
        cache: {
            enabled: true
        },
        rawSchema: {
            parents: ['baseProduct']
        }
    }
};

assert.deepStrictEqual(
    getInitializerService.getSchemaLineage(request),
    ['baseProduct', 'product']
);
assert.deepStrictEqual(
    getInitializerService.getSchemaLineage(request),
    ['baseProduct', 'product']
);
assert.deepStrictEqual(
    request.schemaModel.rawSchema.parents,
    ['baseProduct']
);

let interceptorLookups = [];
global.SERVICE.DefaultDatabaseConfigurationService = {
    getSchemaInterceptors: function (schemaName) {
        interceptorLookups.push(schemaName);
        return {
            preGet: [schemaName + 'PreGetInterceptor']
        };
    }
};
global.SERVICE.DefaultInterceptorService = {
    executeInterceptors: function () {
        return Promise.resolve(true);
    }
};

function runPreInterceptors() {
    return new Promise((resolve, reject) => {
        getInitializerService.applyPreInterceptors(request, {}, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    });
}

function runCacheHitCloneContract() {
    let cachedValue = {
        code: 'SUC_FIND_00000',
        result: [{
            code: 'product-001',
            internalCost: 99
        }]
    };
    global.SERVICE.DefaultCacheConfigurationService = {
        createItemKey: function () {
            return 'cache-key';
        }
    };
    global.SERVICE.DefaultCacheService = {
        getSchemaCacheChannel: function () {
            return 'product';
        },
        get: function () {
            return Promise.resolve(cachedValue);
        }
    };
    global.SERVICE.DefaultSchemaReadAccessPolicyService = {
        applyReadPolicies: function (policyRequest, policyResponse) {
            delete policyResponse.success.result[0].internalCost;
            return Promise.resolve(policyResponse);
        }
    };
    return new Promise((resolve, reject) => {
        getInitializerService.lookupCache(Object.assign({}, request, {
            cacheKeyHash: 'cache-key'
        }), {}, {
            stop: function (req, res, value) {
                try {
                    assert.strictEqual(value.cache, 'item hit');
                    assert.strictEqual(value.result[0].code, 'product-001');
                    assert.strictEqual(value.result[0].internalCost, undefined);
                    assert.strictEqual(cachedValue.cache, undefined);
                    assert.strictEqual(cachedValue.result[0].internalCost, 99);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            },
            nextSuccess: function () {
                reject(new Error('Cache hit should stop after read access policies'));
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    });
}

runPreInterceptors().then(() => {
    return runPreInterceptors();
}).then(() => {
    assert.deepStrictEqual(interceptorLookups, [
        'baseProduct',
        'product',
        'baseProduct',
        'product'
    ]);
    assert.deepStrictEqual(request.schemaModel.rawSchema.parents, ['baseProduct']);
    return runCacheHitCloneContract();
}).then(() => {
    console.log('Models get initializer pipeline contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
