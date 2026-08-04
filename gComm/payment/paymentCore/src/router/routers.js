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
    cancellationIntent: {
      execute: {
        secured: true,
        accessGroups: ["userGroup"],
        permissionConfig: "authSecurity.internalToken.routePermission",
        authTokenTypes: ["service"],
        apiExposure: "moduleInternal",
        key: "/references/cancellations/execute",
        method: "POST",
        controller: "DefaultPaymentCancellationIntentController",
        operation: "execute",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Idempotent Payment-owned void/refund execution evidence" } },
      },
    },
    refundOperations: {
      retry: { secured: true, accessGroups: ["userGroup"], permission: "payment.refund.finance.retry", authTokenTypes: ["access"], apiExposure: "paymentOperations", key: "/refunds/retry", method: "POST", controller: "DefaultPaymentRefundOperationsController", operation: "retry", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Payment-owned idempotent Refund retry evidence" } } },
      reconcile: { secured: true, accessGroups: ["userGroup"], permission: "payment.refund.finance.reconcile", authTokenTypes: ["access"], apiExposure: "paymentOperations", key: "/refunds/reconcile", method: "POST", controller: "DefaultPaymentRefundOperationsController", operation: "reconcile", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Payment-owned normalized provider reconciliation evidence" } } },
      adjust: { secured: true, accessGroups: ["userGroup"], permission: "payment.refund.finance.adjust", authTokenTypes: ["access"], apiExposure: "paymentOperations", key: "/refunds/adjustments", method: "POST", controller: "DefaultPaymentRefundOperationsController", operation: "adjust", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Append-only governed manual Refund adjustment evidence" } } },
      closeException: { secured: true, accessGroups: ["userGroup"], permission: "payment.refund.finance.closeException", authTokenTypes: ["access"], apiExposure: "paymentOperations", key: "/refunds/exceptions/close", method: "POST", controller: "DefaultPaymentRefundOperationsController", operation: "closeException", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Append-only Refund exception closure evidence" } } },
    },
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
