const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

global.UTILS = {
    isArray: Array.isArray,
    generateUniqueCode: function () {
        return 'test_run';
    }
};
String.prototype.toUpperCaseFirstChar = String.prototype.toUpperCaseFirstChar || function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
global.CLASSES = {
    DataImportError: function DataImportError(code, message) {
        this.code = code;
        this.message = message;
    }
};
global.CONFIG = {
    get: function (key) {
        if (key === 'data') {
            return {
                dataDirName: 'temp',
                fileTypeProcess: {
                    js: 'jsFileDataInitializerPipeline'
                }
            };
        }
        return undefined;
    }
};
global.NODICS = {
    getServerPath: function () {
        return os.tmpdir();
    },
    getModule: function (moduleName) {
        if (moduleName === 'sampleModule') {
            return {
                rawSchema: {
                    sampleSchema: {}
                }
            };
        }
        return undefined;
    },
    isModuleActive: function (moduleName) {
        return moduleName === 'sampleModule';
    }
};

const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');

function createService() {
    return Object.assign({}, initializer, {
        LOG: {
            debug: function () {}
        }
    });
}

function invoke(service, methodName, request) {
    return new Promise((resolve, reject) => {
        service[methodName](request, {}, {
            nextSuccess: function () {
                resolve({
                    type: 'next'
                });
            },
            stop: function (_request, _response, success) {
                resolve({
                    type: 'stop',
                    success: success
                });
            },
            error: function (_request, _response, error) {
                reject(error);
            }
        });
    });
}

(async function () {
    let tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-import-diagnostics-'));
    let headerFile = path.join(tmpDir, 'sampleHeader.js');
    let dataFile = path.join(tmpDir, 'sampleData.js');

    fs.writeFileSync(headerFile, [
        'module.exports = {',
        '  sampleModule: {',
        '    sampleHeader: {',
        '      options: {',
        '        enabled: true,',
        '        schemaName: "sampleSchema",',
        '        operation: "saveAll",',
        '        dataFilePrefix: "sampleData"',
        '      }',
        '    }',
        '    ,',
        '    missingDataHeader: {',
        '      options: {',
        '        enabled: true,',
        '        schemaName: "sampleSchema",',
        '        operation: "saveAll",',
        '        dataFilePrefix: "missingData"',
        '      }',
        '    }',
        '  }',
        '};'
    ].join('\n'));
    fs.writeFileSync(dataFile, 'module.exports = { record0: { code: "sample" } };');

    global.SERVICE = {
        DefaultImportUtilityService: {
            getSystemDataHeaders: function () {
                return Promise.resolve({
                    sampleHeader: [headerFile]
                });
            },
            getSystemDataFiles: function () {
                return Promise.resolve({
                    sampleData_js: [dataFile]
                });
            }
        },
        DefaultSampleSchemaService: {
            saveAll: function () {}
        }
    };

    let service = createService();
    let request = {
        dataType: 'sample',
        tenant: 'test',
        modules: ['sampleModule'],
        options: {
            validateOnly: true
        }
    };

    await invoke(service, 'validateRequest', request);
    await invoke(service, 'prepareInputPath', request);
    await invoke(service, 'prepareOutputPath', request);
    await invoke(service, 'loadHeaderFileList', request);
    await invoke(service, 'loadDataFileList', request);
    await invoke(service, 'resolveFileType', request);
    await invoke(service, 'buildHeaderInstances', request);
    let result = await invoke(service, 'assignDataFilesToHeader', request);

    assert.strictEqual(result.type, 'stop');
    assert.strictEqual(result.success.validationOnly, true);
    assert.strictEqual(result.success.importRun.runId, 'import_test_run');
    assert.strictEqual(result.success.importRun.dataType, 'sample');
    assert.strictEqual(result.success.importRun.tenant, 'test');
    assert.strictEqual(result.success.importRun.status, 'VALIDATED');
    assert.strictEqual(result.success.importRun.summary.enabledHeaders, 2);
    assert.strictEqual(result.success.importRun.summary.dataFilesDiscovered, 1);
    assert.strictEqual(result.success.importRun.summary.matchedDataFiles, 1);
    assert.strictEqual(result.success.importRun.summary.headersWithoutDataFiles, 1);
    assert.strictEqual(result.success.importRun.headers[0].owningModule, 'sampleModule');
    assert.strictEqual(result.success.importRun.headers[0].targetModule, 'sampleModule');
    assert.strictEqual(result.success.importRun.headers[0].schemaName, 'sampleSchema');
    assert.strictEqual(result.success.importRun.headers[0].operation, 'saveAll');
    assert.deepStrictEqual(result.success.importRun.dataFiles.unmatched, []);
    assert.deepStrictEqual(result.success.importRun.headers[0].matchedDataFiles, ['sampleData_js']);
    assert.strictEqual(result.success.importRun.headers[1].hasDataFiles, false);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
