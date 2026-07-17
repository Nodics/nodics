/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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

    assert.deepStrictEqual(calls.map(call => call.operation), [
        'importInitData',
        'importCoreData',
        'importSampleData',
        'importLocalData'
    ]);

    console.log('System import controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
