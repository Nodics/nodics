/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module fulfillment/controller/release/DefaultFulfillmentCancellationIntentController @description Maps internal exact cancellation requests to Fulfillment intent. @layer controller @owner fulfillment */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    cancel: function (request, callback) {
        let promise = FACADE.DefaultFulfillmentCancellationIntentFacade.cancel(request);
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
};
