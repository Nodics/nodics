/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultStockAvailabilityIntentController @description Maps the internal ON_HAND Availability route to its facade. @layer controller @owner inventory */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Handles one ON_HAND evaluation. */ evaluate: function (request, callback) { let promise = FACADE.DefaultStockAvailabilityIntentFacade.evaluate(request);
        return callback ? promise.then(result => callback(null, result)).catch(callback) : promise; }
};
