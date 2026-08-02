/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/src/facade/reference/defaultMediaReferenceLookupFacade
 * @description Delegates internal media reference validation intents to the nMedia authority.
 * @layer facade
 * @owner nMedia
 * @override Later layers may decorate responses without moving media lifecycle ownership out of nMedia.
 */
module.exports = {
    /** Initializes the facade. */ init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Validates one media item or media set reference. */
    validate: function (request) { return SERVICE.DefaultMediaReferenceLookupService.validate(request); }
};
