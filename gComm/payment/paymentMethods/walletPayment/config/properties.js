/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module walletPayment/config/properties @description Wallet payment-method defaults. @layer configuration @owner walletPayment */
module.exports = {
  paymentMethods: {
    walletPayment: {
      methods: {
        WALLET: {
          methodCode: "WALLET",
          displayName: "Wallet payment",
          defaultOperation: "AUTHORIZE",
          providerRequired: true,
          gatewayRequired: true,
          defaultProviderCode: "defaultWalletProvider",
          allowedProviderTypes: ["WALLET"],
        },
      },
      defaultProviderByMethod: {
        WALLET: "defaultWalletProvider",
      },
    },
  },
};
