/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/facade/lifecycle/DefaultOrderCancellationIntentFacade @description Delegates secured cancellation intents. @layer facade @owner order */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, createCustomer: function (request) { return SERVICE.DefaultOrderCancellationIntentService.create(request, false); }, createSupport: function (request) { return SERVICE.DefaultOrderCancellationIntentService.create(request, true); }, statusCustomer: function (request) { return SERVICE.DefaultOrderCancellationIntentService.status(request, false); }, statusSupport: function (request) { return SERVICE.DefaultOrderCancellationIntentService.status(request, true); }, cancelCustomerDraft: function (request) { return SERVICE.DefaultOrderCancellationIntentService.cancelDraft(request, false); }, cancelSupportDraft: function (request) { return SERVICE.DefaultOrderCancellationIntentService.cancelDraft(request, true); }, informationCustomer: function (request) { return SERVICE.DefaultOrderLifecycleIntentService.provideInformation(request, 'CANCELLATION', false); }, informationSupport: function (request) { return SERVICE.DefaultOrderLifecycleIntentService.provideInformation(request, 'CANCELLATION', true); } };
