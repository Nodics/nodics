/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') {
            return 'default';
        }
        if (key === 'data') {
            return {
                dataDirName: 'temp'
            };
        }
        return undefined;
    }
};

global.NODICS = {
    getServerPath: function () {
        return '/tmp/nodics-server';
    }
};

const diagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');
const importService = require('../src/service/import/defaultImportService');

let request = {
    importRun: {
        runId: 'summary_1',
        startedAt: '2026-06-16T00:00:00.000Z',
        validationOnly: false,
        summary: {
            enabledHeaders: 2,
            disabledHeaders: 1,
            dataFilesDiscovered: 3,
            recordsSucceeded: 4,
            recordsSkipped: 1
        },
        dataFiles: {
            discovered: ['a', 'b', 'c'],
            matched: ['a', 'b'],
            unmatched: ['c']
        },
        failures: [],
        validationErrors: []
    }
};

let finalized = diagnostics.finalizeRun(request, 'COMPLETED', {
    finishedAt: '2026-06-16T00:00:05.000Z'
});

assert.strictEqual(finalized.status, 'COMPLETED');
assert.strictEqual(finalized.durationMs, 5000);
assert.strictEqual(finalized.summary.totalRecordsHandled, 5);
assert.strictEqual(finalized.summary.totalFilesDiscovered, 3);
assert.strictEqual(finalized.summary.totalHeaders, 3);

let failedFinalized = diagnostics.finalizeRun({
    importRun: {
        runId: 'summary_failed',
        startedAt: '2026-06-16T00:00:00.000Z',
        summary: {
            recordsSucceeded: 1
        },
        failures: [{
            message: 'Record failed'
        }]
    }
}, 'COMPLETED', {
    finishedAt: '2026-06-16T00:00:01.000Z'
});

assert.strictEqual(failedFinalized.status, 'FAILED');
assert.strictEqual(failedFinalized.failureCount, 1);
assert.strictEqual(failedFinalized.summary.recordsFailed, 1);
assert.strictEqual(failedFinalized.summary.totalRecordsHandled, 2);

let propagatedImportRun = {
    runId: 'summary_2',
    startedAt: '2026-06-16T00:00:00.000Z',
    summary: {},
    failures: [],
    validationErrors: []
};
let processedRequest;

global.SERVICE = {
    DefaultImportDiagnosticsService: diagnostics,
    DefaultPipelineService: {
        start: function (pipelineName, pipelineRequest) {
            if (pipelineName === 'systemDataImportInitializerPipeline') {
                pipelineRequest.importRun = propagatedImportRun;
                return Promise.resolve({
                    code: 'SUC_IMP_READY'
                });
            }
            if (pipelineName === 'processDataImportPipeline') {
                processedRequest = pipelineRequest;
                diagnostics.increment(pipelineRequest, 'recordsSucceeded', 2);
                return Promise.resolve({
                    processed: true
                });
            }
            return Promise.reject(new Error('Unexpected pipeline: ' + pipelineName));
        }
    }
};

(async function () {
    let result = await importService.importSampleData({
        tenant: 'testTenant',
        modules: ['sampleModule']
    });

    assert.strictEqual(processedRequest.importRun, propagatedImportRun);
    assert.strictEqual(processedRequest.inputPath.dataType, 'sample');
    assert.strictEqual(processedRequest.tenant, 'testTenant');
    assert.strictEqual(result.importRun.status, 'COMPLETED');
    assert.strictEqual(result.importRun.summary.recordsSucceeded, 2);
    assert.strictEqual(result.importRun.summary.totalRecordsHandled, 2);
    assert(result.importRun.finishedAt);

    console.log('Import run summary contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
