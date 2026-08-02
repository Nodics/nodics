/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bankTransferPayment/config/properties @description Bank Transfer payment-method defaults. @layer configuration @owner bankTransferPayment */
module.exports = {
  paymentMethods: {
    bankTransferPayment: {
      methods: {
        BANK_TRANSFER: {
          methodCode: "BANK_TRANSFER",
          displayName: "Bank transfer",
          defaultOperation: "DEFER",
          providerRequired: true,
          gatewayRequired: false,
          defaultProviderCode: "deferredPaymentProvider",
          allowedProviderTypes: ["DEFERRED", "MANUAL"],
        },
      },
      deferredPaymentModes: ["BANK_TRANSFER"],
      defaultProviderByMethod: {
        BANK_TRANSFER: "deferredPaymentProvider",
      },
    },
  },
};
