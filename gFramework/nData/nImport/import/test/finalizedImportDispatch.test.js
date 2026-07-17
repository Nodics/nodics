/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isArray: Array.isArray
};
global.CLASSES = {
    DataImportError: function DataImportError(error, message) {
        this.error = error;
        this.message = message;
        this.code = error && error.code ? error.code : error;
        this.errors = [];
        this.add = function (childError) {
            this.errors.push(childError);
        };
    }
};
global.NODICS = {
    getActiveTenants: function () {
        return ['default', 'test'];
    }
};
let stopImportOnFailure = false;
let batchImport = {
    enabled: false,
    size: 100
};
global.CONFIG = {
    get: function (key) {
        if (key === 'data') {
            return {
                stopImportOnFailure: stopImportOnFailure,
                batchImport: batchImport
            };
        }
        return undefined;
    }
};

const fileProcessor = require('../src/service/process/file/defaultFileDataImportProcessService');
const importDiagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');

function createService() {
    return Object.assign({}, fileProcessor, {
        LOG: {
            debug: function () {},
            warn: function () {}
        }
    });
}

function processModels(request) {
    return new Promise((resolve, reject) => {
        createService().processModels(request, {}, {
            nextSuccess: function () {
                resolve();
            },
            error: function (_request, _response, error) {
                reject(error);
            }
        });
    });
}

function getCodes(dataModel) {
    return [].concat(dataModel).map(model => model.code);
}

(async function () {
    let calls = [];
    global.SERVICE = {
        DefaultImportDiagnosticsService: importDiagnostics,
        DefaultPipelineService: {
            start: function (pipelineName, request) {
                calls.push({
                    pipelineName: pipelineName,
                    tenant: request.tenant,
                    model: request.dataModel
                });
                return Promise.resolve({
                    code: request.dataModel.code
                });
            }
        }
    };

    let request = {
        tenant: 'test',
        fileName: 'finalizedData_js',
        dataFiles: {
            finalizedData_js: {
                processed: [],
                done: false
            }
        },
        fileData: {
            header: {
                options: {
                    tenants: ['default', 'test'],
                    userGroups: ['employeeUserGroup'],
                    owningModule: 'owningFeatureModule',
                    moduleName: 'targetCapabilityModule',
                    schemaName: 'targetSchema',
                    operation: 'saveAll'
                }
            },
            models: {
                record0: {
                    code: 'one'
                },
                record1: {
                    code: 'two'
                }
            }
        },
        importRun: {
            summary: {}
        }
    };

    await processModels(request);

    assert.deepStrictEqual(calls.map(call => call.pipelineName), ['processModelImportPipeline', 'processModelImportPipeline']);
    assert.deepStrictEqual(calls.map(call => call.tenant), ['test', 'test']);
    assert.deepStrictEqual(calls.map(call => call.model.code), ['one', 'two']);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, ['test:record0', 'test:record1']);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 2);
    assert.strictEqual(request.importRun.summary.recordsSucceeded, 2);

    calls = [];
    request.tenant = undefined;
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun.summary = {};

    await processModels(request);

    assert.deepStrictEqual(calls.map(call => call.tenant), ['default', 'default', 'test', 'test']);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 4);
    assert.strictEqual(request.importRun.summary.recordsSucceeded, 4);

    calls = [];
    request.tenant = 'test';
    request.dataFiles.finalizedData_js.processed = ['test:record0'];
    request.importRun.summary = {};

    await processModels(request);

    assert.deepStrictEqual(calls.map(call => call.tenant), ['test']);
    assert.deepStrictEqual(calls.map(call => call.model.code), ['two']);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, ['test:record0', 'test:record1']);
    assert.strictEqual(request.importRun.summary.recordsSkipped, 1);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 1);
    assert.strictEqual(request.importRun.summary.recordsSucceeded, 1);

    calls = [];
    global.SERVICE.DefaultPipelineService.start = function (pipelineName, request) {
        calls.push({
            pipelineName: pipelineName,
            tenant: request.tenant,
            model: request.dataModel
        });
        if (request.dataModel.code === 'one') {
            return Promise.reject({
                code: 'ERR_TEST_IMPORT',
                message: 'Synthetic import failure'
            });
        }
        return Promise.resolve({
            code: request.dataModel.code
        });
    };
    request.tenant = 'test';
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    try {
        await processModels(request);
        assert.fail('Expected finalized import dispatch to report aggregate failure');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_IMP_00000');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].code, 'ERR_TEST_IMPORT');
    }

    assert.deepStrictEqual(calls.map(call => call.model.code), ['one', 'two']);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, ['test:record1']);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 2);
    assert.strictEqual(request.importRun.summary.recordsSucceeded, 1);
    assert.strictEqual(request.importRun.summary.recordsFailed, 1);
    assert.strictEqual(request.importRun.failures[0].owningModule, 'owningFeatureModule');
    assert.strictEqual(request.importRun.failures[0].targetModule, 'targetCapabilityModule');
    assert.strictEqual(request.importRun.failures[0].schemaName, 'targetSchema');
    assert.strictEqual(request.importRun.failures[0].operation, 'saveAll');
    assert.strictEqual(request.importRun.failures[0].error.code, 'ERR_TEST_IMPORT');

    calls = [];
    global.SERVICE.DefaultPipelineService.start = function (pipelineName, request) {
        calls.push({
            pipelineName: pipelineName,
            tenant: request.tenant,
            model: request.dataModel
        });
        return Promise.reject({
            code: 'ERR_TEST_IMPORT',
            message: 'Synthetic import failure'
        });
    };
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    try {
        await processModels(request);
        assert.fail('Expected all failed records to report aggregate failure');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_IMP_00000');
        assert.strictEqual(error.errors.length, 2);
    }

    assert.deepStrictEqual(calls.map(call => call.model.code), ['one', 'two']);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, []);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 2);
    assert.strictEqual(request.importRun.summary.recordsSucceeded || 0, 0);
    assert.strictEqual(request.importRun.summary.recordsFailed, 2);

    calls = [];
    stopImportOnFailure = false;
    batchImport = {
        enabled: true,
        size: 2
    };
    global.SERVICE.DefaultPipelineService.start = function (pipelineName, request) {
        calls.push({
            pipelineName: pipelineName,
            tenant: request.tenant,
            model: request.dataModel
        });
        return Promise.resolve([].concat(request.dataModel).map(model => ({
            code: model.code
        })));
    };
    request.fileData.header.options.batchImport = {
        enabled: true,
        size: 2
    };
    request.fileData.models = {
        record0: {
            code: 'one'
        },
        record1: {
            code: 'two'
        },
        record2: {
            code: 'three'
        },
        record3: {
            code: 'four'
        },
        record4: {
            code: 'five'
        }
    };
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    await processModels(request);

    assert.deepStrictEqual(calls.map(call => getCodes(call.model)), [
        ['one', 'two'],
        ['three', 'four'],
        ['five']
    ]);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, [
        'test:record0',
        'test:record1',
        'test:record2',
        'test:record3',
        'test:record4'
    ]);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 5);
    assert.strictEqual(request.importRun.summary.recordsSucceeded, 5);

    calls = [];
    global.SERVICE.DefaultPipelineService.start = function (pipelineName, request) {
        calls.push({
            pipelineName: pipelineName,
            tenant: request.tenant,
            model: request.dataModel
        });
        if (getCodes(request.dataModel).includes('one')) {
            return Promise.reject({
                code: 'ERR_TEST_BATCH_IMPORT',
                message: 'Synthetic batch import failure'
            });
        }
        return Promise.resolve([].concat(request.dataModel).map(model => ({
            code: model.code
        })));
    };
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    try {
        await processModels(request);
        assert.fail('Expected failed batch import to report aggregate failure');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_IMP_00000');
        assert.strictEqual(error.errors.length, 2);
        assert.strictEqual(error.errors[0].code, 'ERR_TEST_BATCH_IMPORT');
    }

    assert.deepStrictEqual(calls.map(call => getCodes(call.model)), [
        ['one', 'two'],
        ['three', 'four'],
        ['five']
    ]);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, [
        'test:record2',
        'test:record3',
        'test:record4'
    ]);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 5);
    assert.strictEqual(request.importRun.summary.recordsSucceeded, 3);
    assert.strictEqual(request.importRun.summary.recordsFailed, 2);

    calls = [];
    stopImportOnFailure = true;
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    try {
        await processModels(request);
        assert.fail('Expected fail-fast batch import to stop on first failed batch');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_TEST_BATCH_IMPORT');
    }

    assert.deepStrictEqual(calls.map(call => getCodes(call.model)), [['one', 'two']]);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, []);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 2);
    assert.strictEqual(request.importRun.summary.recordsSucceeded || 0, 0);
    assert.strictEqual(request.importRun.summary.recordsFailed, 2);

    calls = [];
    batchImport = {
        enabled: false,
        size: 100
    };
    request.fileData.header.options.batchImport = {
        enabled: false,
        size: 1
    };
    global.SERVICE.DefaultPipelineService.start = function (pipelineName, request) {
        calls.push({
            pipelineName: pipelineName,
            tenant: request.tenant,
            model: request.dataModel
        });
        return Promise.reject({
            code: 'ERR_TEST_IMPORT',
            message: 'Synthetic import failure'
        });
    };
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    try {
        await processModels(request);
        assert.fail('Expected fail-fast import to stop on first failed record');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_TEST_IMPORT');
    }

    assert.deepStrictEqual(calls.map(call => getCodes(call.model)), [['one']]);
    assert.deepStrictEqual(request.dataFiles.finalizedData_js.processed, []);
    assert.strictEqual(request.importRun.summary.recordsDispatched, 1);
    assert.strictEqual(request.importRun.summary.recordsSucceeded || 0, 0);
    assert.strictEqual(request.importRun.summary.recordsFailed, 1);
})();
