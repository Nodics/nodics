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
