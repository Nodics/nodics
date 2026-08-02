/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module payment/config/properties @description Layered payment policy and BackOffice metadata. @layer configuration @owner payment */
module.exports = {
  payment: {
    paymentPolicy: {
      operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "DEFER"],
      transactionStatuses: ["REQUESTED", "AUTHORIZED", "CAPTURED", "REFUNDED", "VOIDED", "DEFERRED", "FAILED"],
      deferredPaymentModes: ["COD", "BANK_TRANSFER"],
      manualPaymentModes: ["ACCOUNT_CREDIT", "OFFLINE"],
      defaultProviderByPaymentMode: {
        CARD: "defaultCardProvider",
        WALLET: "defaultWalletProvider",
        ADVANCE: "defaultAdvanceProvider",
        COD: "deferredPaymentProvider",
        BANK_TRANSFER: "deferredPaymentProvider",
        ACCOUNT_CREDIT: "manualPaymentProvider",
        OFFLINE: "manualPaymentProvider",
      },
      gatewayRequiredModes: ["CARD", "WALLET", "ADVANCE"],
      refundCalculation: {
        defaultStrategy: "SUM_PAYMENT_ALLOCATIONS",
        allowExplicitAmount: true,
        explicitAmountMustNotExceedEligible: true,
        includeShipping: false,
        includeTax: true,
        includeDiscount: true,
        maximumAggregateRecords: 1000,
      },
      refundRecovery: {
        enabled: true,
        retryStatuses: ["REQUESTED", "FAILED"],
        terminalSuccessStatuses: ["REFUNDED"],
        maximumRetries: 3,
        failureMessageLimit: 240,
      },
      defaultCurrencyScale: 2,
      moneyPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
      maximumDigits: 38,
      maximumScale: 18,
      failureMessageLimit: 240,
      maximumAggregateRecords: 1000,
    },
  },
  backofficeCapabilities: {
    payment: {
      enabled: true,
      capabilityId: "payment-management",
      displayName: "Payment",
      category: "commerce",
      icon: "payment",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["payment.backoffice.read"],
      navigation: [
        {
          id: "payments",
          parentId: "commerce-operations",
          parentModuleName: "pricing",
          label: "Payments",
          route: "/commerce/operations/payments",
          icon: "payment",
          order: 610,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["payment.backoffice.read"],
          workbenchTarget: { moduleName: "payment", schemaName: "paymentTransaction" },
          help: {
            summary:
              "Review payment providers and payment transaction evidence through the Payment capability.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "payment-transactions",
          parentId: "payments",
          label: "Payment Transactions",
          route: "/commerce/operations/payments/transactions",
          icon: "payment",
          order: 611,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["payment.backoffice.read"],
          workbenchTarget: { moduleName: "payment", schemaName: "paymentTransaction" },
          help: {
            summary:
              "Review authorization, capture, refund, void, deferred, and failed payment evidence.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "payment-providers",
          parentId: "payments",
          label: "Payment Providers",
          route: "/commerce/operations/payments/providers",
          icon: "payment",
          order: 612,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["payment.backoffice.read"],
          workbenchTarget: { moduleName: "payment", schemaName: "paymentProvider" },
          help: {
            summary:
              "Review safe provider identities, supported operations, and lifecycle status. Provider secrets are never stored here.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
      ],
    },
  },
};
