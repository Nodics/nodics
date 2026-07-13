/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
const calls = [];
global.FACADE = {
    TestExecutionFacade: {
        runUTest: function (input, callback) {
            calls.push({ operation: 'runUTest', input });
            callback(null, { code: 'SUC_TEST_UTEST' });
        },
        runNTest: function (input, callback) {
            calls.push({ operation: 'runNTest', input });
            callback(null, { code: 'SUC_TEST_NTEST' });
        }
    }
};

const controller = require('../src/controller/testExecutionController');

function invoke(operation, requestContext) {
    return new Promise((resolve, reject) => {
        controller[operation](requestContext, (error, success) => {
            if (error) {
                reject(error);
            } else {
                resolve(success);
            }
        });
    });
}

(async function () {
    let requestContext = {
        tenant: 'testTenant',
        entCode: 'testEnterprise',
        ignored: 'shouldNotLeak'
    };

    let uTestResponse = await invoke('runUTest', requestContext);
    let nTestResponse = await invoke('runNTest', requestContext);

    assert.strictEqual(uTestResponse.code, 'SUC_TEST_UTEST');
    assert.strictEqual(nTestResponse.code, 'SUC_TEST_NTEST');
    assert.deepStrictEqual(calls, [{
        operation: 'runUTest',
        input: {
            tenant: 'testTenant',
            entCode: 'testEnterprise'
        }
    }, {
        operation: 'runNTest',
        input: {
            tenant: 'testTenant',
            entCode: 'testEnterprise'
        }
    }]);

    console.log('System test runner controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
