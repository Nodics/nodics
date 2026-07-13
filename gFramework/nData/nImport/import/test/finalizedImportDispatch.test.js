/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
    }
};
global.NODICS = {
    getActiveTenants: function () {
        return ['default', 'test'];
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

    global.SERVICE.DefaultPipelineService.start = function () {
        return Promise.reject({
            code: 'ERR_TEST_IMPORT',
            message: 'Synthetic import failure'
        });
    };
    request.tenant = 'test';
    request.dataFiles.finalizedData_js.processed = [];
    request.importRun = {
        summary: {}
    };

    try {
        await processModels(request);
        assert.fail('Expected finalized import dispatch to fail');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_TEST_IMPORT');
    }

    assert.strictEqual(request.importRun.summary.recordsFailed, 1);
    assert.strictEqual(request.importRun.failures[0].owningModule, 'owningFeatureModule');
    assert.strictEqual(request.importRun.failures[0].targetModule, 'targetCapabilityModule');
    assert.strictEqual(request.importRun.failures[0].schemaName, 'targetSchema');
    assert.strictEqual(request.importRun.failures[0].operation, 'saveAll');
    assert.strictEqual(request.importRun.failures[0].error.code, 'ERR_TEST_IMPORT');
})();
