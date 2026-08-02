/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    }
};

const calls = [];
global.FACADE = {
    DefaultImportFacade: {
        importInitData: function (request) {
            calls.push({ operation: 'importInitData', request });
            return Promise.resolve({ operation: 'importInitData' });
        },
        importCoreData: function (request) {
            calls.push({ operation: 'importCoreData', request });
            return Promise.resolve({ operation: 'importCoreData' });
        },
        importSampleData: function (request) {
            calls.push({ operation: 'importSampleData', request });
            return Promise.resolve({ operation: 'importSampleData' });
        },
        importLocalData: function (request) {
            calls.push({ operation: 'importLocalData', request });
            return Promise.resolve({ operation: 'importLocalData' });
        },
        importMediaData: function (request) {
            calls.push({ operation: 'importMediaData', request });
            return Promise.resolve({ operation: 'importMediaData' });
        }
    }
};

const controller = require('../src/controller/import/DefaultImportController');

(async function () {
    let initRequest = {
        httpRequest: {
            body: {
                modules: ['profile'],
                path: 'data/import/init',
                options: {
                    validationOnly: true
                }
            }
        }
    };
    await controller.importInitData(initRequest);
    assert.deepStrictEqual(initRequest.modules, ['profile']);
    assert.strictEqual(initRequest.path, 'data/import/init');
    assert.deepStrictEqual(initRequest.options, { validationOnly: true });

    let coreRequest = {
        httpRequest: {
            body: {
                modules: ['cronjob'],
                path: 'data/import/core',
                options: {
                    dryRun: true
                }
            }
        }
    };
    await controller.importCoreData(coreRequest);
    assert.deepStrictEqual(coreRequest.modules, ['cronjob']);
    assert.strictEqual(coreRequest.path, 'data/import/core');
    assert.deepStrictEqual(coreRequest.options, { dryRun: true });

    let sampleRequest = {
        httpRequest: {
            body: {
                modules: ['catalog'],
                path: 'data/import/sample',
                options: {
                    tenant: 'testTenant'
                }
            }
        }
    };
    await controller.importSampleData(sampleRequest);
    assert.deepStrictEqual(sampleRequest.modules, ['catalog']);
    assert.strictEqual(sampleRequest.path, 'data/import/sample');
    assert.deepStrictEqual(sampleRequest.options, { tenant: 'testTenant' });

    let localRequest = {
        httpRequest: {
            body: {
                inputPath: {
                    rootPath: '/tmp/nodics/import'
                },
                importFinalizeData: false
            }
        }
    };
    await controller.importLocalData(localRequest);
    assert.deepStrictEqual(localRequest.inputPath, { rootPath: '/tmp/nodics/import' });
    assert.strictEqual(localRequest.importFinalizeData, false);

    let mediaRequest = {
        httpRequest: {
            body: {
                mediaCode: 'tenant-upload',
                definitionCode: 'tenantCsv',
                options: {
                    validateOnly: true
                }
            }
        }
    };
    await controller.importMediaData(mediaRequest);
    assert.strictEqual(mediaRequest.mediaCode, 'tenant-upload');
    assert.strictEqual(mediaRequest.definitionCode, 'tenantCsv');
    assert.deepStrictEqual(mediaRequest.source, {
        type: 'MEDIA',
        mediaCode: 'tenant-upload',
        definitionCode: 'tenantCsv'
    });
    assert.deepStrictEqual(mediaRequest.options, { validateOnly: true });

    let genericMediaRequest = {
        httpRequest: {
            body: {
                mediaCode: 'tenant-generic-upload',
                moduleName: 'profile',
                schemaName: 'tenant',
                operation: 'saveAll',
                validationOnly: true
            }
        }
    };
    await controller.importMediaData(genericMediaRequest);
    assert.strictEqual(genericMediaRequest.mediaCode, 'tenant-generic-upload');
    assert.strictEqual(genericMediaRequest.definitionCode, undefined);
    assert.strictEqual(genericMediaRequest.moduleName, 'profile');
    assert.strictEqual(genericMediaRequest.schemaName, 'tenant');
    assert.deepStrictEqual(genericMediaRequest.source, {
        type: 'MEDIA',
        mediaCode: 'tenant-generic-upload'
    });
    assert.strictEqual(genericMediaRequest.validationOnly, true);

    assert.deepStrictEqual(calls.map(call => call.operation), [
        'importInitData',
        'importCoreData',
        'importSampleData',
        'importLocalData',
        'importMediaData',
        'importMediaData'
    ]);

    console.log('System import controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
