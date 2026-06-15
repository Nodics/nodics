const assert = require('assert');

// @nodics-capability-behavior @nodics-area router
global.SERVICE = {
    DefaultStatusService: {
        get: function (statusCode) {
            if (statusCode === 'SUC_TEST_00000') {
                return {
                    code: '201',
                    message: 'Configured success message'
                };
            }
            if (statusCode === 'ERR_TEST_00000') {
                return {
                    code: '418',
                    message: 'Configured error message'
                };
            }
            throw new Error('Unexpected status code: ' + statusCode);
        }
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error) {
            let status = global.SERVICE.DefaultStatusService.get(error);
            super(status.message);
            this.code = error;
            this.responseCode = status.code;
        }

        toJson() {
            return {
                code: this.code,
                responseCode: this.responseCode,
                message: this.message
            };
        }
    }
};

const responseHandler = require('../src/service/handlers/response/defaultJsonResponseHandlerService');
responseHandler.LOG = {
    error: function () {}
};

function createResponse() {
    return {
        statusCode: undefined,
        payload: undefined,
        status: function (statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json: function (payload) {
            this.payload = payload;
            return this;
        }
    };
}

let successResponse = createResponse();
responseHandler.handleSuccess({}, successResponse, {
    code: 'SUC_TEST_00000',
    data: {
        value: true
    }
});

assert.strictEqual(successResponse.statusCode, '201');
assert.strictEqual(successResponse.payload.code, 'SUC_TEST_00000');
assert.strictEqual(successResponse.payload.responseCode, '201');
assert.strictEqual(successResponse.payload.message, 'Configured success message');
assert.deepStrictEqual(successResponse.payload.data, { value: true });

let errorResponse = createResponse();
responseHandler.handleError({}, errorResponse, new global.CLASSES.NodicsError('ERR_TEST_00000'));

assert.strictEqual(errorResponse.statusCode, '418');
assert.strictEqual(errorResponse.payload.code, 'ERR_TEST_00000');
assert.strictEqual(errorResponse.payload.responseCode, '418');
assert.strictEqual(errorResponse.payload.message, 'Configured error message');

console.log('JSON response status resolution validated');
