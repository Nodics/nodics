/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isBlank: value => value === null || value === undefined || value === ''
};
global.CLASSES = {
    NodicsError: function NodicsError(code) {
        this.code = code;
    }
};

const requestPipeline = require('../src/service/request/defaultRequestHandlerPipelineService');

function createRequest(headers) {
    return {
        originalUrl: '/grayframes/gfapi/v0/ping',
        httpRequest: {
            get: name => headers[name.toLowerCase()]
        }
    };
}

function createService() {
    return Object.assign({}, requestPipeline, {
        LOG: {
            debug: function () {},
            warn: function () {}
        }
    });
}

function parseHeaders(headers) {
    let service = createService();
    let request = createRequest(headers);
    let state = {};
    service.parseHeader(request, {}, {
        error: function (_request, _response, error) {
            state.error = error;
        },
        nextSuccess: function () {
            state.success = true;
        }
    });
    return {
        request: request,
        state: state
    };
}

let legacyApiKey = parseHeaders({
    apikey: 'legacy-key',
    entcode: 'default'
});
assert.strictEqual(legacyApiKey.state.success, true);
assert.strictEqual(legacyApiKey.request.apiKey, 'legacy-key');
assert.strictEqual(legacyApiKey.request.entCode, 'default');
assert.deepStrictEqual(legacyApiKey.request.auth.legacyHeaders, ['apiKey', 'entCode']);

let modernApiKey = parseHeaders({
    'x-api-key': 'modern-key',
    'x-enterprise-code': 'default'
});
assert.strictEqual(modernApiKey.state.success, true);
assert.strictEqual(modernApiKey.request.apiKey, 'modern-key');
assert.strictEqual(modernApiKey.request.auth.source, 'x-api-key');
assert.strictEqual(modernApiKey.request.auth.deprecated, false);

let modernBearer = parseHeaders({
    authorization: 'Bearer token-value'
});
assert.strictEqual(modernBearer.state.success, true);
assert.strictEqual(modernBearer.request.authToken, 'token-value');
assert.strictEqual(modernBearer.request.auth.type, 'bearer');
assert.strictEqual(modernBearer.request.auth.source, 'Authorization');

let legacyToken = parseHeaders({
    authtoken: 'legacy-token'
});
assert.strictEqual(legacyToken.state.success, true);
assert.strictEqual(legacyToken.request.authToken, 'legacy-token');
assert.strictEqual(legacyToken.request.auth.source, 'authToken');
assert.deepStrictEqual(legacyToken.request.auth.legacyHeaders, ['authToken']);

let missingAuth = parseHeaders({});
assert.strictEqual(missingAuth.state.error.code, 'ERR_AUTH_00002');

let multipleCredentials = parseHeaders({
    'x-api-key': 'modern-key',
    authorization: 'Bearer token-value'
});
assert.strictEqual(multipleCredentials.state.success, true);
assert.strictEqual(multipleCredentials.request.apiKey, undefined);
assert.strictEqual(multipleCredentials.request.authToken, undefined);
assert.strictEqual(multipleCredentials.request.auth.credentials.length, 2);

