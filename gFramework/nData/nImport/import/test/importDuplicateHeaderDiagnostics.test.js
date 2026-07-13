/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
