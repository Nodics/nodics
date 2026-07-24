/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/controller/DefaultBackofficeAxisPolicyController
 * @description Maps secured Axis policy reads and updates to the owning facade.
 * @layer controller
 * @owner backoffice
 */
module.exports = {
    /** Initializes the Axis policy controller. */
    init: function () { return Promise.resolve(true); },
    /** Completes Axis policy controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes one policy facade operation with optional callback compatibility. */
    execute: function (operation, request, callback) {
        let promise = FACADE.DefaultBackofficeAxisPolicyFacade[operation](request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    },
    /** Returns the effective Axis policy. */
    get: function (request, callback) { return this.execute('get', request, callback); },
    /** Revision-updates the persistent Axis policy. */
    update: function (request, callback) { return this.execute('update', request, callback); }
};
