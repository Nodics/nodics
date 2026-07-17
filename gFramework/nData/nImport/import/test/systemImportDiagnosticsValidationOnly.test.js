/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/systemImportDiagnosticsValidationOnly.test
 * @description Validates system import diagnostics behavior when data import runs in validation-only mode.
 * @layer test
 * @owner nData
 * @override Projects may add focused diagnostics fixtures beside this test while preserving validation-only import behavior.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

global.UTILS = {
    isArray: Array.isArray,
    /**
     * Generates unique code data.
     *
     * @returns {*} Method result.
     */
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
    /**
     * Retrieves  information.
     *
     * @param {*} key Method input.
     * @returns {*} Method result.
     */
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
    /**
     * Retrieves server path information.
     *
     * @returns {*} Method result.
     */
    getServerPath: function () {
        return os.tmpdir();
    },
    /**
     * Retrieves module information.
     *
     * @param {*} moduleName Method input.
     * @returns {*} Method result.
     */
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
    /**
     * Executes is module active behavior.
     *
     * @param {*} moduleName Method input.
     * @returns {*} Method result.
     */
    isModuleActive: function (moduleName) {
        return moduleName === 'sampleModule';
    }
};

const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');
const diagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');

function createService() {
    return Object.assign({}, initializer, {
        LOG: {
            /**
             * Records debug output for the test fixture.
             *
             * @returns {*} Method result.
             */
            debug: function () {}
        }
    });
}

function invoke(service, methodName, request) {
    return new Promise((resolve, reject) => {
        service[methodName](request, {}, {
            /**
             * Processes success behavior.
             *
             * @returns {*} Method result.
             */
            nextSuccess: function () {
                resolve({
                    type: 'next'
                });
            },
            /**
             * Processes  behavior.
             *
             * @param {*} _request Method input.
             * @param {*} _response Method input.
             * @param {*} success Method input.
             * @returns {*} Method result.
             */
            stop: function (_request, _response, success) {
                resolve({
                    type: 'stop',
                    success: success
                });
            },
            /**
             * Records error output for the test fixture.
             *
             * @param {*} _request Method input.
             * @param {*} _response Method input.
             * @param {*} error Method input.
             * @returns {*} Method result.
             */
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
            /**
             * Retrieves system data headers information.
             *
             * @returns {*} Method result.
             */
            getSystemDataHeaders: function () {
                return Promise.resolve({
                    sampleHeader: [headerFile]
                });
            },
            /**
             * Retrieves system data files information.
             *
             * @returns {*} Method result.
             */
            getSystemDataFiles: function () {
                return Promise.resolve({
                    sampleData_js: [dataFile]
                });
            }
        },
        DefaultImportDiagnosticsService: diagnostics,
        DefaultSampleSchemaService: {
            /**
             * Updates all information.
             *
             * @returns {*} Method result.
             */
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
    assert.strictEqual(result.success.importRun.summary.totalFilesDiscovered, 1);
    assert.strictEqual(result.success.importRun.summary.totalHeaders, 2);
    assert.strictEqual(result.success.importRun.failureCount, 0);
    assert.strictEqual(result.success.importRun.validationErrorCount, 0);
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
