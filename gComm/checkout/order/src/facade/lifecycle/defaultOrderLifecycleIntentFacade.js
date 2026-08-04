/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/facade/lifecycle/DefaultOrderLifecycleIntentFacade @description Delegates secured Return and Refund intents. @layer facade @owner order */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, createCustomerReturn: request => SERVICE.DefaultOrderLifecycleIntentService.create(request, 'RETURN', false), createSupportReturn: request => SERVICE.DefaultOrderLifecycleIntentService.create(request, 'RETURN', true), statusCustomerReturn: request => SERVICE.DefaultOrderLifecycleIntentService.status(request, 'RETURN', false), statusSupportReturn: request => SERVICE.DefaultOrderLifecycleIntentService.status(request, 'RETURN', true), cancelCustomerReturn: request => SERVICE.DefaultOrderLifecycleIntentService.cancelDraft(request, 'RETURN', false), cancelSupportReturn: request => SERVICE.DefaultOrderLifecycleIntentService.cancelDraft(request, 'RETURN', true), informationCustomerReturn: request => SERVICE.DefaultOrderLifecycleIntentService.provideInformation(request, 'RETURN', false), informationSupportReturn: request => SERVICE.DefaultOrderLifecycleIntentService.provideInformation(request, 'RETURN', true), createCustomerRefund: request => SERVICE.DefaultOrderLifecycleIntentService.create(request, 'REFUND', false), createSupportRefund: request => SERVICE.DefaultOrderLifecycleIntentService.create(request, 'REFUND', true), statusCustomerRefund: request => SERVICE.DefaultOrderLifecycleIntentService.status(request, 'REFUND', false), statusSupportRefund: request => SERVICE.DefaultOrderLifecycleIntentService.status(request, 'REFUND', true), cancelCustomerRefund: request => SERVICE.DefaultOrderLifecycleIntentService.cancelDraft(request, 'REFUND', false), cancelSupportRefund: request => SERVICE.DefaultOrderLifecycleIntentService.cancelDraft(request, 'REFUND', true), informationCustomerRefund: request => SERVICE.DefaultOrderLifecycleIntentService.provideInformation(request, 'REFUND', false), informationSupportRefund: request => SERVICE.DefaultOrderLifecycleIntentService.provideInformation(request, 'REFUND', true) };
