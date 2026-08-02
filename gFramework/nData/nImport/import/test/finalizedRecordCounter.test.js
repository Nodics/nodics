/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    generateHash: function (value) {
        return 'hash_' + JSON.parse(value).code;
    }
};
global.CLASSES = {
    DataError: function DataError(error, message) {
        this.error = error;
        this.message = message;
    }
};
global.SERVICE = {
    DefaultImportDiagnosticsService: require('../src/service/diagnostics/defaultImportDiagnosticsService')
};

const fileWriter = require('../../../dataCore/src/service/proc/writer/defaultFileWriterProcessService');

let request = {
    models: [
        {
            code: 'one'
        },
        {
            code: 'two'
        }
    ],
    importRun: {
        summary: {}
    }
};

Object.assign({}, fileWriter, {
    LOG: {
        debug: function () {}
    }
}).generateDataKey(request, {}, {
    nextSuccess: function () {},
    error: function (_request, _response, error) {
        throw error;
    }
});

assert.strictEqual(Object.keys(request.finalData).length, 2);
assert.strictEqual(request.importRun.summary.recordsFinalized, 2);
