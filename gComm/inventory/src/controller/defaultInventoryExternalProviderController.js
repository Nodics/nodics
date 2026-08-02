/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/controller/DefaultInventoryExternalProviderController @description Maps internal provider commands to configured module transport. @layer controller @owner inventory */
module.exports = { /** Initializes controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Invokes provider. */ invoke: function (request, callback) { let promise = SERVICE.DefaultInventoryExternalProviderService.invoke(Object.assign({}, request, { provider: request.body || {} })).then(data => ({ code: 'SUC_INV_00007', data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
