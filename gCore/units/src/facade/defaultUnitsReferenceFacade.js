/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
