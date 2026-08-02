/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module database/test/ModelSaveInitializerPipelineContractTest
 * @description Verifies the single-model save pipeline validates model shape,
 * handles tenant schema option gaps, stops after validator failures, and keeps
 * optional recursive response population safe for bulk-save delegation.
 * @layer test
 * @owner nDatabase
 * @override Project modules may add layer-specific single-save pipeline tests
 * while preserving the framework save lifecycle contracts validated here.
 */

global.UTILS = {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
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
    }
};
global.SERVICE = {};

const singleSaveService = require('../src/service/procs/save/defaultModelSaveInitializerService');

singleSaveService.LOG = {
    debug: function () {},
    error: function () {},
    warn: function () {}
};

function createRequest(model) {
    return {
        tenant: 'electronics',
        model: model,
        schemaModel: {
            rawSchema: {
                schemaOptions: {}
            }
        }
    };
}

function assertValidationError(model) {
    return new Promise((resolve, reject) => {
        singleSaveService.validateModel(createRequest(model), {}, {
            nextSuccess: function () {
                reject(new Error('Invalid single-save model should not continue'));
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

function assertNoTenantOptionsDoNotFail() {
    return new Promise((resolve, reject) => {
        let request = createRequest({ code: 'product-001' });
        singleSaveService.applyDefaultValues(request, {}, {
            nextSuccess: function () {
                try {
                    assert.deepStrictEqual(request.model, { code: 'product-001' });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            let request = createRequest({ code: 'product-002' });
            singleSaveService.applyValidators(request, {}, {
                nextSuccess: function () {
                    resolve(true);
                },
                error: function (req, res, error) {
                    reject(error);
                }
            });
        });
    });
}

function assertValidatorFailureStopsPipeline() {
    let nextSuccessCalled = false;
    global.SERVICE.DefaultSkuValidatorService = {
        validate: function () {
            throw new Error('Invalid SKU');
        }
    };
    let request = {
        tenant: 'electronics',
        model: {
            sku: 'BAD-SKU'
        },
        schemaModel: {
            rawSchema: {
                schemaOptions: {
                    electronics: {
                        validators: {
                            sku: 'DefaultSkuValidatorService.validate'
                        }
                    }
                }
            }
        }
    };
    return new Promise((resolve, reject) => {
        singleSaveService.applyValidators(request, {}, {
            nextSuccess: function () {
                nextSuccessCalled = true;
            },
            error: function (req, res, error) {
                try {
                    assert.strictEqual(error.code, 'ERR_SAVE_00011');
                    assert.strictEqual(nextSuccessCalled, false);
                    resolve(true);
                } catch (assertionError) {
                    reject(assertionError);
                }
            }
        });
        setTimeout(() => {
            if (nextSuccessCalled) {
                reject(new Error('Validator failure must not continue pipeline'));
            }
        }, 0);
    });
}

function assertPopulateSubModelsAllowsMissingOptions() {
    return new Promise((resolve, reject) => {
        let request = createRequest({ code: 'product-003' });
        let response = {
            success: {
                result: {
                    code: 'product-003'
                }
            }
        };
        singleSaveService.populateSubModels(request, response, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    });
}

function assertCacheInvalidationCompletesBeforeSaveContinues() {
    let invalidationResolved = false;
    global.SERVICE.DefaultCacheService = {
        invalidateResource: function () {
            return new Promise(resolve => {
                setTimeout(() => {
                    invalidationResolved = true;
                    resolve(true);
                }, 5);
            });
        }
    };
    let request = createRequest({ code: 'product-004' });
    request.schemaModel.moduleName = 'catalog';
    request.schemaModel.schemaName = 'product';
    request.schemaModel.cache = { enabled: true };
    let response = { success: { result: request.model } };
    return new Promise((resolve, reject) => {
        singleSaveService.invalidateRouterCache(request, response, {
            nextSuccess: function () {
                try {
                    assert.strictEqual(invalidationResolved, true);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }).then(() => {
        invalidationResolved = false;
        return new Promise((resolve, reject) => {
            singleSaveService.invalidateItemCache(request, response, {
                nextSuccess: function () {
                    try {
                        assert.strictEqual(invalidationResolved, true);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    });
}

assertValidationError(undefined).then(() => {
    return assertValidationError([]);
}).then(() => {
    return assertNoTenantOptionsDoNotFail();
}).then(() => {
    return assertValidatorFailureStopsPipeline();
}).then(() => {
    return assertPopulateSubModelsAllowsMissingOptions();
}).then(() => {
    return assertCacheInvalidationCompletesBeforeSaveContinues();
}).then(() => {
    console.log('Model save initializer pipeline contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
