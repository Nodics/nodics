/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/src/controller/reference/defaultMediaReferenceLookupController
 * @description Maps secured internal media reference lookup requests to the nMedia facade.
 * @layer controller
 * @owner nMedia
 * @override Later modules may add transport-specific mapping while preserving secured service-token access.
 */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Handles one media reference validation request with optional callback compatibility. */
    validate: function (request, callback) {
        let promise = FACADE.DefaultMediaReferenceLookupFacade.validate(request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    }
};
