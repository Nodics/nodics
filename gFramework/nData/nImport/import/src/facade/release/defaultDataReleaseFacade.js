/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/facade/release/DefaultDataReleaseFacade @description Delegates data-release control-plane operations to the active owning service. */
module.exports = {
    /** Initializes the facade. */
    init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates catalogue retrieval. */
    getCatalogue: function (request) { return SERVICE.DefaultDataReleaseService.getCatalogue(request); },
    /** Delegates release preflight validation. */
    preflight: function (request) { return SERVICE.DefaultDataReleaseService.preflight(request); },
    /** Delegates governed release execution. */
    execute: function (request) { return SERVICE.DefaultDataReleaseService.execute(request); }
};
