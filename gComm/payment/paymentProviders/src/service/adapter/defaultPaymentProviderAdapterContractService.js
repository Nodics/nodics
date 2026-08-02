/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviders/service/adapter/DefaultPaymentProviderAdapterContractService
 * @description Validates payment provider adapters against the Payment-owned normalized operation port.
 * @layer service
 * @owner paymentProviders
 * @override Projects may add provider-specific fields only when normalized output remains safe and Payment-owned.
 */
const REQUIRED_OPERATIONS = ["authorize", "capture", "void", "refund", "reconcile"];
const ALLOWED_STATUSES = ["REQUESTED", "AUTHORIZED", "CAPTURED", "REFUNDED", "VOIDED", "DEFERRED", "RECONCILED", "FAILED"];

module.exports = {
    requiredOperations: REQUIRED_OPERATIONS,

    /** Validates one adapter before registration or conformance execution. */
    validate: function (providerCode, adapter) {
        if (!providerCode || !adapter || typeof adapter !== "object") {
            throw new Error("Payment provider adapter requires providerCode and adapter object");
        }
        if (adapter.providerCode && adapter.providerCode !== providerCode) {
            throw new Error("Payment provider adapter code mismatch: " + providerCode);
        }
        if (!adapter.providerFamily || typeof adapter.providerFamily !== "string") {
            throw new Error("Payment provider adapter requires providerFamily");
        }
        if (!Array.isArray(adapter.operations) || !adapter.operations.length) {
            throw new Error("Payment provider adapter requires supported operations");
        }
        REQUIRED_OPERATIONS.forEach((operation) => {
            if (typeof adapter[operation] !== "function") {
                throw new Error("Payment provider adapter requires " + operation);
            }
        });
        return true;
    },

    /** Normalizes and validates safe payment evidence returned by any adapter. */
    normalizeResult: function (result) {
        if (!result || typeof result !== "object") throw new Error("Payment provider result is required");
        ["transactionCode", "idempotencyKey", "providerCode", "operation", "status"].forEach((field) => {
            if (!result[field]) throw new Error("Payment provider result missing " + field);
        });
        if (!ALLOWED_STATUSES.includes(result.status)) {
            throw new Error("Payment provider returned unsupported status " + result.status);
        }
        ["rawGatewayPayload", "cardNumber", "cvv", "secret", "credential"].forEach((unsafeField) => {
            if (result[unsafeField] !== undefined) {
                throw new Error("Payment provider result exposed unsafe field " + unsafeField);
            }
        });
        return Object.freeze({
            transactionCode: String(result.transactionCode),
            idempotencyKey: String(result.idempotencyKey),
            providerCode: String(result.providerCode),
            operation: String(result.operation),
            status: String(result.status),
            providerTransactionRef: result.providerTransactionRef ? String(result.providerTransactionRef) : undefined,
            providerFamily: result.providerFamily ? String(result.providerFamily) : undefined,
            providerOperation: result.providerOperation ? String(result.providerOperation) : undefined,
            providerStatus: result.providerStatus ? String(result.providerStatus) : undefined,
            reconciliationCode: result.reconciliationCode ? String(result.reconciliationCode) : undefined,
            completedAt: result.completedAt,
        });
    },
};
