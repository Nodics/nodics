/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module payment/controller/refund/DefaultPaymentRefundOperationsController @description Maps finance Refund retry and reconciliation operations. @layer controller @owner payment */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, call: function (name, request, callback) { let promise = FACADE.DefaultPaymentRefundOperationsFacade[name](request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, retry: function (request, callback) { return this.call('retry', request, callback); }, reconcile: function (request, callback) { return this.call('reconcile', request, callback); }, adjust: function (request, callback) { return this.call('adjust', request, callback); }, closeException: function (request, callback) { return this.call('closeException', request, callback); } };
