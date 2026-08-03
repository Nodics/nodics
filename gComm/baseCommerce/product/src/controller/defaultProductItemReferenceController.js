/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/controller/DefaultProductItemReferenceController @description Maps the internal Product Item lookup intent to its authoritative service. @layer controller @owner product */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Resolves one Product Item for an authenticated module. */ resolve: function (request, callback) { let promise = SERVICE.DefaultProductItemReferenceService.resolve(request).then(data => ({ code: 'SUC_PRODUCT_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }
};
