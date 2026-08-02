/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/multiFormatDataProcessors.test
 * @description Validates JavaScript, JSON, CSV, and Excel import data processors against shared import diagnostics behavior.
 * @layer test
 * @owner nData
 * @override Projects may add focused processor fixtures beside this test while preserving import format behavior.
 */
const assert = require('assert');
const path = require('path');

const jsProcessor = require('../../jsImport/src/service/init/defaultJsFileDataProcessService');
const jsonProcessor = require('../../jsonImport/src/service/init/defaultJsonFileDataProcessService');
const csvProcessor = require('../../csvImport/src/service/init/defaultCsvFileDataProcessService');
const excelProcessor = require('../../excelImport/src/service/init/defaultExcelFileDataProcessService');

const fixtureRoot = path.join(__dirname, 'fixtures', 'multi-format');

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
    /**
     * Retrieves  information.
     *
     * @param {*} key Method input.
     * @returns {*} Method result.
     */
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
        /**
         * Processes  behavior.
         *
         * @param {*} pipelineName Method input.
         * @param {*} request Method input.
         * @returns {*} Method result.
         */
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
            /**
             * Records debug output for the test fixture.
             *
             * @returns {*} Method result.
             */
            debug: function () {},
            /**
             * Records warn output for the test fixture.
             *
             * @returns {*} Method result.
             */
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
            /**
             * Processes success behavior.
             *
             * @returns {*} Method result.
             */
            nextSuccess: function () {
                resolve(request);
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
    let jsFile = path.join(fixtureRoot, 'records.js');
    let jsUpdatedFile = path.join(fixtureRoot, 'records-updated.js');
    let jsonFile = path.join(fixtureRoot, 'records.json');
    let emptyJsonFile = path.join(fixtureRoot, 'empty-records.json');
    let jsonFileAfterEmpty = path.join(fixtureRoot, 'records-after-empty.json');
    let invalidJsonFile = path.join(fixtureRoot, 'invalid-records.json');
    let csvFile = path.join(fixtureRoot, 'records.csv');
    let emptyCsvFile = path.join(fixtureRoot, 'empty-records.csv');
    let csvFileAfterEmpty = path.join(fixtureRoot, 'records-after-empty.csv');
    let excelFile = path.join(fixtureRoot, 'records.xlsx');

    pipelineCalls = [];
    let jsRequest = await runProcessor(jsProcessor, [jsFile]);
    assert.deepStrictEqual(pipelineCalls.map(call => call.models.map(model => model.code)), [['jsOne', 'jsTwo']]);
    assert.strictEqual(jsRequest.importRun.summary.recordsRead, 2);

    pipelineCalls = [];
    let jsUpdatedRequest = await runProcessor(jsProcessor, [jsUpdatedFile]);
    assert.deepStrictEqual(pipelineCalls.map(call => call.models.map(model => model.code)), [['jsUpdated']]);
    assert.strictEqual(jsUpdatedRequest.importRun.summary.recordsRead, 1);

    pipelineCalls = [];
    let jsonRequest = await runProcessor(jsonProcessor, [jsonFile]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['jsonOne', 'jsonTwo']);
    assert(pipelineCalls.every(call => !call.models.some(model => model && model.value)));
    assert.strictEqual(jsonRequest.importRun.summary.recordsRead, 2);

    pipelineCalls = [];
    let jsonEmptyFirstRequest = await runProcessor(jsonProcessor, [emptyJsonFile, jsonFileAfterEmpty]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['jsonAfterEmpty']);
    assert.strictEqual(jsonEmptyFirstRequest.importRun.summary.recordsRead, 1);

    pipelineCalls = [];
    try {
        await runProcessor(jsonProcessor, [invalidJsonFile]);
        assert.fail('Expected malformed JSON import data to reject');
    } catch (error) {
        assert(error);
    }
    assert.deepStrictEqual(pipelineCalls, []);

    pipelineCalls = [];
    let csvRequest = await runProcessor(csvProcessor, [csvFile]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['csvOne', 'csvTwo']);
    assert.strictEqual(csvRequest.importRun.summary.recordsRead, 2);

    pipelineCalls = [];
    let csvEmptyFirstRequest = await runProcessor(csvProcessor, [emptyCsvFile, csvFileAfterEmpty]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['csvAfterEmpty']);
    assert.strictEqual(csvEmptyFirstRequest.importRun.summary.recordsRead, 1);

    pipelineCalls = [];
    let excelRequest = await runProcessor(excelProcessor, [excelFile]);
    assert.deepStrictEqual(pipelineCalls.flatMap(call => call.models.map(model => model.code)), ['excelOne', 'excelTwo']);
    assert.strictEqual(excelRequest.importRun.summary.recordsRead, 2);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
