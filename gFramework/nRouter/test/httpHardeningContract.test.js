/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/test/HttpHardeningContract
 * @description Verifies that nRouter applies topology-aware HTTP hardening
 * through layered configuration for proxy trust, security headers, CORS, rate
 * limits, and body parser limit policy.
 * @layer test
 * @owner nRouter
 * @override Project modules may add equivalent tests for project-specific HTTP
 * policies while preserving the same property-driven extension contract.
 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area router
const policy = {
    enabled: true,
    trustProxy: 'loopback',
    body: {
        urlencoded: {
            extended: true,
            limit: '2kb',
            parameterLimit: 12
        },
        json: {
            limit: '3kb',
            strict: true
        },
        text: {
            limit: '4kb',
            type: 'text/plain'
        }
    },
    securityHeaders: {
        enabled: true,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        }
    },
    cors: {
        enabled: true,
        allowedOrigins: ['http://localhost:5173'],
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Nodics-Trace'],
        allowCredentials: true,
        maxAge: 120
    },
    rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 1,
        skipOptions: true,
        keyHeaders: ['x-forwarded-for']
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'httpHardening') {
            return policy;
        }
        return undefined;
    }
};

const service = Object.assign({}, require('../src/service/defaultHttpHardeningService'), {
    requestCounters: {}
});

global.SERVICE = {
    DefaultHttpHardeningService: service
};

const appConfig = require('../src/router/appConfig').default;

function createApp() {
    return {
        settings: {},
        middleware: [],
        set: function (key, value) {
            this.settings[key] = value;
        },
        use: function (handler) {
            this.middleware.push(handler);
        }
    };
}

function createResponse() {
    return {
        statusCode: 200,
        headers: {},
        ended: false,
        jsonBody: undefined,
        setHeader: function (key, value) {
            this.headers[key] = value;
        },
        end: function () {
            this.ended = true;
        },
        json: function (body) {
            this.jsonBody = body;
            this.ended = true;
        }
    };
}

function runMiddleware(req, res) {
    let continued = false;
    service.applyHttpMiddleware({
        use: function (handler) {
            handler(req, res, function () {
                continued = true;
            });
        }
    });
    return continued;
}

const app = createApp();
appConfig.initProperties(app);
assert.strictEqual(app.settings['trust proxy'], 'loopback', 'Proxy trust should come from httpHardening.trustProxy');
assert.strictEqual(app.middleware.length, 1, 'HTTP hardening middleware should be registered early');

const firstResponse = createResponse();
let firstContinued = runMiddleware({
    method: 'GET',
    headers: {
        origin: 'http://localhost:5173',
        'x-forwarded-for': '10.0.0.10'
    }
}, firstResponse);
assert.strictEqual(firstContinued, true, 'Allowed request should continue');
assert.strictEqual(firstResponse.headers['X-Content-Type-Options'], 'nosniff', 'Security header should be applied');
assert.strictEqual(firstResponse.headers['Access-Control-Allow-Origin'], 'http://localhost:5173', 'Allowed CORS origin should be echoed');
assert.strictEqual(firstResponse.headers['Access-Control-Allow-Credentials'], 'true', 'Credentials policy should be applied');
assert.strictEqual(firstResponse.headers.Vary, 'Origin', 'Credentialed CORS responses must vary by origin');
assert.strictEqual(firstResponse.headers['X-RateLimit-Remaining'], '0', 'Rate limit remaining header should be emitted');

const limitedResponse = createResponse();
let limitedContinued = runMiddleware({
    method: 'GET',
    headers: {
        origin: 'http://localhost:5173',
        'x-forwarded-for': '10.0.0.10'
    }
}, limitedResponse);
assert.strictEqual(limitedContinued, false, 'Second request over the limit should stop');
assert.strictEqual(limitedResponse.statusCode, 429, 'Rate limited request should use HTTP 429');
assert.strictEqual(limitedResponse.jsonBody.code, 'ERR_RTR_00004', 'Rate limit response should use router status code');
assert(Number(limitedResponse.headers['Retry-After']) >= 1, 'Rate limited request should tell clients when to retry');

const preflightResponse = createResponse();
let preflightContinued = runMiddleware({
    method: 'OPTIONS',
    headers: {
        origin: 'http://unknown.example'
    }
}, preflightResponse);
assert.strictEqual(preflightContinued, false, 'Preflight request should be completed by CORS middleware');
assert.strictEqual(preflightResponse.statusCode, 403, 'Disallowed preflight origin should fail closed');
assert.strictEqual(preflightResponse.ended, true, 'Preflight response should end');

const deniedActualResponse = createResponse();
let deniedActualContinued = runMiddleware({
    method: 'POST',
    headers: {
        origin: 'http://unknown.example',
        'x-forwarded-for': '10.0.0.11'
    }
}, deniedActualResponse);
assert.strictEqual(deniedActualContinued, false, 'Disallowed actual cross-origin requests must fail closed');
assert.strictEqual(deniedActualResponse.statusCode, 403);
assert.strictEqual(deniedActualResponse.jsonBody.code, 'ERR_RTR_00003');

const correlationResponse = createResponse();
let correlationContinued = runMiddleware({
    method: 'GET',
    headers: {
        origin: 'http://localhost:5173',
        'x-forwarded-for': '10.0.0.12',
        'x-request-id': 'axis-request-1',
        'x-correlation-id': 'axis-flow-1'
    }
}, correlationResponse);
assert.strictEqual(correlationContinued, true);
assert.strictEqual(correlationResponse.headers['X-Request-Id'], 'axis-request-1');
assert.strictEqual(correlationResponse.headers['X-Correlation-Id'], 'axis-flow-1');

assert.deepStrictEqual(service.getUrlencodedParserOptions(), policy.body.urlencoded, 'URL-encoded parser options should come from httpHardening');
assert.deepStrictEqual(service.getJsonParserOptions(), policy.body.json, 'JSON parser options should come from httpHardening');
assert.deepStrictEqual(service.getTextParserOptions(), policy.body.text, 'Text parser options should come from httpHardening');

console.log('HTTP hardening contract validated');
