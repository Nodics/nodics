/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultManualPaymentProviderAdapterService
 * @description Safe local adapter that produces governed transaction evidence without calling a real provider.
 * @layer service
 * @owner payment
 * @override Customer modules may add provider adapters for Stripe, PayPal, CyberSource, bank providers, wallets, or enterprise-specific payment processors.
 */
module.exports = {
    /** Initializes the manual provider adapter. */
    init: function () { return Promise.resolve(true); },
    /** Completes manual provider adapter startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves successful transaction status for the requested operation. */
    successStatus: function (operation) {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultPaymentPolicyService && typeof SERVICE.DefaultPaymentPolicyService.successStatus === 'function') {
            return SERVICE.DefaultPaymentPolicyService.successStatus(operation);
        }
        if (operation === 'DEFER') return 'DEFERRED';
        if (operation === 'CAPTURE') return 'CAPTURED';
        if (operation === 'REFUND') return 'REFUNDED';
        if (operation === 'VOID') return 'VOIDED';
        return 'AUTHORIZED';
    },
    /** Produces safe authorization evidence. */
    authorize: async function (request) {
        let transaction = (request || {}).transaction || {};
        let status = this.successStatus(transaction.operation);
        return {
            transactionCode: transaction.transactionCode,
            idempotencyKey: transaction.idempotencyKey,
            providerCode: transaction.providerCode,
            operation: transaction.operation,
            status: status,
            providerTransactionRef: [String(status).toLowerCase(), transaction.transactionCode].join('::'),
            completedAt: new Date(),
        };
    },
    /** Produces safe refund evidence. */
    refund: async function (request) {
        let transaction = (request || {}).transaction || {};
        let status = this.successStatus(transaction.operation);
        return {
            transactionCode: transaction.transactionCode,
            idempotencyKey: transaction.idempotencyKey,
            providerCode: transaction.providerCode,
            operation: transaction.operation,
            status: status,
            providerTransactionRef: [String(status).toLowerCase(), transaction.transactionCode].join('::'),
            completedAt: new Date(),
        };
    },
};
