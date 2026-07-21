/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
