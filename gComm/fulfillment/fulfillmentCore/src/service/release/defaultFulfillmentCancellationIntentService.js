/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module fulfillment/service/release/DefaultFulfillmentCancellationIntentService @description Secures module-to-module exact consignment cancellation intent. @layer service @owner fulfillment */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    cancel: function (request) { return SERVICE.DefaultFulfillmentConsignmentCancellationOrchestrationService.cancel(request); },
};
