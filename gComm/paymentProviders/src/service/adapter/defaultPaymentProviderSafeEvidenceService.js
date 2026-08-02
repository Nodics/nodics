/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviders/service/adapter/DefaultPaymentProviderSafeEvidenceService
 * @description Builds normalized safe provider evidence for mocked provider contract adapters.
 * @layer service
 * @owner paymentProviders
 * @override Real provider modules may replace transport while preserving this safe evidence shape.
 */
const statusByOperation = {
    AUTHORIZE: "AUTHORIZED",
    CAPTURE: "CAPTURED",
    DEFER: "DEFERRED",
    REFUND: "REFUNDED",
    VOID: "VOIDED",
    RECONCILE: "RECONCILED",
};

module.exports = {
    /** Returns the Payment success status for one operation. */
    successStatus: function (operation) {
        if (typeof SERVICE !== "undefined" && SERVICE.DefaultPaymentPolicyService && typeof SERVICE.DefaultPaymentPolicyService.successStatus === "function") {
            return SERVICE.DefaultPaymentPolicyService.successStatus(operation);
        }
        return statusByOperation[operation] || "AUTHORIZED";
    },

    /** Builds deterministic provider reference without leaking raw provider payloads. */
    providerReference: function (providerCode, operation, transactionCode) {
        return [providerCode, String(operation || "operation").toLowerCase(), transactionCode].join("::");
    },

    /** Builds safe normalized evidence returned by every mocked adapter operation. */
    build: function (provider, request, details) {
        let transaction = (request || {}).transaction || {};
        let operation = (details && details.operation) || transaction.operation;
        let status = (details && details.status) || this.successStatus(operation);
        return {
            transactionCode: transaction.transactionCode,
            idempotencyKey: transaction.idempotencyKey,
            providerCode: transaction.providerCode || provider.providerCode,
            operation: operation,
            status: status,
            providerTransactionRef: this.providerReference(transaction.providerCode || provider.providerCode, operation, transaction.transactionCode),
            providerFamily: provider.providerFamily,
            providerOperation: details && details.providerOperation,
            providerStatus: details && details.providerStatus,
            reconciliationCode: details && details.reconciliationCode,
            completedAt: new Date(),
        };
    },
};
