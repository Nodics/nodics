/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const { assertRouteContracts } = require('../../../../nRouter/test/routerContractTestUtils');

let calls = [];

global.FACADE = {
    DefaultImportRunHistoryFacade: {
        getImportRunHistory: function (request) {
            calls.push({
                operation: 'getImportRunHistory',
                request: request
            });
            return Promise.resolve({
                code: 'SUC_IMP_00000',
                data: []
            });
        },
        getImportRun: function (request) {
            calls.push({
                operation: 'getImportRun',
                request: request
            });
            return Promise.resolve({
                code: 'SUC_IMP_00000',
                data: {
                    runId: request.runId
                }
            });
        }
    }
};

const controller = require('../src/controller/history/defaultImportRunHistoryController');
const routerConfig = require('../src/router/routers');
const schemas = require('../src/schemas/schemas');

(async function () {
    let routes = assertRouteContracts(routerConfig, [
        {
            key: '/run/history',
            method: 'GET',
            controller: 'DefaultImportRunHistoryController',
            operation: 'getImportRunHistory',
            secured: true
        },
        {
            key: '/run/history/:runId',
            method: 'GET',
            controller: 'DefaultImportRunHistoryController',
            operation: 'getImportRun',
            secured: true
        }
    ]);

    assert(routes.length >= 2);
    assert.strictEqual(
        routerConfig.import.importRunHistory.getImportRunHistory.permission,
        'import.history.view'
    );
    assert.deepStrictEqual(
        routerConfig.import.importRunHistory.getImportRunHistory.permissions,
        ['import.core.run']
    );
    assert.strictEqual(
        routerConfig.import.importRunHistory.getImportRun.permission,
        'import.history.detail.view'
    );
    assert.deepStrictEqual(
        routerConfig.import.importRunHistory.getImportRun.permissions,
        ['import.core.run']
    );
    assert(schemas.import.importRun.model);
    assert(schemas.import.importRun.service.enabled);
    assert(schemas.import.importRun.router.enabled);
    assert.strictEqual(schemas.import.importRun.definition.runId.required, true);
    assert.strictEqual(schemas.import.importRun.definition.summary.type, 'object');

    let historyRequest = {
        httpRequest: {
            query: {
                status: 'COMPLETED',
                moduleName: 'profile'
            },
            body: {
                dataType: 'sample'
            }
        }
    };
    await controller.getImportRunHistory(historyRequest);
    assert.deepStrictEqual(historyRequest.filters, {
        status: 'COMPLETED',
        moduleName: 'profile',
        dataType: 'sample'
    });

    let detailRequest = {
        httpRequest: {
            params: {
                runId: 'importRun_sample_1'
            },
            query: {},
            body: {}
        }
    };
    let detail = await controller.getImportRun(detailRequest);
    assert.strictEqual(detail.data.runId, 'importRun_sample_1');
    assert.strictEqual(detailRequest.runId, 'importRun_sample_1');
    assert.deepStrictEqual(calls.map(call => call.operation), [
        'getImportRunHistory',
        'getImportRun'
    ]);

    console.log('Import run history controller and route contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
