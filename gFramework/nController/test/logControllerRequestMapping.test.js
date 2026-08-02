/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
const calls = [];
global.FACADE = {
    DefaultLogFacade: {
        changeLogLevel: function (request) {
            calls.push(request);
            return Promise.resolve({
                code: 'SUC_SYS_00000'
            });
        }
    }
};

const controller = require('../src/controller/log/defaultLogController');

(async function () {
    let request = {
        httpRequest: {
            body: {
                entityName: 'DefaultImportService',
                logLevel: 'debug'
            }
        }
    };

    let response = await controller.changeLogLevel(request);
    assert.strictEqual(response.code, 'SUC_SYS_00000');
    assert.strictEqual(request.entityName, 'DefaultImportService');
    assert.strictEqual(request.logLevel, 'debug');
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0], request);

    console.log('System log controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
