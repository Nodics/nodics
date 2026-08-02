/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/facade/DefaultCmsSiteReferenceFacade @description Delegates CMS Site reference intents to CMS authority. @layer facade @owner cms @override Later modules may extend orchestration without bypassing the CMS Site reference service. */
module.exports = { /** Initializes the facade. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Resolves one CMS Site. */ resolve: function (request) { return SERVICE.DefaultCmsSiteReferenceService.resolve(request); } };
