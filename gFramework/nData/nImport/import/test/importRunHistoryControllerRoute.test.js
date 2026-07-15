/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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

    assert.strictEqual(routes.length, 2);
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
