/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module database/test/ModelsRemoveUpdateInitializerPipelineContractTest
 * @description Verifies generated remove and update pipelines validate mutation
 * targets safely, understand current database affected-count result shapes, and
 * keep optional recursive/deep behavior guarded.
 * @layer test
 * @owner nDatabase
 * @override Project modules may add layer-specific remove/update pipeline tests
 * while preserving the framework mutation lifecycle contracts validated here.
 */

global.UTILS = {
    isBlank: function (value) {
        return !value || Object.keys(value).length === 0;
    },
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
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

const removeService = require('../src/service/procs/remove/defaultModelsRemoveInitializerService');
const updateService = require('../src/service/procs/update/defaultModelsUpdateInitializerService');

function attachLog(service) {
    service.LOG = {
        debug: function () {},
        warn: function () {},
        error: function () {}
    };
}

attachLog(removeService);
attachLog(updateService);

function createRequest() {
    return {
        tenant: 'electronics',
        authData: {},
        schemaModel: {
            moduleName: 'catalog',
            schemaName: 'product',
            rawSchema: {
                cache: {
                    enabled: true
                }
            }
        }
    };
}

function assertRemoveValidationError(requestPatch) {
    return new Promise((resolve, reject) => {
        removeService.validateRequest(Object.assign(createRequest(), requestPatch), {}, {
            nextSuccess: function () {
                reject(new Error('Invalid remove request should not continue'));
            },
            error: function (request, response, error) {
                try {
                    assert.strictEqual(error.code, 'ERR_DEL_00003');
                    resolve(true);
                } catch (assertionError) {
                    reject(assertionError);
                }
            }
        });
    });
}

function assertUpdateValidationError(requestPatch) {
    return new Promise((resolve, reject) => {
        updateService.validateRequest(Object.assign(createRequest(), requestPatch), {}, {
            nextSuccess: function () {
                reject(new Error('Invalid update request should not continue'));
            },
            error: function (request, response, error) {
                try {
                    assert.strictEqual(error.code, 'ERR_UPD_00003');
                    resolve(true);
                } catch (assertionError) {
                    reject(assertionError);
                }
            }
        });
    });
}

function assertRemoveBuildQueryFromIds() {
    let request = Object.assign(createRequest(), {
        ids: ['64ef00000000000000000001']
    });
    global.SERVICE.DefaultDatabaseConfigurationService = {
        toObjectId: function (schemaModel, id) {
            return 'object:' + id;
        }
    };
    return new Promise((resolve, reject) => {
        removeService.buildQuery(request, {}, {
            nextSuccess: function () {
                try {
                    assert.deepStrictEqual(request.query, {
                        _id: {
                            $in: ['object:64ef00000000000000000001']
                        }
                    });
                    resolve(true);
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

function assertModernAffectedCountsTriggerCacheInvalidation() {
    let calls = [];
    global.SERVICE.DefaultCacheService = {
        invalidateResource: function (options) {
            calls.push(options);
            return Promise.resolve(true);
        }
    };
    let removeResponse = {
        success: {
            result: {
                deletedCount: 2
            }
        }
    };
    let updateResponse = {
        success: {
            result: {
                modifiedCount: 1
            }
        }
    };
    return new Promise((resolve, reject) => {
        removeService.invalidateRouterCache(createRequest(), removeResponse, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            removeService.invalidateItemCache(createRequest(), removeResponse, {
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
            updateService.invalidateRouterCache(createRequest(), updateResponse, {
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
            updateService.invalidateItemCache(createRequest(), updateResponse, {
                nextSuccess: function () {
                    resolve(true);
                },
                error: function (req, res, error) {
                    reject(error);
                }
            });
        });
    }).then(() => {
        assert.deepStrictEqual(calls.map(call => call.cacheType), ['router', 'schema', 'router', 'schema']);
    });
}

function assertOptionalFlagsAreGuarded() {
    let removeResponse = {
        success: {
            result: {
                deletedCount: 1,
                models: [{ code: 'product-001' }]
            }
        }
    };
    let updateResponse = {
        success: {
            result: {
                modifiedCount: 1,
                models: [{ code: 'product-001' }]
            }
        }
    };
    return new Promise((resolve, reject) => {
        removeService.populateSubModels(createRequest(), removeResponse, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (req, res, error) {
                reject(error);
            }
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            removeService.handleDeepRemove(createRequest(), removeResponse, {
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
            updateService.populateSubModels(createRequest(), updateResponse, {
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

assertRemoveValidationError({ query: {} }).then(() => {
    return assertRemoveValidationError({ ids: 'not-array' });
}).then(() => {
    return assertUpdateValidationError({ query: {}, model: { code: 'product-001' } });
}).then(() => {
    return assertUpdateValidationError({ query: { code: 'product-001' }, model: [] });
}).then(() => {
    return assertRemoveBuildQueryFromIds();
}).then(() => {
    assert.strictEqual(removeService.getAffectedCount({ deletedCount: 2 }), 2);
    assert.strictEqual(updateService.getAffectedCount({ modifiedCount: 3 }), 3);
    assert.strictEqual(updateService.getAffectedCount({ result: { nModified: 4 } }), 4);
    return assertModernAffectedCountsTriggerCacheInvalidation();
}).then(() => {
    return assertOptionalFlagsAreGuarded();
}).then(() => {
    console.log('Models remove and update initializer pipeline contracts validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
