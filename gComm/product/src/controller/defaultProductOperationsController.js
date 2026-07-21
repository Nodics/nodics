/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/controller/DefaultProductOperationsController @description Maps restricted Product publication diagnostics and reconciliation operations. @layer controller @owner product */
module.exports = {
    /** Initializes the Product operations controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Invokes one operations service method. */ invoke: function (operation, request, callback) { let promise = SERVICE.DefaultProductOperationsService[operation](request).then(data => ({ code: 'SUC_PRODUCT_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Returns bounded operational diagnostics. */ diagnostics: function (request, callback) { return this.invoke('diagnostics', request, callback); },
    /** Reconciles incomplete projection jobs. */ reconcile: function (request, callback) { return this.invoke('reconcile', request, callback); }
};
