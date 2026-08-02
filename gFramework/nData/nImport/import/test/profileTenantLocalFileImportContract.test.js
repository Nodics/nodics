/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/profileTenantLocalFileImportContract
 * @description Validates the Profile-owned tenant sample data import use case for CSV and XLSX files with real headers.
 * @layer test
 * @owner nData
 * @override Projects may add their own module-owned sample import data while preserving header-owned schema routing and file processor dispatch.
 */
const assert = require('assert');
const path = require('path');

const localInitializer = require('../src/service/local/defaultLocalDataImportInitializerService');
const importUtility = require('../src/service/import/defaultImportUtilityService');
const importDiagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');
const csvProcessor = require('../../csvImport/src/service/init/defaultCsvFileDataProcessService');
const excelProcessor = require('../../excelImport/src/service/init/defaultExcelFileDataProcessService');

global.UTILS = {
    isBlank: value => value === null || value === undefined || value === ''
};

global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message) {
            super(message || (error && error.message) || error);
            this.code = error && error.code ? error.code : error;
        }
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'data') {
            return {
                dataDirName: 'temp',
                readBufferSize: 1,
                importDataConvertEncoding: 'utf8',
                csvTypeParserOptions: {
                    output: 'json',
                    trim: true,
                    ignoreEmpty: true
                },
                excelTypeParserOptions: {
                    sheet: 1,
                    isColOriented: false,
                    omitEmptyFields: false,
                    convertTextToNumber: true
                },
                fileTypeProcess: {
                    csv: 'csvFileDataInitializerPipeline',
                    xlsx: 'excelFileDataInitializerPipeline'
                }
            };
        }
        return undefined;
    }
};

global.NODICS = {
    getServerPath: function () {
        return path.join(__dirname, 'tmp');
    }
};

function createService(definition) {
    return Object.assign({}, definition, {
        LOG: {
            debug: function () {},
            warn: function () {}
        }
    });
}

function invoke(service, methodName, request) {
    return new Promise((resolve, reject) => {
        service[methodName](request, {}, {
            nextSuccess: function () {
                resolve({ type: 'next' });
            },
            stop: function (_request, _response, success) {
                resolve({ type: 'stop', success: success });
            },
            error: function (_request, _response, error) {
                reject(error);
            }
        });
    });
}

async function prepareLocalImport() {
    let rootPath = path.join(process.cwd(), 'gCore', 'profile', 'data', 'sample', 'tenant');
    let request = {
        inputPath: {
            rootPath: rootPath
        },
        outputPath: {
            rootPath: path.join(__dirname, 'tmp', 'profile-tenant-sample-import')
        },
        authData: {
            userGroups: ['importTestUserGroup']
        }
    };
    let service = createService(localInitializer);

    global.SERVICE = {
        DefaultImportUtilityService: importUtility,
        DefaultImportDiagnosticsService: importDiagnostics,
        DefaultFileHandlerService: {
            moveSyncToProcessing: function (filePath) {
                return filePath;
            }
        }
    };

    await invoke(service, 'validateRequest', request);
    await invoke(service, 'prepareInputPath', request);
    await invoke(service, 'prepareOutputPath', request);
    await invoke(service, 'loadHeaderFileList', request);
    await invoke(service, 'buildHeaderInstances', request);
    await invoke(service, 'loadDataFileList', request);
    await invoke(service, 'resolveFileType', request);

    return request;
}

async function processPreparedImport(request, processor, headerName, dataFileName) {
    let header = request.data.headers[headerName];
    let dataFile = header.dataFiles[dataFileName];
    let capturedModels = [];

    global.SERVICE.DefaultPipelineService = {
        start: function (pipelineName, pipelineRequest) {
            capturedModels = capturedModels.concat(pipelineRequest.models.map(model => Object.assign({}, model)));
            assert.strictEqual(pipelineName, 'schemaDataHandlerPipeline');
            assert.strictEqual(pipelineRequest.header.options.schemaName, 'tenant');
            assert.strictEqual(pipelineRequest.header.options.operation, 'saveAll');
            assert.deepStrictEqual(pipelineRequest.header.options.userGroups, ['importTestUserGroup']);
            return Promise.resolve(true);
        }
    };

    await new Promise((resolve, reject) => {
        createService(processor).processDataChunk({
            files: dataFile.list,
            header: header,
            outputPath: {},
            importRun: {
                summary: {}
            }
        }, {}, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (_request, _response, error) {
                reject(error);
            }
        });
    });

    return {
        headerName: headerName,
        dataFileName: dataFileName,
        dataFile: dataFile,
        models: capturedModels
    };
}

(async function () {
    let request = await prepareLocalImport();
    assert.deepStrictEqual(Object.keys(request.data.headers).sort(), [
        'defaultTenantCsv',
        'defaultTenantExcel',
        'defaultTenantLegacyExcel'
    ]);
    assert.strictEqual(request.data.headers.defaultTenantCsv.options.fileName, 'tenantCsvDataHeader_js');
    assert.deepStrictEqual(Object.keys(request.data.headers.defaultTenantCsv.dataFiles), ['defaultTenantCsvData_csv']);
    assert.strictEqual(request.data.headers.defaultTenantCsv.dataFiles.defaultTenantCsvData_csv.type, 'csv');
    assert.strictEqual(request.data.headers.defaultTenantExcel.options.fileName, 'tenantExcelDataHeader_js');
    assert.deepStrictEqual(Object.keys(request.data.headers.defaultTenantExcel.dataFiles), ['defaultTenantExcelData_xlsx']);
    assert.strictEqual(request.data.headers.defaultTenantExcel.dataFiles.defaultTenantExcelData_xlsx.type, 'xlsx');
    assert.strictEqual(request.data.headers.defaultTenantLegacyExcel.options.fileName, 'tenantLegacyExcelDataHeader_js');
    assert.deepStrictEqual(Object.keys(request.data.headers.defaultTenantLegacyExcel.dataFiles), ['defaultTenantLegacyExcelData_xls']);
    assert.strictEqual(request.data.headers.defaultTenantLegacyExcel.dataFiles.defaultTenantLegacyExcelData_xls.type, 'xls');

    let csvResult = await processPreparedImport(request, csvProcessor, 'defaultTenantCsv', 'defaultTenantCsvData_csv');
    assert.strictEqual(csvResult.headerName, 'defaultTenantCsv');
    assert.strictEqual(csvResult.dataFileName, 'defaultTenantCsvData_csv');
    assert.deepStrictEqual(csvResult.models.map(model => model.code), [
        'testOne',
        'testTwo',
        'testThree',
        'testFour',
        'testFive',
        undefined,
        'testSeven',
        'testEight',
        'testNine',
        'testTen'
    ]);
    assert.strictEqual(csvResult.models[0].description, 'This tenant is just for testing purpose Import');
    assert.strictEqual(csvResult.models[5].description, 'Intentional failure row missing tenant code');
    assert.strictEqual(csvResult.models[7].active, 'notABoolean');

    let xlsxResult = await processPreparedImport(request, excelProcessor, 'defaultTenantExcel', 'defaultTenantExcelData_xlsx');
    assert.strictEqual(xlsxResult.headerName, 'defaultTenantExcel');
    assert.strictEqual(xlsxResult.dataFileName, 'defaultTenantExcelData_xlsx');
    assert.deepStrictEqual(xlsxResult.models.map(model => model.code), ['testOne']);
    assert.strictEqual(xlsxResult.models[0].description, 'This tenant is just for testing purpose');

    console.log('Profile tenant sample CSV and XLSX file import contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
