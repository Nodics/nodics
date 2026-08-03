/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/controller/DefaultStockSourcingIntentController @description Maps the internal Stock Sourcing intent route to its facade. @layer controller @owner inventory */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Handles one Stock Sourcing evaluation with optional callback compatibility. */
    evaluate: function (request, callback) {
        let promise = FACADE.DefaultStockSourcingIntentFacade.evaluate(request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    }
};
