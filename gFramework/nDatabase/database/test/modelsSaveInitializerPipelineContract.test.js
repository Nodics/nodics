/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module database/test/ModelsSaveInitializerPipelineContractTest
 * @description Verifies the bulk save pipeline keeps caller input stable, handles
 * partial failures safely, and processes larger batches without recursive stack
 * growth while delegating each item to the single-model save pipeline.
 * @layer test
 * @owner nDatabase
 * @override Project modules may add layer-specific bulk save tests while
 * preserving the framework bulk-save request and response contract validated here.
 */

global.UTILS = {
    isBlank: function (value) {
        return !value || Object.keys(value).length === 0;
    }
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
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

const bulkSaveService = require('../src/service/procs/save/defaultModelsSaveInitializerService');

bulkSaveService.LOG = {
    debug: function () {}
};

function assertValidationError(inputModels) {
    return new Promise((resolve, reject) => {
        bulkSaveService.validateInput({ models: inputModels }, {}, {
            nextSuccess: function () {
                reject(new Error('Invalid models input should not continue'));
            },
            error: function (request, response, error) {
                try {
                    assert.strictEqual(error.code, 'ERR_SAVE_00003');
                    resolve(true);
                } catch (assertionError) {
                    reject(assertionError);
                }
            }
        });
    });
}

function runProcessModelsContract() {
    let originalModels = [
        { code: 'product-001' },
        { code: 'product-002', fail: true },
        { code: 'product-003' }
    ];
    let queryObjects = [];
    global.SERVICE.DefaultPipelineService = {
        start: function (pipelineName, saveRequest) {
            assert.strictEqual(pipelineName, 'modelSaveInitializerPipeline');
            queryObjects.push(saveRequest.query);
            saveRequest.query.filters.processedBy = saveRequest.model.code;
            if (saveRequest.model.fail) {
                return Promise.reject(new Error('Plain save failure'));
            }
            return Promise.resolve({
                result: {
                    code: saveRequest.model.code,
                    saved: true
                }
            });
        }
    };
    let request = {
        tenant: 'electronics',
        authData: {
            user: 'tester'
        },
        schemaModel: {
            schemaName: 'product'
        },
        query: {
            filters: {
                active: true
            }
        },
        models: originalModels
    };
    let response = {};
    return new Promise((resolve, reject) => {
        bulkSaveService.processModels(request, response, {
            nextSuccess: function () {
                try {
                    assert.deepStrictEqual(request.models, originalModels);
                    assert.deepStrictEqual(originalModels.map(model => model.code), ['product-001', 'product-002', 'product-003']);
                    assert.strictEqual(response.success.length, 2);
                    assert.strictEqual(response.failed.length, 1);
                    assert.strictEqual(response.failed[0].metadata.code, 'product-002');
                    assert.strictEqual(response.failed[0].metadata.fail, true);
                    assert.strictEqual(queryObjects.length, 3);
                    assert.notStrictEqual(queryObjects[0], queryObjects[1]);
                    assert.notStrictEqual(queryObjects[1], queryObjects[2]);
                    assert.strictEqual(request.query.filters.processedBy, undefined);
                    resolve({ request, response });
                } catch (error) {
                    reject(error);
                }
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    });
}

function runSuccessEndContract(response) {
    return new Promise((resolve, reject) => {
        bulkSaveService.handleSucessEnd({}, response, {
            resolve: function (output) {
                try {
                    assert.strictEqual(output.code, 'SUC_SAVE_00001');
                    assert.strictEqual(output.success, false);
                    assert.strictEqual(output.result.length, 2);
                    assert.strictEqual(output.errors.length, 1);
                    assert.strictEqual(output.errors[0].code, 'ERR_SAVE_00000');
                    assert.strictEqual(output.errors[0].message, 'Plain save failure');
                    assert.strictEqual(output.errors[0].metadata.code, 'product-002');
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

function runLargeBatchContract() {
    let models = [];
    for (let index = 0; index < 1500; index++) {
        models.push({ code: 'bulk-' + index });
    }
    let processed = 0;
    global.SERVICE.DefaultPipelineService = {
        start: function () {
            processed++;
            return Promise.resolve({
                result: {
                    processed: true
                }
            });
        }
    };
    return bulkSaveService.handleModelsSave({
        tenant: 'electronics',
        authData: {},
        schemaModel: {},
        originalQuery: {}
    }, {}, models).then(() => {
        assert.strictEqual(processed, 1500);
        assert.strictEqual(models.length, 1500);
    });
}

assertValidationError(undefined).then(() => {
    return assertValidationError([]);
}).then(() => {
    return assertValidationError({ code: 'not-array' });
}).then(() => {
    return runProcessModelsContract();
}).then(context => {
    return runSuccessEndContract(context.response);
}).then(() => {
    return runLargeBatchContract();
}).then(() => {
    console.log('Models save initializer pipeline contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
