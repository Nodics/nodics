/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
