/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module gCore/cronjob/test/cronJobControllerRequestMapping.test
 * @description Validates cronjob controller request mapping for query-based and job-code-based lifecycle operations.
 * @layer test
 * @owner cronjob
 * @override Project modules may add controller mapping tests for custom cronjob endpoints while preserving this base route behavior.
 */

const calls = [];

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    }
};

global.CLASSES = {
    CronJobError: class CronJobError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

global.FACADE = {
    DefaultCronJobFacade: {}
};

[
    'createJob',
    'updateJob',
    'runJob',
    'startJob',
    'stopJob',
    'removeJob',
    'pauseJob',
    'resumeJob'
].forEach((operation) => {
    global.FACADE.DefaultCronJobFacade[operation] = function (request) {
        calls.push({ operation, request });
        return Promise.resolve({ code: 'SUC_' + operation });
    };
});

function httpRequest(body, params, headers) {
    return {
        body: body || {},
        params: params || {},
        get: function (key) {
            return headers && headers[key];
        }
    };
}

const controller = require('../src/controller/defaultCronJobController');
controller.LOG = {
    error: function () {}
};

async function assertQueryOperation(operation, body, params, expectedQuery, expectedRecursive) {
    calls.length = 0;
    const request = {
        httpRequest: httpRequest(body, params, { recursive: true }),
        tenant: 'tenantA'
    };

    const response = await controller[operation](request);

    assert.strictEqual(response.code, 'SUC_' + operation);
    assert.strictEqual(calls.length, 1, `${operation} should call facade`);
    assert.strictEqual(calls[0].operation, operation);
    assert.deepStrictEqual(calls[0].request.query, expectedQuery);
    if (expectedRecursive !== undefined) {
        assert.strictEqual(calls[0].request.options.recursive, expectedRecursive);
    }
}

async function assertJobCodeOperation(operation, body, params, expectedJobCodes) {
    calls.length = 0;
    const request = {
        httpRequest: httpRequest(body, params),
        tenant: 'tenantA'
    };

    const response = await controller[operation](request);

    assert.strictEqual(response.code, 'SUC_' + operation);
    assert.strictEqual(calls.length, 1, `${operation} should call facade`);
    assert.strictEqual(calls[0].operation, operation);
    assert.deepStrictEqual(calls[0].request.jobCodes, expectedJobCodes);
}

(async function run() {
    await assertQueryOperation('createJob', { query: { active: true } }, {}, { active: true }, true);
    await assertQueryOperation('createJob', {}, { jobCode: 'indexProducts' }, { code: 'indexProducts' }, true);
    await assertQueryOperation('updateJob', { query: { code: 'indexProducts' } }, {}, { code: 'indexProducts' }, true);
    await assertQueryOperation('runJob', {}, { jobCode: 'publishEvents' }, { code: 'publishEvents' });

    await assertJobCodeOperation('startJob', {}, { jobCode: 'jobA' }, ['jobA']);
    await assertJobCodeOperation('startJob', ['jobA', 'jobB'], {}, ['jobA', 'jobB']);
    await assertJobCodeOperation('stopJob', {}, { jobCode: 'jobA' }, ['jobA']);
    await assertJobCodeOperation('removeJob', {}, { jobCode: 'jobA' }, ['jobA']);
    await assertJobCodeOperation('pauseJob', {}, { jobCode: 'jobA' }, ['jobA']);
    await assertJobCodeOperation('resumeJob', ['jobA', 'jobB'], {}, ['jobA', 'jobB']);

    console.log('CronJob controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
