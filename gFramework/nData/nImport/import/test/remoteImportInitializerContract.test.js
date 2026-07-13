/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module import/test/remoteImportInitializerContract
 * @description Proves that remote imports accept only active tenant/module scope, resolve a configured adapter, and load trusted headers from active modules rather than executable remote definitions.
 * @layer test
 * @owner import
 * @override Projects may extend remote initialization while preserving trusted-header and active-scope enforcement.
 */

global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : undefined };
global.NODICS = {
    getActiveTenants: () => ['default', 'tenant-a'],
    isModuleActive: moduleName => ['profile', 'workflow'].includes(moduleName)
};
global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(code, message) { super(message); this.code = code; }
    }
};
let headerRequest;
global.SERVICE = {
    DefaultRemoteImportTransportService: { resolve: request => ({ sourceName: request.remoteImport.source }) },
    DefaultSystemDataImportInitializerService: {
        initImportRun: request => { request.importRun = { runId: 'remote-contract', summary: {} }; }
    },
    DefaultImportUtilityService: {
        getSystemDataHeaders: (modules, dataType) => {
            headerRequest = { modules, dataType };
            return Promise.resolve({ trustedHeader_js: ['/module/data/core/headers/trustedHeader.js'] });
        }
    }
};

const initializer = Object.assign({}, require('../src/service/remote/defaultRemoteDataImportInitializerService'), { LOG: { debug: () => {} } });

function validate(request) {
    let result = {};
    initializer.validateRequest(request, {}, {
        nextSuccess: () => { result.success = true; },
        error: (_request, _response, error) => { result.error = error; }
    });
    return result;
}

(async function () {
    const validRequest = { tenant: 'tenant-a', modules: ['profile'], remoteImport: { source: 'trusted' }, dataType: 'remote' };
    assert.strictEqual(validate(validRequest).success, true);
    assert.strictEqual(validRequest.importRun.runId, 'remote-contract');
    assert(validate({ tenant: 'inactive', modules: ['profile'], remoteImport: { source: 'trusted' } }).error);
    assert(validate({ tenant: 'tenant-a', modules: ['inactive'], remoteImport: { source: 'trusted' } }).error);

    validRequest.remoteImportPolicy = { headerDataType: 'core' };
    await new Promise((resolve, reject) => initializer.loadHeaderFileList(validRequest, {}, {
        nextSuccess: resolve,
        error: (_request, _response, error) => reject(error)
    }));
    assert.deepStrictEqual(headerRequest, { modules: ['profile'], dataType: 'core' });
    assert(validRequest.data.headerFiles.trustedHeader_js[0].startsWith('/module/'));

    const pipeline = require('../src/pipelines/pipelinesDefinition').remoteDataImportInitializerPipeline;
    const handlers = Object.values(pipeline.nodes).map(node => node.handler);
    assert(handlers.includes('DefaultSystemDataImportInitializerService.buildHeaderInstances'));
    assert(handlers.includes('DefaultLocalDataImportInitializerService.loadDataFileList'));
    assert(!handlers.some(handler => String(handler).includes('getExternal')));
    console.log('Remote import trusted-header initializer contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
