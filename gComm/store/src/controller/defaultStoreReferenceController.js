/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module store/controller/DefaultStoreReferenceController @description Maps internal Store reference requests to the Store facade. @layer controller @owner store @override Later modules may decorate the response while preserving service-only access and the Store-owned projection. */
module.exports = { /** Initializes the controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Resolves one Store. */ resolve: function (request, callback) { let promise = FACADE.DefaultStoreReferenceFacade.resolve(request).then(data => ({ code: 'SUC_STORE_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
