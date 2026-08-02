/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/router/routers
 * @description Declares secured Payment-owned operational APIs for BackOffice clients.
 * @layer router
 * @owner payment
 * @override Customer modules may add payment operations while preserving Payment as the gateway, lifecycle, and safe evidence authority.
 */
module.exports = {
  payment: {
    providerLifecycle: {
      execute: {
        secured: true,
        accessGroups: ["userGroup"],
        permission: "payment.backoffice.manage",
        authTokenTypes: ["access"],
        apiExposure: "paymentOperations",
        key: "/providers/lifecycle",
        method: "POST",
        controller: "DefaultPaymentProviderLifecycleController",
        operation: "execute",
        help: {
          requestType: "secured",
          message:
            "Executes one Payment-owned provider lifecycle action without accepting or returning secrets.",
          method: "POST",
          url: "http://host:port/nodics/payment/v0/providers/lifecycle",
          body: {
            actionId: "validate-payment-provider",
            identity: {
              providerCode: "defaultCardProvider",
            },
            model: {
              providerCode: "defaultCardProvider",
            },
          },
        },
        responses: {
          200: {
            description: "Safe Payment provider lifecycle action result",
          },
        },
      },
    },
  },
};
