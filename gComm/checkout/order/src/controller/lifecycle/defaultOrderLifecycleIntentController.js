/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/controller/lifecycle/DefaultOrderLifecycleIntentController @description Maps secured Return and Refund HTTP intents to facade operations. @layer controller @owner order */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, call: function (operation, request, callback) { let promise = FACADE.DefaultOrderLifecycleIntentFacade[operation](request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, createCustomerReturn: function (r,c) { return this.call('createCustomerReturn',r,c); }, createSupportReturn: function (r,c) { return this.call('createSupportReturn',r,c); }, statusCustomerReturn: function (r,c) { return this.call('statusCustomerReturn',r,c); }, statusSupportReturn: function (r,c) { return this.call('statusSupportReturn',r,c); }, cancelCustomerReturn: function (r,c) { return this.call('cancelCustomerReturn',r,c); }, cancelSupportReturn: function (r,c) { return this.call('cancelSupportReturn',r,c); }, informationCustomerReturn: function (r,c) { return this.call('informationCustomerReturn',r,c); }, informationSupportReturn: function (r,c) { return this.call('informationSupportReturn',r,c); }, createCustomerRefund: function (r,c) { return this.call('createCustomerRefund',r,c); }, createSupportRefund: function (r,c) { return this.call('createSupportRefund',r,c); }, statusCustomerRefund: function (r,c) { return this.call('statusCustomerRefund',r,c); }, statusSupportRefund: function (r,c) { return this.call('statusSupportRefund',r,c); }, cancelCustomerRefund: function (r,c) { return this.call('cancelCustomerRefund',r,c); }, cancelSupportRefund: function (r,c) { return this.call('cancelSupportRefund',r,c); }, informationCustomerRefund: function (r,c) { return this.call('informationCustomerRefund',r,c); }, informationSupportRefund: function (r,c) { return this.call('informationSupportRefund',r,c); } };
