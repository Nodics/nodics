/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module payment/controller/cancellation/DefaultPaymentCancellationIntentController @description Maps internal cancellation payment execution to its facade. @layer controller @owner payment */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, execute: function (request, callback) { let promise = FACADE.DefaultPaymentCancellationIntentFacade.execute(request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
