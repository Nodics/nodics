/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module router/test/fileDownloadResponseHandlerContract
 * @description Validates the shared file-download response handler contract used by
 * modules that return governed binary files.
 * @layer test
 * @owner nRouter
 * @override Modules must return a file descriptor and reuse this response handler
 * instead of implementing parallel binary download response paths.
 */

const assert = require('assert');

class NodicsError extends Error {
    constructor(error) {
        if (typeof error === 'string') {
            super(error);
            this.code = error;
        } else {
            super(error && error.message || 'Download failed');
            this.code = error && error.code || error && error.defaultCode || 'ERR_SYS_00000';
            this.responseCode = error && error.responseCode || '500';
        }
        this.name = 'NodicsError';
        this.defaultCode = 'ERR_SYS_00000';
        this.responseCode = this.responseCode || '500';
    }
}

global.CLASSES = { NodicsError };
global.SERVICE = {
    DefaultJsonResponseHandlerService: {
        publicError: function (error) {
            return {
                responseCode: error.responseCode,
                code: error.code,
                name: error.name,
                message: error.message
            };
        }
    }
};

const handler = require('../src/service/handlers/response/defaultFileDownloadResponseHandlerService');
handler.LOG = { error: function () { } };

function createResponse() {
    return {
        headersSent: false,
        headers: {},
        statusCode: undefined,
        jsonPayload: undefined,
        downloadPath: undefined,
        downloadName: undefined,
        downloadCallback: undefined,
        typeValue: undefined,
        type: function (mimeType) {
            this.typeValue = mimeType;
            return this;
        },
        set: function (key, value) {
            this.headers[key] = value;
            return this;
        },
        status: function (status) {
            this.statusCode = status;
            return this;
        },
        json: function (payload) {
            JSON.stringify(payload);
            this.jsonPayload = payload;
            return this;
        },
        download: function (filePath, fileName, callback) {
            this.downloadPath = filePath;
            if (typeof fileName === 'function') {
                this.downloadCallback = fileName;
            } else {
                this.downloadName = fileName;
                this.downloadCallback = callback;
            }
            return this;
        }
    };
}

let successResponse = createResponse();
handler.handleSuccess({}, successResponse, {
    filePath: '/tmp/report.csv',
    fileName: 'report"\n.csv',
    mimeType: 'text/csv',
    cacheControl: 'no-store'
});
assert.strictEqual(successResponse.downloadPath, '/tmp/report.csv');
assert.strictEqual(successResponse.downloadName, 'report--.csv');
assert.strictEqual(successResponse.typeValue, 'text/csv');
assert.strictEqual(successResponse.headers['Cache-Control'], 'no-store');
assert.strictEqual(typeof successResponse.downloadCallback, 'function');

let transferErrorResponse = createResponse();
handler.handleSuccess({}, transferErrorResponse, { filePath: '/tmp/missing.csv', fileName: 'missing.csv' });
const circularError = new Error('File does not exist');
circularError.response = transferErrorResponse;
transferErrorResponse.downloadCallback(circularError);
assert.strictEqual(transferErrorResponse.statusCode, 500);
assert.strictEqual(transferErrorResponse.jsonPayload.code, 'ERR_SYS_00000');
assert.strictEqual(transferErrorResponse.jsonPayload.message, 'File does not exist');

let headersSentResponse = createResponse();
headersSentResponse.headersSent = true;
handler.handleError({}, headersSentResponse, new Error('late transfer failure'));
assert.strictEqual(headersSentResponse.jsonPayload, undefined);

let missingFileResponse = createResponse();
handler.handleSuccess({}, missingFileResponse, {});
assert.strictEqual(missingFileResponse.statusCode, 500);
assert.strictEqual(missingFileResponse.jsonPayload.code, 'ERR_SYS_00000');
assert.strictEqual(missingFileResponse.jsonPayload.message, 'File download response is missing filePath');

console.log('nRouter file download response handler contract validated');
