/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultPaymentPolicyService && typeof SERVICE.DefaultPaymentPolicyService.successStatus === 'function') {
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
        let executionPolicy = this.executionPolicy(request);
        let adapter = this.adapter(executionPolicy.adapterService);
        return adapter.authorize(Object.assign({}, request, { providerPolicy: executionPolicy, providerGatewayService: this }));
    },
    /** Refunds one safe payment transaction without exposing raw provider payloads. */
    refund: async function (request) {
        let transaction = (request || {}).transaction || {};
        if (!transaction.transactionCode || transaction.operation !== 'REFUND') {
            throw this.error('Payment provider gateway requires REFUND transaction evidence');
        }
        let executionPolicy = this.executionPolicy(request);
        let adapter = this.adapter(executionPolicy.adapterService);
        return adapter.refund(Object.assign({}, request, { providerPolicy: executionPolicy, providerGatewayService: this }));
    },
    /** Resolves effective provider execution policy. */
    executionPolicy: function (request) {
        if (typeof SERVICE !== 'undefined'
            && SERVICE.DefaultPaymentProviderPolicyService
            && typeof SERVICE.DefaultPaymentProviderPolicyService.resolve === 'function') {
            return SERVICE.DefaultPaymentProviderPolicyService.resolve(request);
        }
        let transaction = (request || {}).transaction || {};
        return {
            providerCode: transaction.providerCode,
            operation: transaction.operation,
            adapterService: 'DefaultManualPaymentProviderAdapterService',
            gatewayRequired: true,
        };
    },
    /** Resolves configured provider adapter service with a safe fallback. */
    adapter: function (adapterService) {
        if (typeof SERVICE !== 'undefined' && adapterService && SERVICE[adapterService]) return SERVICE[adapterService];
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultManualPaymentProviderAdapterService) return SERVICE.DefaultManualPaymentProviderAdapterService;
        return {
            authorize: async (request) => this.localResult(request),
            refund: async (request) => this.localResult(request),
        };
    },
    /** Builds safe local evidence when no adapter is available in standalone tests. */
    localResult: function (request) {
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
