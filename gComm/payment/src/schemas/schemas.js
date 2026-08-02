/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module payment/src/schemas/schemas @description Payment provider and transaction evidence schemas. @layer schema @owner payment */
const governed = function (definition, indexes) {
  return {
    super: "base",
    model: true,
    service: { enabled: true },
    router: { enabled: false },
    cache: { enabled: false },
    search: { enabled: false },
    event: { enabled: false },
    definition: definition,
    indexes: indexes || {},
  };
};

const common = function () {
  return {
    enterpriseCode: {
      type: "string",
      required: true,
      description: "Authenticated enterprise owner of the payment record",
      searchOptions: { enabled: true },
    },
    status: {
      type: "string",
      required: true,
      default: "ACTIVE",
      description: "Governed lifecycle status",
      searchOptions: { enabled: true },
    },
  };
};

module.exports = {
  payment: {
    paymentMethod: governed(
      Object.assign(common(), {
        methodCode: {
          type: "string",
          required: true,
          description:
            "Business payment method such as CARD, COD, WALLET, ADVANCE, or project-specific method",
          searchOptions: { enabled: true },
        },
        displayName: { type: "string", required: true },
        defaultOperation: {
          type: "string",
          required: true,
          description: "Default operation such as AUTHORIZE or DEFER",
          searchOptions: { enabled: true },
        },
        providerRequired: {
          type: "bool",
          required: true,
          default: true,
          description: "Whether this method requires a provider selection",
        },
        gatewayRequired: {
          type: "bool",
          required: true,
          default: false,
          description:
            "Whether this method normally calls an external provider adapter",
        },
        defaultProviderCode: {
          type: "string",
          required: false,
          description: "Default provider code for this method",
          searchOptions: { enabled: true },
        },
        allowedProviderTypes: {
          type: "array",
          required: false,
          description: "Provider types allowed for this method",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          methodCode: { enabled: true, name: "methodCode" },
        },
        individual: {
          methodCode: { enabled: true, name: "methodCode" },
          defaultOperation: { enabled: true, name: "defaultOperation" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    paymentProvider: governed(
      Object.assign(common(), {
        providerCode: {
          type: "string",
          required: true,
          description: "Safe provider identity. Never store secrets here.",
          searchOptions: { enabled: true },
        },
        providerType: {
          type: "string",
          required: true,
          description:
            "Provider type such as CARD_GATEWAY, WALLET, MANUAL, DEFERRED, or PROJECT_PROVIDER",
          searchOptions: { enabled: true },
        },
        displayName: { type: "string", required: true },
        methodCodes: {
          type: "array",
          required: true,
          description: "Payment methods supported by this provider",
        },
        paymentModes: {
          type: "array",
          required: false,
          description: "Legacy alias for methodCodes",
        },
        operations: {
          type: "array",
          required: true,
          description:
            "Operations supported by this provider such as AUTHORIZE, CAPTURE, REFUND, VOID, or DEFER",
        },
        adapterService: {
          type: "string",
          required: true,
          description:
            "Provider adapter service such as a CyberSource, Stripe, PayPal, deferred, or manual adapter",
          searchOptions: { enabled: true },
        },
        policyService: {
          type: "string",
          required: false,
          description:
            "Provider policy service for routing, retries, failover, and enterprise-specific behavior",
          searchOptions: { enabled: true },
        },
        connectorCode: {
          type: "string",
          required: false,
          description:
            "Safe configured connector identity. Credentials remain in secret stores.",
        },
        configRef: {
          type: "string",
          required: false,
          description: "Safe configuration reference, not raw credentials",
        },
        configurationSource: {
          type: "string",
          required: false,
          description:
            "Whether this record came from module defaults, governed Axis configuration, or project customization",
          searchOptions: { enabled: true },
        },
        businessEditable: {
          type: "bool",
          required: false,
          default: true,
          description:
            "Whether business users may maintain this safe provider metadata through Axis",
        },
        notes: {
          type: "string",
          required: false,
          description:
            "Safe business notes. Do not store credentials, card data, or raw provider payloads.",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          providerCode: { enabled: true, name: "providerCode" },
        },
        individual: {
          providerCode: { enabled: true, name: "providerCode" },
          providerType: { enabled: true, name: "providerType" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    paymentProviderExecutionPolicy: governed(
      Object.assign(common(), {
        policyCode: {
          type: "string",
          required: true,
          description: "Stable provider execution policy identity",
          searchOptions: { enabled: true },
        },
        providerCode: {
          type: "string",
          required: true,
          description: "Provider identity this policy applies to",
          searchOptions: { enabled: true },
        },
        methodCode: {
          type: "string",
          required: false,
          description:
            "Optional payment method such as CARD, WALLET, COD, ADVANCE, or project-specific method",
          searchOptions: { enabled: true },
        },
        operation: {
          type: "string",
          required: false,
          description:
            "Optional payment operation such as AUTHORIZE, CAPTURE, REFUND, VOID, DEFER, or RECONCILE",
          searchOptions: { enabled: true },
        },
        priority: {
          type: "number",
          required: false,
          default: 100,
          description:
            "Lower priority wins when multiple policies match the same provider/method/operation",
        },
        captureStrategy: {
          type: "string",
          required: false,
          description:
            "Safe capture behavior such as AUTHORIZE_ONLY, AUTHORIZE_AND_CAPTURE, MANUAL_CAPTURE, or PROVIDER_DEFAULT",
          searchOptions: { enabled: true },
        },
        authorizationTtlMinutes: {
          type: "number",
          required: false,
          description: "Optional authorization validity window in minutes",
        },
        retryStrategy: {
          type: "string",
          required: false,
          description:
            "Safe retry strategy such as NONE, MANUAL, EXPONENTIAL_BACKOFF, or PROVIDER_DEFAULT",
          searchOptions: { enabled: true },
        },
        maxRetries: {
          type: "number",
          required: false,
          description:
            "Maximum governed retry attempts for recoverable provider operations",
        },
        failoverProviderCodes: {
          type: "array",
          required: false,
          description:
            "Ordered safe provider codes that Payment may consider during governed failover",
        },
        connectorCode: {
          type: "string",
          required: false,
          description:
            "Safe connector identity override. Credentials remain in secret stores.",
        },
        configRef: {
          type: "string",
          required: false,
          description:
            "Safe configuration reference override, not raw credentials",
        },
        businessEditable: {
          type: "bool",
          required: false,
          default: true,
          description:
            "Whether business users may maintain this safe policy through Axis",
        },
        notes: {
          type: "string",
          required: false,
          description:
            "Safe business notes. Do not store credentials, card data, or raw provider payloads.",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          providerCode: { enabled: true, name: "providerCode" },
        },
        individual: {
          policyCode: { enabled: true, name: "policyCode" },
          providerCode: { enabled: true, name: "providerCode" },
          methodCode: { enabled: true, name: "methodCode" },
          operation: { enabled: true, name: "operation" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    paymentTransaction: governed(
      Object.assign(common(), {
        transactionCode: {
          type: "string",
          required: true,
          description: "Stable payment transaction identity",
          searchOptions: { enabled: true },
        },
        idempotencyKey: {
          type: "string",
          required: true,
          description: "Idempotency key preventing duplicate payment actions",
          searchOptions: { enabled: true },
        },
        providerCode: {
          type: "string",
          required: true,
          description: "Payment provider selected for this transaction",
          searchOptions: { enabled: true },
        },
        paymentModeCode: {
          type: "string",
          required: true,
          description:
            "Payment mode such as CARD, COD, WALLET, ADVANCE, or OFFLINE",
          searchOptions: { enabled: true },
        },
        paymentGroupCode: {
          type: "string",
          required: true,
          description:
            "Checkout/order payment group this transaction belongs to",
          searchOptions: { enabled: true },
        },
        cartCode: {
          type: "string",
          required: false,
          description: "Source cart code when available",
          searchOptions: { enabled: true },
        },
        orderCode: {
          type: "string",
          required: false,
          description:
            "Order code when the transaction is attached to an order",
          searchOptions: { enabled: true },
        },
        operation: {
          type: "string",
          required: true,
          description:
            "Payment operation such as AUTHORIZE, CAPTURE, REFUND, VOID, or DEFER",
          searchOptions: { enabled: true },
        },
        amount: {
          type: "string",
          required: true,
          description: "Exact non-negative decimal-string amount",
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency code for this payment transaction",
          searchOptions: { enabled: true },
        },
        providerTransactionRef: {
          type: "string",
          required: false,
          description:
            "Safe provider transaction reference, not raw provider payload",
        },
        paymentEvidenceCode: {
          type: "string",
          required: false,
          description: "Optional stable evidence code exposed to Cart/Order",
        },
        recoveryAction: {
          type: "string",
          required: false,
          description:
            "Payment-owned recovery action such as RETRY_REFUND or RECONCILE_PROVIDER_REFUND",
          searchOptions: { enabled: true },
        },
        recoveryStatus: {
          type: "string",
          required: false,
          description:
            "Payment-owned recovery lifecycle state such as RETRYING or RECOVERED",
          searchOptions: { enabled: true },
        },
        retryCount: {
          type: "number",
          required: false,
          description:
            "Bounded number of Payment-owned retry attempts for recoverable provider operations",
        },
        failureCode: {
          type: "string",
          required: false,
          description: "Safe failure code",
        },
        failureMessage: {
          type: "string",
          required: false,
          description:
            "Safe failure message. Do not store secrets, credentials, PAN, CVV, or raw gateway payloads.",
        },
        requestedAt: { type: "date", required: false },
        completedAt: { type: "date", required: false },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          orderCode: { enabled: true, name: "orderCode" },
          paymentGroupCode: { enabled: true, name: "paymentGroupCode" },
        },
        individual: {
          transactionCode: {
            enabled: true,
            name: "transactionCode",
            options: { unique: true },
          },
          idempotencyKey: {
            enabled: true,
            name: "idempotencyKey",
            options: { unique: true },
          },
          providerCode: { enabled: true, name: "providerCode" },
          operation: { enabled: true, name: "operation" },
          status: { enabled: true, name: "status" },
          recoveryAction: { enabled: true, name: "recoveryAction" },
          recoveryStatus: { enabled: true, name: "recoveryStatus" },
        },
      },
    ),
  },
};
