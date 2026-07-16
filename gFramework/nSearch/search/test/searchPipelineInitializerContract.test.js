/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * @module search/test/SearchPipelineInitializerContractTest
 * @description Verifies core nSearch initializer pipelines keep cache hits
 * immutable, serialize partial save failures safely, and invalidate cache after
 * successful single-model search saves.
 * @layer test
 * @owner nSearch
 * @override Project modules may add layer-specific search pipeline tests while
 * preserving these framework search lifecycle contracts.
 */

global.UTILS = {
    isBlank: function (value) {
        return !value || Object.keys(value).length === 0;
    },
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    isArray: function (value) {
        return Array.isArray(value);
    }
};
global.CONFIG = {
    get: function (key) {
        if (key === 'cache') return { enabled: true };
        return undefined;
    }
};
global.CLASSES = {
    SearchError: class SearchError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || error;
        }
        toJson() {
            return {
                code: this.code,
                message: this.message,
                metadata: this.metadata
            };
        }
    }
};
global.SERVICE = {};

const doGetService = require('../src/service/procs/doget/defaultDoGetModelsInitializerService');
const doSearchService = require('../src/service/procs/doSearch/defaultDoSearchModelsInitializerService');
const doSaveModelService = require('../src/service/procs/dosave/defaultDoSaveModelInitializerService');
const doSaveModelsService = require('../src/service/procs/dosave/defaultDoSaveModelsInitializerService');

function walkFiles(dir, files) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkFiles(entryPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(entryPath);
        }
    });
}

function assertNoMisspelledErrorClass() {
    const sourceRoot = path.join(__dirname, '../src');
    const files = [];
    const misspelledClassName = ['Nodics', 'Nodics'].join('');
    walkFiles(sourceRoot, files);
    const offenders = files.filter(file => {
        return fs.readFileSync(file, 'utf8').includes(misspelledClassName);
    });
    assert.deepStrictEqual(offenders, []);
}

function attachLog(service) {
    service.LOG = {
        debug: function () {},
        info: function () {},
        warn: function () {},
        error: function () {}
    };
}

[doGetService, doSearchService, doSaveModelService, doSaveModelsService].forEach(attachLog);

function searchRequest() {
    return {
        tenant: 'electronics',
        moduleName: 'catalog',
        indexName: 'product',
        authData: {},
        query: {
            id: 'product-001'
        },
        searchModel: {
            moduleName: 'catalog',
            indexName: 'product',
            indexDef: {
                cache: {
                    enabled: true,
                    ttl: 10
                }
            }
        },
        schemaModel: {
            moduleName: 'catalog',
            schemaName: 'product',
            rawSchema: {
                schemaOptions: {}
            }
        }
    };
}

function assertCacheHitClone(service) {
    let cachedValue = {
        result: [{
            code: 'product-001',
            internalScore: 99
        }]
    };
    global.SERVICE.DefaultCacheConfigurationService = {
        createSearchKey: function () {
            return 'search-cache-key';
        }
    };
    global.SERVICE.DefaultCacheService = {
        getSearchCacheChannel: function () {
            return 'product';
        },
        get: function () {
            return Promise.resolve(cachedValue);
        }
    };
    return new Promise((resolve, reject) => {
        service.lookupCache(searchRequest(), {}, {
            stop: function (request, response, value) {
                try {
                    assert.strictEqual(value.cache, 'item hit');
                    value.result[0].internalScore = 0;
                    assert.strictEqual(cachedValue.result[0].internalScore, 99);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            },
            nextSuccess: function () {
                reject(new Error('Cache hit should stop search pipeline'));
            },
            error: function (request, response, error) {
                reject(error);
            }
        });
    });
}

function assertDoSearchPostInterceptorUsesSearchError() {
    global.SERVICE.DefaultSearchConfigurationService = {
        getSearchInterceptors: function () {
            return {
                postDoSearch: ['FailingSearchPostInterceptor']
            };
        }
    };
    global.SERVICE.DefaultInterceptorService = {
        executeInterceptors: function () {
            return Promise.reject(new Error('post search failed'));
        }
    };
    return new Promise((resolve, reject) => {
        doSearchService.applyPostInterceptors(searchRequest(), {}, {
            nextSuccess: function () {
                reject(new Error('Failing post interceptor should not continue'));
            },
            error: function (request, response, error) {
                try {
                    assert(error instanceof CLASSES.SearchError);
                    assert.strictEqual(error.code, 'ERR_SRCH_00008');
                    resolve(true);
                } catch (assertionError) {
                    reject(assertionError);
                }
            }
        });
    });
}

function assertBulkDoSaveContract() {
    let originalModels = [
        { code: 'product-001' },
        { code: 'product-002', fail: true },
        { code: 'product-003' }
    ];
    let queryObjects = [];
    global.SERVICE.DefaultPipelineService = {
        start: function (pipelineName, saveRequest) {
            assert.strictEqual(pipelineName, 'doSaveModelInitializerPipeline');
            queryObjects.push(saveRequest.query);
            saveRequest.query.marker = saveRequest.model.code;
            if (saveRequest.model.fail) {
                return Promise.reject(new Error('Plain search save failure'));
            }
            return Promise.resolve({
                result: {
                    code: saveRequest.model.code,
                    indexed: true
                }
            });
        }
    };
    let request = Object.assign(searchRequest(), {
        query: {
            routing: 'default'
        },
        models: originalModels
    });
    let response = {};
    return new Promise((resolve, reject) => {
        doSaveModelsService.processModels(request, response, {
            nextSuccess: function () {
                try {
                    assert.deepStrictEqual(request.models, originalModels);
                    assert.strictEqual(response.success.length, 2);
                    assert.strictEqual(response.failed.length, 1);
                    assert.strictEqual(response.failed[0].metadata.code, 'product-002');
                    assert.notStrictEqual(queryObjects[0], queryObjects[1]);
                    assert.strictEqual(request.query.marker, undefined);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    }).then(saveResponse => {
        return new Promise((resolve, reject) => {
            doSaveModelsService.handleSucessEnd(request, saveResponse, {
                resolve: function (output) {
                    try {
                        assert.strictEqual(output.code, 'SUC_SRCH_00001');
                        assert.strictEqual(output.result.length, 2);
                        assert.strictEqual(output.errors[0].code, 'ERR_SRCH_00000');
                        assert.strictEqual(output.errors[0].metadata.code, 'product-002');
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    });
}

function assertSingleDoSaveInvalidationAndDefaults() {
    let invalidations = [];
    global.SERVICE.DefaultCacheService = {
        invalidateResource: function (options) {
            invalidations.push(options);
            return Promise.resolve(true);
        }
    };
    let request = searchRequest();
    request.model = {
        code: 'product-001'
    };
    request.searchModel.indexDef.cache.enabled = true;
    let response = {
        success: {
            code: 'SUC_SRCH_00000',
            result: {
                code: 'product-001'
            }
        }
    };
    return new Promise((resolve, reject) => {
        doSaveModelService.applyDefaultValues(request, {}, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            doSaveModelService.invalidateRouterCache(request, response, {
                nextSuccess: function () {
                    resolve(true);
                },
                error: function (req, res, error) {
                    reject(error);
                }
            });
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            doSaveModelService.invalidateSearchCache(request, response, {
                nextSuccess: function () {
                    resolve(true);
                },
                error: function (req, res, error) {
                    reject(error);
                }
            });
        });
    }).then(() => {
        assert.deepStrictEqual(invalidations.map(call => call.cacheType), ['router', 'search']);
    });
}

assertNoMisspelledErrorClass();

assertCacheHitClone(doGetService).then(() => {
    return assertCacheHitClone(doSearchService);
}).then(() => {
    return assertDoSearchPostInterceptorUsesSearchError();
}).then(() => {
    return assertBulkDoSaveContract();
}).then(() => {
    return assertSingleDoSaveInvalidationAndDefaults();
}).then(() => {
    console.log('Search pipeline initializer contracts validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
