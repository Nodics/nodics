/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module store/facade/DefaultStoreReferenceFacade @description Delegates the module reference intent to Store authority. @layer facade @owner store @override Later modules may extend orchestration without bypassing the Store reference service. */
module.exports = { /** Initializes the facade. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Resolves one Store. */ resolve: function (request) { return SERVICE.DefaultStoreReferenceService.resolve(request); } };
