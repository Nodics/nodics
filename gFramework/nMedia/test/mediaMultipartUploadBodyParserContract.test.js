/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/MediaMultipartUploadBodyParserContract
 * @description Validates nMedia ownership of multipart upload parsing and
 * confirms nRouter does not own media/file upload behavior.
 * @layer test
 * @owner nMedia
 * @override Later media parser implementations must keep upload limits and
 * file descriptor semantics under nMedia-owned configuration.
 */

const assert = require('assert');
const { Readable } = require('stream');

const multipartParser = require('../src/service/storage/defaultMediaMultipartUploadBodyParserHandlerService');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}

function multipartRequest(body, boundary) {
    const request = Readable.from(Buffer.from(body));
    request.headers = { 'content-type': 'multipart/form-data; boundary=' + boundary };
    return request;
}

function parse(request, uploadPolicy) {
    global.CLASSES = { NodicsError };
    global.CONFIG = {
        get: key => key === 'media' ? {
            upload: uploadPolicy || {
                maximumFileSizeBytes: 1024,
                maximumFiles: 1,
                maximumFields: 4,
                maximumFieldSizeBytes: 1024
            }
        } : undefined
    };
    return new Promise((resolve, reject) => {
        multipartParser.getBodyParser({})[0](request, {}, error => error ? reject(error) : resolve(request));
    });
}

(async function () {
    const boundary = '----nodicsMediaMultipartBoundary';
    const body = [
        '--' + boundary,
        'Content-Disposition: form-data; name="folderCode"',
        '',
        'importSources',
        '--' + boundary,
        'Content-Disposition: form-data; name="file"; filename="tenant.csv"',
        'Content-Type: text/csv',
        '',
        'code,name',
        '--' + boundary + '--',
        ''
    ].join('\r\n');

    const request = await parse(multipartRequest(body, boundary));
    assert.strictEqual(request.body.folderCode, 'importSources');
    assert.strictEqual(request.files.length, 1);
    assert.strictEqual(request.files[0].fieldName, 'file');
    assert.strictEqual(request.files[0].originalFileName, 'tenant.csv');
    assert.strictEqual(request.files[0].mimeType, 'text/csv');
    assert.strictEqual(request.files[0].buffer.toString(), 'code,name');

    const invalid = Readable.from(Buffer.from('{}'));
    invalid.headers = { 'content-type': 'application/json' };
    await assert.rejects(parse(invalid), error => error.code === 'ERR_MED_00010');

    await assert.rejects(parse(multipartRequest(body, boundary), {
        maximumFileSizeBytes: 2,
        maximumFiles: 1,
        maximumFields: 4,
        maximumFieldSizeBytes: 1024
    }), error => error.code === 'ERR_MED_00010');

    console.log('nMedia multipart upload body parser contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
