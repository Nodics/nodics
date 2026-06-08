const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ExcelJS = require('exceljs');

const jsProcessor = require('../../jsImport/src/service/init/defaultJsFileDataProcessService');
const jsonProcessor = require('../../jsonImport/src/service/init/defaultJsonFileDataProcessService');
const csvProcessor = require('../../csvImport/src/service/init/defaultCsvFileDataProcessService');
const excelProcessor = require('../../excelImport/src/service/init/defaultExcelFileDataProcessService');

global.UTILS = {
    isBlank: value => value === null || value === undefined || value === ''
};
global.CLASSES = {
    DataImportError: function DataImportError(error, message) {
        this.error = error;
        this.message = message;
    }
};

let pipelineCalls = [];
const importDiagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');

global.CONFIG = {
    get: function (key) {
        if (key === 'data') {
            return {
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
                }
            };
        }
        return undefined;
    }
};
global.SERVICE = {
    DefaultImportDiagnosticsService: importDiagnostics,
    DefaultPipelineService: {
        start: function (pipelineName, request) {
            pipelineCalls.push({
                pipelineName: pipelineName,
                models: request.models.map(model => Object.assign({}, model)),
                version: request.outputPath.version
            });
            return Promise.resolve(true);
        }
    }
};

function createService(processor) {
    return Object.assign({}, processor, {
        LOG: {
            debug: function () {},
            warn: function () {}
        }
    });
}

function runProcessor(processor, files) {
    return new Promise((resolve, reject) => {
        let request = {
            files: files,
            header: {
                options: {
                    dataHandler: 'testDataHandlerPipeline'
                }
            },
            outputPath: {}
            ,
            importRun: {
                summary: {}
            }
        };
        createService(processor).processDataChunk(request, {}, {
            nextSuccess: function () {
                resolve(request);
            },
            error: function (_request, _response, error) {
                reject(error);
            }
        });
    });
}

async function createExcelFile(filePath) {
    let workbook = new ExcelJS.Workbook();
    let sheet = workbook.addWorksheet('Sheet1');
    sheet.addRow(['code', 'name']);
    sheet.addRow(['excelOne', 'Excel One']);
    sheet.addRow(['excelTwo', 'Excel Two']);
    await workbook.xlsx.writeFile(filePath);
}

(async function () {
    let tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-import-format-'));
    let jsFile = path.join(tmpDir, 'records.js');
    let jsonFile = path.join(tmpDir, 'records.json');
    let csvFile = path.join(tmpDir, 'records.csv');
    let excelFile = path.join(tmpDir, 'records.xlsx');

    fs.writeFileSync(jsFile, 'module.exports = { record0: { code: "jsOne" }, record1: { code: "jsTwo" } };');
    fs.writeFileSync(jsonFile, JSON.stringify([{ code: 'jsonOne' }, { code: 'jsonTwo' }]));
    fs.writeFileSync(csvFile, 'code,name\ncsvOne,Csv One\ncsvTwo,Csv Two\n');
    await createExcelFile(excelFile);

    pipelineCalls = [];
    let jsRequest = await runProcessor(jsProcessor, [jsFile]);
    assert.deepStrictEqual(pipelineCalls.map(call => call.models.map(model => model.code)), [['jsOne', 'jsTwo']]);
    assert.strictEqual(jsRequest.importRun.summary.recordsRead, 2);

    pipelineCalls = [];
    let jsonRequest = await runProcessor(jsonProcessor, [jsonFile]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['jsonOne', 'jsonTwo']);
    assert(pipelineCalls.every(call => !call.models.some(model => model && model.value)));
    assert.strictEqual(jsonRequest.importRun.summary.recordsRead, 2);

    pipelineCalls = [];
    let csvRequest = await runProcessor(csvProcessor, [csvFile]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['csvOne', 'csvTwo']);
    assert.strictEqual(csvRequest.importRun.summary.recordsRead, 2);

    pipelineCalls = [];
    let excelRequest = await runProcessor(excelProcessor, [excelFile]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['excelOne', 'excelTwo']);
    assert.strictEqual(excelRequest.importRun.summary.recordsRead, 2);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
