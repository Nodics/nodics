/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module import/test/testTenantImportIsolation
 * @description Proves that a dedicated test-tenant import dispatches records only to that tenant and cannot redirect default-only data into the test tenant or test-only data into the default tenant.
 * @layer test
 * @owner import
 * @override Project modules may add protected production-tenant fixtures while preserving strict tenant isolation.
 */

global.UTILS = { isArray: Array.isArray };
global.CLASSES = {
    DataImportError: function DataImportError(code, message) {
        this.code = code;
        this.message = message;
    }
};
global.NODICS = {
    getActiveTenants: function () {
        return ['default', 'nodicsTest'];
    }
};

const processor = require('../src/service/process/file/defaultFileDataImportProcessService');

function execute(request, calls) {
    global.SERVICE = {
        DefaultPipelineService: {
            start: function (_pipelineName, modelRequest) {
                calls.push({ tenant: modelRequest.tenant, code: modelRequest.dataModel.code });
                return Promise.resolve({ code: modelRequest.dataModel.code });
            }
        }
    };
    const service = Object.assign({}, processor, { LOG: { debug: function () {}, warn: function () {} } });
    return new Promise((resolve, reject) => service.processModels(request, {}, {
        nextSuccess: resolve,
        error: function (_request, _response, error) { reject(error); }
    }));
}

function createRequest(tenant, headerTenants) {
    return {
        tenant: tenant,
        fileName: 'tenantData_js',
        dataFiles: { tenantData_js: { processed: [] } },
        fileData: {
            header: { options: { tenants: headerTenants, userGroups: ['userGroup'] } },
            models: { record0: { code: 'isolated-record' } }
        },
        importRun: { summary: {} }
    };
}

(async function () {
    let calls = [];
    await execute(createRequest('nodicsTest', ['default', 'nodicsTest']), calls);
    assert.deepStrictEqual(calls, [{ tenant: 'nodicsTest', code: 'isolated-record' }]);

    calls = [];
    await execute(createRequest('nodicsTest', ['default']), calls);
    assert.deepStrictEqual(calls, []);

    calls = [];
    await execute(createRequest('default', ['nodicsTest']), calls);
    assert.deepStrictEqual(calls, []);

    console.log('Dedicated test-tenant import isolation validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
