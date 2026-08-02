/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultCardPaymentProviderAdapterService
 * @description Safe default adapter for card-like providers; customer modules replace or extend this for CyberSource, Stripe, PayPal card, or acquirer integrations.
 * @layer service
 * @owner payment
 * @override Replace this adapter or configure provider-specific adapter services without changing method policy, checkout, cart, or order code.
 */
module.exports = {
    /** Initializes the card provider adapter. */
    init: function () { return Promise.resolve(true); },
    /** Completes card provider adapter startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes authorization-like operations with safe transaction evidence only. */
    authorize: async function (request) {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultManualPaymentProviderAdapterService) {
            return this.localResult(request);
        }
        return SERVICE.DefaultManualPaymentProviderAdapterService.authorize(request);
    },
    /** Executes refund operations with safe transaction evidence only. */
    refund: async function (request) {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultManualPaymentProviderAdapterService) {
            return this.localResult(request);
        }
        return SERVICE.DefaultManualPaymentProviderAdapterService.refund(request);
    },
    /** Produces fallback safe transaction evidence for direct adapter tests. */
    localResult: function (request) {
        let gateway = request && request.providerGatewayService;
        if (gateway && typeof gateway.localResult === 'function') return gateway.localResult(request);
        let transaction = (request || {}).transaction || {};
        let status = transaction.operation === 'REFUND' ? 'REFUNDED' : transaction.operation === 'DEFER' ? 'DEFERRED' : 'AUTHORIZED';
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
