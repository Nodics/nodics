/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/controller/DefaultProductOperationsController @description Maps restricted Product publication diagnostics and reconciliation operations. @layer controller @owner product */
module.exports = {
    /** Initializes the Product operations controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Invokes one operations service method. */ invoke: function (operation, request, callback) { let promise = SERVICE.DefaultProductOperationsService[operation](request).then(data => ({ code: 'SUC_PRODUCT_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Returns bounded operational diagnostics. */ diagnostics: function (request, callback) { return this.invoke('diagnostics', request, callback); },
    /** Reconciles incomplete projection jobs. */ reconcile: function (request, callback) { return this.invoke('reconcile', request, callback); }
};
