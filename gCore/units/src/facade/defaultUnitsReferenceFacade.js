/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module units/facade/DefaultUnitsReferenceFacade
 * @description Delegates internal exact conversion intents to the Units authority.
 * @layer facade
 * @owner units
 * @override Later modules may decorate the facade without moving conversion authority outside Units.
 */
module.exports = {
    /** Initializes the facade. */ init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Converts one canonical quantity through Units-owned definitions. */
    convert: function (request) { return SERVICE.DefaultUnitsReferenceService.convert(request); }
};
