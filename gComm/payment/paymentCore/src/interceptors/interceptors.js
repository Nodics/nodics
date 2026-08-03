/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module payment/interceptors/interceptors @description Payment validation and lifecycle interceptors. @layer interceptor @owner payment */
module.exports = {
  paymentMethodPreSavePolicy: {
    type: "schema",
    item: "paymentMethod",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultPaymentPolicyService.prepareMethod",
  },
  paymentProviderPreSavePolicy: {
    type: "schema",
    item: "paymentProvider",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultPaymentPolicyService.prepareProvider",
  },
  paymentTransactionPreSavePolicy: {
    type: "schema",
    item: "paymentTransaction",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultPaymentPolicyService.prepareTransaction",
  },
  paymentTransactionPreRemovePolicy: {
    type: "schema",
    item: "paymentTransaction",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultPaymentPolicyService.rejectHardDelete",
  },
};
