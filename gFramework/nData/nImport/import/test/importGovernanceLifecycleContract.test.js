/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/importGovernanceLifecycleContract
 * @description Verifies import run checksums, duplicate-run protection, retry metadata, and rollback hook reporting through existing import diagnostics/history services.
 * @layer test
 * @owner import
 * @override Project modules may add provider-specific retry and rollback behavior, but must keep run fingerprints, duplicate detection, and rollback evidence in import run history.
 */

const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        if (key === 'data') {
            return {
                importGovernance: {
                    duplicateProtection: true,
                    duplicateStatuses: ['COMPLETED', 'VALIDATED'],
                    retry: {
                        maxAttempts: 3
                    },
                    rollback: {
                        enabled: true
                    }
                }
            };
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

const saves = [];
const duplicateQueries = [];
let duplicateResults = [];

global.SERVICE = {
    DefaultImportRunService: {
        get: function (request) {
            duplicateQueries.push(request);
            return Promise.resolve({
                result: duplicateResults
            });
        },
        save: function (request) {
            saves.push(request);
            return Promise.resolve({
                success: true,
                result: [request.model]
            });
        }
    }
};

const historyService = require('../src/service/history/defaultImportRunHistoryService');
const diagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');
historyService.LOG = { warn: function () {}, error: function () {} };
global.SERVICE.DefaultImportRunHistoryService = historyService;

function buildRequest(runId) {
    return {
        tenant: 'tenantA',
        dataType: 'sample',
        modules: ['order', 'profile'],
        retry: {
            attempt: 1
        },
        rollbackHooks: [
            function restoreStagedFiles(request) {
                request.restored = true;
                return 'restored';
            },
            {
                code: 'clearGeneratedFiles',
                execute: function (request) {
                    request.cleared = true;
                    return 'cleared';
                }
            }
        ],
        importRun: {
            runId: runId,
            status: 'COMPLETED',
            startedAt: '2026-07-14T00:00:00.000Z',
            dataFiles: {
                discovered: [{
                    path: 'b.json',
                    checksum: 'bbbb'
                }, {
                    path: 'a.json',
                    checksum: 'aaaa'
                }]
            },
            summary: {
                recordsSucceeded: 2
            }
        }
    };
}

(async function run() {
    let firstRequest = buildRequest('importRun_sample_1');
    let prepared = historyService.prepareImportRunRecord(firstRequest);
    assert.strictEqual(prepared.tenant, 'tenantA');
    assert.strictEqual(prepared.checksum, historyService.sha256('aaaa|bbbb'));
    assert.strictEqual(prepared.fingerprint, historyService.createImportRunFingerprint(prepared));
    assert.strictEqual(prepared.retry.attempt, 1);
    assert.strictEqual(prepared.retry.maxAttempts, 3);
    assert.strictEqual(prepared.retry.retryable, true);
    assert.deepStrictEqual(prepared.rollback, {
        enabled: true,
        hookCount: 2,
        status: 'PENDING'
    });

    duplicateResults = [];
    let saved = await historyService.recordRun(firstRequest);
    assert.strictEqual(saved.success, true);
    assert.strictEqual(saves.length, 1);
    assert.strictEqual(saves[0].model.checksum, prepared.checksum);
    assert.strictEqual(saves[0].model.fingerprint, prepared.fingerprint);
    assert.deepStrictEqual(duplicateQueries[0].query.status.$in, ['COMPLETED', 'VALIDATED']);
    assert.strictEqual(duplicateQueries[0].query.fingerprint, prepared.fingerprint);

    duplicateResults = [{
        runId: 'existingRun',
        code: 'existingRun',
        status: 'COMPLETED',
        fingerprint: prepared.fingerprint
    }];
    let duplicate = await historyService.recordRun(buildRequest('importRun_sample_2'));
    assert.strictEqual(duplicate.skipped, true);
    assert.strictEqual(duplicate.reason, 'DUPLICATE_IMPORT_RUN');
    assert.strictEqual(duplicate.duplicate.runId, 'existingRun');
    assert.strictEqual(saves.length, 1, 'Duplicate import run must not be persisted again');

    let failedRequest = buildRequest('importRun_sample_failed');
    failedRequest.importRun.failures = [{ message: 'Record failed' }];
    let finalized = diagnostics.finalizeRun(failedRequest, 'COMPLETED', {
        finishedAt: '2026-07-14T00:00:01.000Z'
    });
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(finalized.status, 'FAILED');
    assert.strictEqual(finalized.rollback.status, 'COMPLETED');
    assert.strictEqual(finalized.rollback.hookCount, 2);
    assert.deepStrictEqual(finalized.rollback.results.map(result => result.status), ['COMPLETED', 'COMPLETED']);
    assert.strictEqual(failedRequest.restored, true);
    assert.strictEqual(failedRequest.cleared, true);

    console.log('Import governance lifecycle contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
