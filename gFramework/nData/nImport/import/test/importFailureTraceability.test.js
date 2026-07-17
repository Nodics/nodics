/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (this.isObject(value) && Object.keys(value).length === 0);
    }
};

const importDiagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');

let traceableError = {
    code: 'ERR_IMPORT_TRACE',
    message: 'Synthetic import failure',
    name: 'DataImportError',
    contexts: [],
    addContext: function (context) {
        this.contexts.push(context);
    },
    toJson: function () {
        return {
            code: this.code,
            message: this.message,
            name: this.name,
            contexts: this.contexts
        };
    }
};

let request = {
    importRun: {
        runId: 'import_trace_1',
        dataType: 'sample',
        tenant: 'test',
        summary: {},
        failures: []
    }
};

importDiagnostics.addFailure(request, {
    tenant: 'test',
    owningModule: 'catalogOwner',
    targetModule: 'catalogTarget',
    headerName: 'catalogHeader',
    fileName: 'catalog.csv',
    recordKey: 'record999',
    schemaName: 'Catalog',
    operation: 'saveAll',
    error: traceableError
});

assert.strictEqual(request.importRun.summary.recordsFailed, 1);
assert.strictEqual(request.importRun.failures.length, 1);
assert.strictEqual(request.importRun.failures[0].error.code, 'ERR_IMPORT_TRACE');
assert.strictEqual(request.importRun.failures[0].error.contexts.length, 1);
assert.deepStrictEqual(request.importRun.failures[0].error.contexts[0], {
    layer: 'import',
    runId: 'import_trace_1',
    dataType: 'sample',
    tenant: 'test',
    owningModule: 'catalogOwner',
    targetModule: 'catalogTarget',
    headerName: 'catalogHeader',
    fileName: 'catalog.csv',
    recordKey: 'record999',
    schemaName: 'Catalog',
    operation: 'saveAll'
});
