/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/controller/defaultAiProviderOperationsController
 * @description Exposes secured sanitized AI provider operational diagnostics.
 * @layer controller
 * @owner aiProviders
 */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns provider readiness and bounded process-local telemetry. */
    diagnostics: function (request, callback) {
        const promise = SERVICE.DefaultAiProviderOperationsService.diagnostics(request)
            .then(data => ({ code: 'SUC_SYS_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    }
};
