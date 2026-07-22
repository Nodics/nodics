/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module cms/facade/DefaultCmsSiteReferenceFacade @description Delegates CMS Site reference intents to CMS authority. @layer facade @owner cms @override Later modules may extend orchestration without bypassing the CMS Site reference service. */
module.exports = { /** Initializes the facade. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Resolves one CMS Site. */ resolve: function (request) { return SERVICE.DefaultCmsSiteReferenceService.resolve(request); } };
