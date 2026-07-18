/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/test/textResponseHandlerContract
 * @description Verifies the text response handler can return plain text and
 * structured textual artifacts with route-owned content type metadata.
 * @layer test
 * @owner nRouter
 * @override Project modules may override response handlers, but compatible
 * handlers must preserve raw text sending and metadata-driven content type.
 */
const assert = require('assert');

const handler = require('../src/service/handlers/response/defaultTextResponseHandlerService');

function createResponseRecorder() {
    return {
        contentType: undefined,
        payload: undefined,
        type: function (contentType) {
            this.contentType = contentType;
        },
        send: function (payload) {
            this.payload = payload;
        }
    };
}

let rawResponse = createResponseRecorder();
handler.handleSuccess({}, rawResponse, 'plain text');
assert.strictEqual(rawResponse.contentType, undefined);
assert.strictEqual(rawResponse.payload, 'plain text');

let htmlResponse = createResponseRecorder();
handler.handleSuccess({}, htmlResponse, {
    data: '<html></html>',
    metadata: {
        contentType: 'text/html; charset=utf-8'
    }
});
assert.strictEqual(htmlResponse.contentType, 'text/html; charset=utf-8');
assert.strictEqual(htmlResponse.payload, '<html></html>');

console.log('Text response handler contract validated');
