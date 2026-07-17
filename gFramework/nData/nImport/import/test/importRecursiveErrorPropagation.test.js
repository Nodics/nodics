/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/importRecursiveErrorPropagation
 * @description Verifies recursive import processing continues after skipped
 * records and propagates aggregate recursive errors with a concrete
 * DataImportError.
 * @layer test
 * @owner import
 * @override Project modules may add import recursion tests for custom processors
 * while preserving the framework recursive error propagation contract.
 */

const assert = require('assert');

global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || (error && error.code) || error;
            this.errors = [];
        }
        add(error) {
            this.errors.push(error);
        }
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'data') {
            return {
                dataImportPhasesLimit: 1
            };
        }
        return undefined;
    }
};

const dataImportProcessService = require('../src/service/process/init/defaultDataImportProcessService');

(async function () {
    let service = Object.assign({}, dataImportProcessService, {
        LOG: {
            debug: function () {},
            error: function () {}
        },
        processFiles: function (request, response) {
            response.errors = [{
                code: 'ERR_IMPORT_RECURSIVE_CHILD',
                message: 'Child import failure'
            }];
            return Promise.resolve(true);
        }
    });

    let capturedError;
    await new Promise((resolve, reject) => {
        service.processDataFiles({
            dataFiles: {
                products_js: {
                    done: false
                }
            },
            inputPath: {
                dataPath: '/tmp/nodics-import'
            }
        }, {}, {
            nextSuccess: function () {
                reject(new Error('Recursive import errors should not advance the pipeline'));
            },
            error: function (_request, _response, error) {
                capturedError = error;
                resolve(true);
            }
        });
    });

    assert(capturedError instanceof global.CLASSES.DataImportError);
    assert.strictEqual(capturedError.code, 'ERR_IMP_00000');
    assert.strictEqual(capturedError.errors.length, 1);
    assert.strictEqual(capturedError.errors[0].code, 'ERR_IMPORT_RECURSIVE_CHILD');

    console.log('Import recursive error propagation validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
