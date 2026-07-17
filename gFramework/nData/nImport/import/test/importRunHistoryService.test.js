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
        return undefined;
    }
};

global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

let savedRequest;
let historyRequest;

global.SERVICE = {
    DefaultImportRunService: {
        save: function (request) {
            savedRequest = request;
            return Promise.resolve({
                success: true,
                result: [request.model]
            });
        },
        get: function (request) {
            historyRequest = request;
            return Promise.resolve({
                result: [{
                    code: 'importRun_sample_1',
                    runId: 'importRun_sample_1',
                    status: 'COMPLETED',
                    dataType: 'sample',
                    tenant: 'testTenant'
                }]
            });
        }
    }
};

const historyService = require('../src/service/history/defaultImportRunHistoryService');
const diagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');

historyService.LOG = {
    warn: function () {},
    error: function () {}
};

global.SERVICE.DefaultImportRunHistoryService = historyService;

(async function () {
    let recordResult = await historyService.recordRun({
        tenant: 'testTenant',
        dataType: 'sample',
        modules: ['profile'],
        authData: {
            code: 'adminUser'
        },
        correlationId: 'corr-1',
        importRun: {
            runId: 'importRun_sample_1',
            status: 'COMPLETED',
            startedAt: '2026-06-17T00:00:00.000Z',
            finishedAt: '2026-06-17T00:00:01.000Z',
            summary: {
                totalRecordsHandled: 2
            }
        }
    });

    assert.strictEqual(recordResult.success, true);
    assert.strictEqual(savedRequest.tenant, 'testTenant');
    assert.strictEqual(savedRequest.model.code, 'importRun_sample_1');
    assert.strictEqual(savedRequest.model.runId, 'importRun_sample_1');
    assert.strictEqual(savedRequest.model.dataType, 'sample');
    assert.deepStrictEqual(savedRequest.model.modules, ['profile']);
    assert.strictEqual(savedRequest.model.requestedBy, 'adminUser');
    assert.strictEqual(savedRequest.model.correlationId, 'corr-1');

    let history = await historyService.getImportRunHistory({
        tenant: 'testTenant',
        httpRequest: {
            query: {
                status: 'COMPLETED',
                dataType: 'sample',
                moduleName: 'profile',
                limit: '10'
            }
        }
    });

    assert.strictEqual(history.code, 'SUC_IMP_00000');
    assert.strictEqual(history.metadata.tenant, 'testTenant');
    assert.strictEqual(history.metadata.count, 1);
    assert.strictEqual(historyRequest.query.status, 'COMPLETED');
    assert.strictEqual(historyRequest.query.dataType, 'sample');
    assert.strictEqual(historyRequest.query.modules, 'profile');
    assert.strictEqual(historyRequest.searchOptions.limit, 10);

    let detail = await historyService.getImportRun({
        tenant: 'testTenant',
        runId: 'importRun_sample_1'
    });

    assert.strictEqual(detail.data.runId, 'importRun_sample_1');
    assert.strictEqual(historyRequest.query.runId, 'importRun_sample_1');

    let diagnosticsRequest = {
        tenant: 'testTenant',
        dataType: 'core',
        importRun: {
            runId: 'importRun_core_1',
            startedAt: '2026-06-17T00:00:00.000Z',
            summary: {
                recordsSucceeded: 1
            },
            failures: [],
            validationErrors: []
        }
    };

    diagnostics.finalizeRun(diagnosticsRequest, 'COMPLETED', {
        finishedAt: '2026-06-17T00:00:01.000Z'
    });
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(savedRequest.model.runId, 'importRun_core_1');
    assert.strictEqual(savedRequest.model.dataType, 'core');
    assert.strictEqual(diagnosticsRequest.importRun.history.persisted, true);

    delete global.SERVICE.DefaultImportRunService;
    let skipped = await historyService.recordRun({
        importRun: {
            runId: 'importRun_skipped',
            status: 'COMPLETED'
        }
    });
    assert.strictEqual(skipped.skipped, true);
    assert.strictEqual(skipped.entry.runId, 'importRun_skipped');

    console.log('Import run history service validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
