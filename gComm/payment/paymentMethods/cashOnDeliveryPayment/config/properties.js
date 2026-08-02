/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cashOnDeliveryPayment/config/properties @description Cash on Delivery payment-method defaults. @layer configuration @owner cashOnDeliveryPayment */
module.exports = {
  paymentMethods: {
    cashOnDeliveryPayment: {
      methods: {
        COD: {
          methodCode: "COD",
          displayName: "Cash on delivery",
          defaultOperation: "DEFER",
          providerRequired: true,
          gatewayRequired: false,
          defaultProviderCode: "deferredPaymentProvider",
          allowedProviderTypes: ["DEFERRED"],
        },
      },
      deferredPaymentModes: ["COD"],
      defaultProviderByMethod: {
        COD: "deferredPaymentProvider",
      },
    },
  },
};
