/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module fulfillment/controller/return/DefaultWarehouseReturnOperationsController @description Maps warehouse Return operations to Fulfillment facade. @layer controller @owner fulfillment */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, call: function (operation, request, callback) { let promise = FACADE.DefaultWarehouseReturnOperationsFacade[operation](request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, receive: function (request, callback) { return this.call('receive', request, callback); }, inspect: function (request, callback) { return this.call('inspect', request, callback); }, disposition: function (request, callback) { return this.call('disposition', request, callback); } };
