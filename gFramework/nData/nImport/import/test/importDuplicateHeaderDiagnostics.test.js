/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');

let request = {
    importRun: {
        summary: {
            duplicateHeaders: 0
        },
        duplicateHeaders: []
    }
};

initializer.addDuplicateHeader(request, 'sharedHeader', 'customModule', 'sharedHeaderFile');

assert.strictEqual(request.importRun.summary.duplicateHeaders, 1);
assert.deepStrictEqual(request.importRun.duplicateHeaders[0], {
    headerName: 'sharedHeader',
    owningModule: 'customModule',
    headerFileName: 'sharedHeaderFile'
});
