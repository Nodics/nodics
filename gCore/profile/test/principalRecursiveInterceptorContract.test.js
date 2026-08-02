/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

const employeeInterceptor = require('../src/service/interceptors/defaultEmployeeGetInterceptorService');
const customerInterceptor = require('../src/service/interceptors/defaultCustomerGetInterceptorService');

async function run(handler, options) {
    const request = options === undefined ? {} : { options };
    await handler(request, {});
    return request.options;
}

(async function () {
    assert.deepStrictEqual(
        await run(employeeInterceptor.getEmployeeRecursive, undefined),
        { recursive: true },
        'employee reads should default to recursive when callers do not specify a preference',
    );
    assert.deepStrictEqual(
        await run(customerInterceptor.getCustomerRecursive, undefined),
        { recursive: true },
        'customer reads should default to recursive when callers do not specify a preference',
    );
    assert.deepStrictEqual(
        await run(employeeInterceptor.getEmployeeRecursive, { recursive: false }),
        { recursive: false },
        'employee reads must preserve explicit flat-read requests from Schema Workbench',
    );
    assert.deepStrictEqual(
        await run(customerInterceptor.getCustomerRecursive, { recursive: false }),
        { recursive: false },
        'customer reads must preserve explicit flat-read requests from Schema Workbench',
    );

    console.log('Profile principal recursive interceptor contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
