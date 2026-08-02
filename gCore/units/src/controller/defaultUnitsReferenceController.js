/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module units/controller/DefaultUnitsReferenceController
 * @description Maps the internal exact conversion intent route to the Units facade.
 * @layer controller
 * @owner units
 * @override Later modules may replace transport mapping while preserving the secured Units conversion contract.
 */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Handles one exact conversion with optional callback compatibility. */
    convert: function (request, callback) {
        let promise = FACADE.DefaultUnitsReferenceFacade.convert(request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    }
};
