/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module store/controller/DefaultStoreReferenceController @description Maps internal Store reference requests to the Store facade. @layer controller @owner store @override Later modules may decorate the response while preserving service-only access and the Store-owned projection. */
module.exports = { /** Initializes the controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Resolves one Store. */ resolve: function (request, callback) { let promise = FACADE.DefaultStoreReferenceFacade.resolve(request).then(data => ({ code: 'SUC_STORE_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
