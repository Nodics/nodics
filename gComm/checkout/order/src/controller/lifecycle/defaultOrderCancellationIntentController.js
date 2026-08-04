/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/controller/lifecycle/DefaultOrderCancellationIntentController @description Maps customer and support cancellation intents to the facade. @layer controller @owner order */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, dispatch: function (promise, callback) { return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, createCustomer: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.createCustomer(request), callback); }, createSupport: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.createSupport(request), callback); }, statusCustomer: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.statusCustomer(request), callback); }, statusSupport: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.statusSupport(request), callback); }, cancelCustomerDraft: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.cancelCustomerDraft(request), callback); }, cancelSupportDraft: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.cancelSupportDraft(request), callback); }, informationCustomer: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.informationCustomer(request), callback); }, informationSupport: function (request, callback) { return this.dispatch(FACADE.DefaultOrderCancellationIntentFacade.informationSupport(request), callback); } };
