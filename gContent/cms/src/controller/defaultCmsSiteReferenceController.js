/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module cms/controller/DefaultCmsSiteReferenceController @description Maps internal CMS Site reference requests to the CMS facade. @layer controller @owner cms @override Later modules may decorate transport responses while preserving CMS authority and service-only access. */
module.exports = { /** Initializes the controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Resolves one CMS Site. */ resolve: function (request, callback) { let promise = FACADE.DefaultCmsSiteReferenceFacade.resolve(request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
