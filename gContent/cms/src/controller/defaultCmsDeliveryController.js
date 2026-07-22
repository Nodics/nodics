/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/controller/defaultCmsDeliveryController
 * @description HTTP boundary for client-safe CMS page delivery.
 * @layer controller
 * @owner cms
 * @override Later modules may override this controller while preserving the versioned delivery contract.
 */
module.exports = {
    /** Initializes the controller lifecycle. */
    init: function () { return Promise.resolve(true); },
    /** Completes the controller lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves query input through the CMS delivery facade. */
    resolvePage: function (request, callback) {
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        request.delivery = Object.assign({}, request.delivery || {}, query);
        let operation = FACADE.DefaultCmsDeliveryFacade.resolvePage(request);
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    },

    /** Resolves a page path only after deriving Site, locale, channel, and authority from Storefront introspection. */
    resolveStorefrontPage: function (request, callback) {
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : request.query || {};
        request.delivery = { path: query.path };
        let operation = SERVICE.DefaultCmsStorefrontContextProviderService.apply(request)
            .then(() => FACADE.DefaultCmsDeliveryFacade.resolvePage(request));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    }
};
