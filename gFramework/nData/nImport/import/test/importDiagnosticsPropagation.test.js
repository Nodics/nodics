/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module import/test/importDiagnosticsPropagation
 * @description Verifies that one import run remains attached across header
 * finalization and finalized-file dispatch so counters and failures describe
 * the complete import lifecycle.
 * @layer test
 * @owner import
 */

global.NODICS = {
    getNodicsHome: function () {
        return '/tmp/nodics';
    }
};
global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '';
    }
};
global.CLASSES = {
    DataImportError: class DataImportError extends Error {}
};

const initializerDefinition = require('../src/service/defaultDataImportInitializerService');
const processDefinition = require('../src/service/process/init/defaultDataImportProcessService');

function invokeProcessHeaders(importRun) {
    let initializer = Object.assign({}, initializerDefinition, {
        LOG: {
            debug: function () {}
        }
    });
    let capturedRequest;
    global.SERVICE = {
        DefaultPipelineService: {
            start: function (pipelineName, request) {
                assert.strictEqual(pipelineName, 'headerProcessPipeline');
                capturedRequest = request;
                return Promise.resolve(true);
            }
        }
    };
    return initializer.processHeaders({
        tenant: 'default',
        importRun: importRun,
        data: {
            headers: {
                documentationHeader: {
                    options: {},
                    dataFiles: {}
                }
            }
        },
        inputPath: {},
        outputPath: {}
    }, {}, {
        pendingHeaders: ['documentationHeader']
    }).then(() => capturedRequest);
}

function invokeProcessFiles(importRun) {
    let processService = Object.assign({}, processDefinition, {
        LOG: {
            debug: function () {},
            error: function () {}
        },
        processNextFile: function (_request, _response, _options, resolve) {
            resolve(true);
        }
    });
    let capturedRequest;
    global.SERVICE = {
        DefaultPipelineService: {
            start: function (pipelineName, request) {
                assert.strictEqual(pipelineName, 'processFileDataImportPipeline');
                capturedRequest = request;
                return Promise.resolve(true);
            }
        },
        DefaultFileHandlerService: {
            moveFile: function () {
                return Promise.resolve(true);
            }
        }
    };
    return processService.processFiles({
        tenant: 'default',
        importRun: importRun,
        inputPath: {
            successPath: '/tmp/success'
        },
        dataFiles: {
            documentation_js: {
                file: require.resolve('./fixtures/importDiagnosticsData'),
                done: false
            }
        }
    }, {}, {
        phase: 0,
        phaseLimit: 1,
        pendingFiles: ['documentation_js']
    }).then(() => capturedRequest);
}

(async function () {
    let importRun = {
        runId: 'contentPack_documentation_test',
        summary: {}
    };
    let headerRequest = await invokeProcessHeaders(importRun);
    assert.strictEqual(headerRequest.importRun, importRun);

    let fileRequest = await invokeProcessFiles(importRun);
    assert.strictEqual(fileRequest.importRun, importRun);

    console.log('Import diagnostics propagate across header and file processing boundaries');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
