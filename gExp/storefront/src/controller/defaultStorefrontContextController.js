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
        let resolver = SERVICE.DefaultStorefrontTrafficService || SERVICE.DefaultStorefrontContextCacheService || SERVICE.DefaultStorefrontContextService;
        let promise = resolver.resolve(request).then(async (data) => {
            let delivery = SERVICE.DefaultStorefrontContractService
                ? SERVICE.DefaultStorefrontContractService.decorate(request, data)
                : { data: data, notModified: false };
            if (delivery.notModified) return { code: 'SUC_STOREFRONT_00001', responseCode: '304', data: undefined };
            delivery.data.contextAccess = await SERVICE.DefaultStorefrontContextAccessService.issue(data, request);
            return { code: 'SUC_STOREFRONT_00001', data: delivery.data };
        });
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    },
    /** Introspects an opaque context handle for an authenticated target module. */
    introspect: function (request, callback) {
        let promise = SERVICE.DefaultStorefrontContextAccessService.introspect(request)
            .then((data) => ({ code: 'SUC_STOREFRONT_00001', data: data }));
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    },
    /** Rotates an active public Storefront context handle. */
    refresh: function (request, callback) {
        let promise = SERVICE.DefaultStorefrontContextAccessService.refresh(request)
            .then((data) => ({ code: 'SUC_STOREFRONT_00001', data: data }));
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    },
    /** Revokes a Storefront context handle for an authenticated module operation. */
    revoke: function (request, callback) {
        let promise = SERVICE.DefaultStorefrontContextAccessService.revoke(request)
            .then((data) => ({ code: 'SUC_STOREFRONT_00001', data: data }));
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    },
    /** Revokes every active context handle for one authorized Storefront scope. */
    revokeStorefront: function (request, callback) {
        let promise = SERVICE.DefaultStorefrontContextAccessService.revokeStorefront(request)
            .then((data) => ({ code: 'SUC_STOREFRONT_00001', data: data }));
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    }
};
