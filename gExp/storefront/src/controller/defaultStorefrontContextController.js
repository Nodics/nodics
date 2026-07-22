/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/controller/DefaultStorefrontContextController
 * @description Maps a public hostname-resolution request to the standard client-safe Storefront response envelope.
 * @layer controller
 * @owner storefront
 * @override Later modules may decorate the response while preserving trusted-hostname resolution.
 */
module.exports = {
    /** Initializes the public context controller. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes public context controller initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Resolves the request hostname and maps the result to the standard response envelope. */
    resolve: function (request, callback) {
        let promise = SERVICE.DefaultStorefrontContextService.resolve(request).then((data) => ({
            code: 'SUC_STOREFRONT_00001',
            data: data
        }));
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    }
};
