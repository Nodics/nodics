/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/controller/DefaultStorefrontManagementController
 * @description Maps protected Storefront management routes to bounded human management operations.
 * @layer controller
 * @owner storefront
 * @override Later modules may decorate responses while preserving route and service authorization.
 */
module.exports = {
    /** Initializes the Storefront management controller. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes Storefront management controller initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Invokes an allow-listed management operation and maps its response. */
    invoke: function (operation, request, callback) {
        let service = operation === 'diagnostics'
            ? SERVICE.DefaultStorefrontObservabilityService
            : SERVICE.DefaultStorefrontManagementService;
        let promise = service[operation](request).then((data) => ({
            code: 'SUC_STOREFRONT_00001',
            data: data
        }));
        return callback ? promise.then((value) => callback(null, value)).catch(callback) : promise;
    },
    /** Lists an allow-listed Storefront management resource. */
    list: function (request, callback) {
        return this.invoke('list', request, callback);
    },
    /** Gets one Storefront management resource. */
    get: function (request, callback) {
        return this.invoke('get', request, callback);
    },
    /** Creates one Storefront management resource. */
    create: function (request, callback) {
        return this.invoke('create', request, callback);
    },
    /** Updates one Storefront management resource. */
    update: function (request, callback) {
        return this.invoke('update', request, callback);
    },
    /** Retires one Storefront management resource. */
    retire: function (request, callback) {
        return this.invoke('retire', request, callback);
    },
    /** Returns sanitized Storefront production diagnostics to authorized human operators. */
    diagnostics: function (request, callback) {
        return this.invoke('diagnostics', request, callback);
    }
};
