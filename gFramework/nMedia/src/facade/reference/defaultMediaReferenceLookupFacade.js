/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
