/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cardPayment/config/properties @description Card payment-method family defaults. @layer configuration @owner cardPayment */
module.exports = {
  paymentMethods: {
    cardPayment: {
      methods: {
        CARD: {
          methodCode: "CARD",
          displayName: "Card payment",
          defaultOperation: "AUTHORIZE",
          providerRequired: true,
          gatewayRequired: true,
          defaultProviderCode: "defaultCardProvider",
          allowedProviderTypes: ["CARD_GATEWAY"],
        },
        ADVANCE: {
          methodCode: "ADVANCE",
          displayName: "Advance payment",
          defaultOperation: "AUTHORIZE",
          providerRequired: true,
          gatewayRequired: true,
          defaultProviderCode: "defaultAdvanceProvider",
          allowedProviderTypes: ["CARD_GATEWAY", "WALLET", "MANUAL"],
        },
      },
      gatewayRequiredModes: ["CARD", "ADVANCE"],
      defaultProviderByMethod: {
        CARD: "defaultCardProvider",
        ADVANCE: "defaultAdvanceProvider",
      },
    },
  },
};
