/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderGatewayService
 * @description Safe replaceable payment-provider boundary used by checkout authorization before real gateway connectors are introduced.
 * @layer service
 * @owner payment
 * @override Project modules replace this service to integrate PSPs, wallets, bank transfer, COD, or customer-specific payment providers without changing Cart or Order.
 */
module.exports = {
    /** Initializes payment provider gateway boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes payment provider gateway boundary startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Creates a stable payment provider error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00002');
        let error = new Error(message);
        error.code = 'ERR_PAY_00002';
        return error;
    },
    /** Resolves successful transaction status for the requested operation. */
    successStatus: function (operation) {
        if (SERVICE.DefaultPaymentPolicyService && typeof SERVICE.DefaultPaymentPolicyService.successStatus === 'function') {
            return SERVICE.DefaultPaymentPolicyService.successStatus(operation);
        }
        if (operation === 'DEFER') return 'DEFERRED';
        if (operation === 'CAPTURE') return 'CAPTURED';
        if (operation === 'REFUND') return 'REFUNDED';
        if (operation === 'VOID') return 'VOIDED';
        return 'AUTHORIZED';
    },
    /** Authorizes or defers one safe payment transaction without exposing raw provider payloads. */
    authorize: async function (request) {
        let transaction = (request || {}).transaction || {};
        if (!transaction.transactionCode || !transaction.operation) {
            throw this.error('Payment provider gateway requires transactionCode and operation');
        }
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
    /** Refunds one safe payment transaction without exposing raw provider payloads. */
    refund: async function (request) {
        let transaction = (request || {}).transaction || {};
        if (!transaction.transactionCode || transaction.operation !== 'REFUND') {
            throw this.error('Payment provider gateway requires REFUND transaction evidence');
        }
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
