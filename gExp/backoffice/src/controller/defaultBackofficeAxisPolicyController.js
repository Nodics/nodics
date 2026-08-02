/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
