/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/controller/DefaultProductOnlineReadController @description Maps authenticated or Storefront-context customer-safe Product delivery reads to the provider-neutral cache boundary. @layer controller @owner product */
module.exports = {
    /** Initializes the Product Online controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Reads one active-release Product projection. */ readItem: function (request, callback) { let promise = SERVICE.DefaultProductDeliveryCacheService.resolve(request).then(data => ({ code: 'SUC_PRODUCT_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Validates an opaque Storefront context before reading the audience-bound Product projection. */
    readStorefrontItem: function (request, callback) { let promise = SERVICE.DefaultProductStorefrontContextProviderService.apply(request)
        .then(() => SERVICE.DefaultProductDeliveryCacheService.resolve(request)).then(data => ({ code: 'SUC_PRODUCT_00001', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }
};
