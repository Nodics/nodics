/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
