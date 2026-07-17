/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nOtp/test/otpCapabilityContract
 * @description Verifies nOtp secured route metadata, controller body mapping, OTP/token service delegation, and OTP generation/expiry configuration handling.
 * @layer test
 * @owner nOtp
 * @override Project modules may override OTP delivery and token persistence in later layers, but must preserve secured routes, model mapping, token type stamping, and token validation delegation.
 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error);
            this.code = code;
            this.cause = error;
        }
    }
};

global.CONFIG = {
    get: function (key) {
        assert.strictEqual(key, 'token');
        return {
            OTP: {
                rangeStart: 1000,
                rangeEnd: 9000,
                validUpTo: 300
            }
        };
    }
};

const tokenCalls = [];
global.SERVICE = {
    DefaultOtpService: require('../src/service/DefaultOtpService'),
    DefaultTokenService: {
        generateToken: function (request) {
            tokenCalls.push({ operation: 'generateToken', model: Object.assign({}, request.model) });
            return Promise.resolve({ code: 'SUC_OTP_GENERATED', model: request.model });
        },
        validateToken: function (request) {
            tokenCalls.push({ operation: 'validateToken', model: Object.assign({}, request.model) });
            return Promise.resolve({ code: 'SUC_OTP_VALIDATED', model: request.model });
        }
    }
};

global.FACADE = {
    DefaultOtpFacade: require('../src/facade/DefaultOtpFacade')
};

const router = require('../src/router/routers');
const controller = require('../src/controller/DefaultOtpController');
const handler = require('../src/service/handler/defaultOtpHandlerService');
handler.LOG = { debug: function () {} };

function requestWithBody(body) {
    return {
        tenant: 'default',
        httpRequest: {
            body: body
        }
    };
}

(async function run() {
    assert.strictEqual(router.otp.generateOTP.generateOtp.secured, true);
    assert.strictEqual(router.otp.generateOTP.generateOtp.method, 'POST');
    assert.strictEqual(router.otp.generateOTP.generateOtp.key, '/generate');
    assert.deepStrictEqual(router.otp.generateOTP.generateOtp.accessGroups, ['userGroup']);
    assert.strictEqual(router.otp.generateOTP.generateOtp.controller, 'DefaultOtpController');
    assert.strictEqual(router.otp.generateOTP.generateOtp.operation, 'generateOtp');

    assert.strictEqual(router.otp.validateOTP.validateOtp.secured, true);
    assert.strictEqual(router.otp.validateOTP.validateOtp.method, 'POST');
    assert.strictEqual(router.otp.validateOTP.validateOtp.key, '/validate');
    assert.deepStrictEqual(router.otp.validateOTP.validateOtp.accessGroups, ['userGroup']);
    assert.strictEqual(router.otp.validateOTP.validateOtp.controller, 'DefaultOtpController');
    assert.strictEqual(router.otp.validateOTP.validateOtp.operation, 'validateOtp');

    const generateRequest = requestWithBody({ key: 'customer01', ops: 'checkout' });
    const generateResponse = await controller.generateOtp(generateRequest);
    assert.strictEqual(generateResponse.code, 'SUC_OTP_GENERATED');
    assert.strictEqual(generateRequest.model.type, 'OTP');
    assert.deepStrictEqual(tokenCalls[0], {
        operation: 'generateToken',
        model: { key: 'customer01', ops: 'checkout', type: 'OTP' }
    });

    const validateRequest = requestWithBody({ key: 'customer01', ops: 'checkout', value: '1234' });
    const validateResponse = await controller.validateOtp(validateRequest);
    assert.strictEqual(validateResponse.code, 'SUC_OTP_VALIDATED');
    assert.deepStrictEqual(tokenCalls[1], {
        operation: 'validateToken',
        model: { key: 'customer01', ops: 'checkout', value: '1234' }
    });

    let callbackPayload;
    await new Promise((resolve, reject) => {
        controller.generateOtp(requestWithBody({ key: 'callbackUser', ops: 'login' }), function (error, success) {
            if (error) return reject(error);
            callbackPayload = success;
            resolve();
        });
    });
    assert.strictEqual(callbackPayload.code, 'SUC_OTP_GENERATED');
    assert.strictEqual(tokenCalls[2].model.type, 'OTP');

    const originalRandom = Math.random;
    Math.random = function () { return 0.5; };
    assert.strictEqual(handler.generateToken({}), 5000);
    Math.random = originalRandom;

    const before = Date.now();
    const expiry = handler.generateExpiry({});
    const after = Date.now();
    assert(expiry instanceof Date);
    assert(expiry.getTime() >= before + 300000);
    assert(expiry.getTime() <= after + 300000);

    console.log('OTP capability contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
