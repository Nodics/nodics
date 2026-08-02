/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module payment/service/policy/DefaultPaymentPolicyService
 * @description Validates safe payment provider and transaction evidence and builds checkout authorization transaction drafts.
 * @layer service
 * @owner payment
 * @override Project modules may replace policy or layered configuration to support custom providers, modes, and lifecycle states without changing Cart or Order.
 */
module.exports = {
    /** Initializes Payment policy. */
    init: function () { return Promise.resolve(true); },
    /** Completes Payment policy startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Payment policy. */
    policy: function () { return ((CONFIG.get('payment') || {}).paymentPolicy) || {}; },
    /** Creates a stable Payment policy error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00001');
        let error = new Error(message);
        error.code = 'ERR_PAY_00001';
        return error;
    },
    /** Validates an exact non-negative decimal string. */
    validateMoney: function (value) {
        let policy = this.policy();
        if (typeof value !== 'string') return false;
        let expression = new RegExp(policy.moneyPattern || '^(0|[1-9][0-9]*)(\\.[0-9]+)?$');
        if (!expression.test(value)) return false;
        let parts = String(value).split('.');
        let total = (parts[0] + (parts[1] || '')).length;
        let scale = (parts[1] || '').length;
        return total <= Number(policy.maximumDigits || 38) && scale <= Number(policy.maximumScale || 18);
    },
    /** Resolves provider code for a payment mode. */
    providerCode: function (paymentModeCode) {
        let map = this.policy().defaultProviderByPaymentMode || {};
        return map[paymentModeCode] || map.DEFAULT || 'manualPaymentProvider';
    },
    /** Resolves payment operation for a payment mode. */
    operation: function (paymentModeCode) {
        let policy = this.policy();
        if ((policy.deferredPaymentModes || []).includes(paymentModeCode)) return 'DEFER';
        return 'AUTHORIZE';
    },
    /** Resolves successful transaction status for operation and mode. */
    successStatus: function (operation) {
        if (operation === 'DEFER') return 'DEFERRED';
        if (operation === 'CAPTURE') return 'CAPTURED';
        if (operation === 'REFUND') return 'REFUNDED';
        if (operation === 'VOID') return 'VOIDED';
        return 'AUTHORIZED';
    },
    /** Validates safe provider configuration metadata. */
    prepareProvider: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'providerCode', 'providerType', 'displayName'].forEach((field) => {
            if (!model[field]) throw this.error('Payment Provider ' + field + ' is required');
        });
        if (!Array.isArray(model.paymentModes) || !model.paymentModes.length) throw this.error('Payment Provider paymentModes are required');
        if (!Array.isArray(model.operations) || !model.operations.length) throw this.error('Payment Provider operations are required');
        if (JSON.stringify(model).match(/cvv|cardNumber|pan|secret|password/i)) throw this.error('Payment Provider must not store raw credentials or card data');
        model.status = model.status || 'ACTIVE';
        request.model = model;
        return model;
    },
    /** Validates safe transaction evidence. */
    prepareTransaction: function (request) {
        let model = Object.assign({}, (request || {}).model || {});
        ['enterpriseCode', 'transactionCode', 'idempotencyKey', 'providerCode', 'paymentModeCode', 'paymentGroupCode', 'operation', 'amount', 'currencyCode'].forEach((field) => {
            if (!model[field]) throw this.error('Payment Transaction ' + field + ' is required');
        });
        if (!(this.policy().operations || []).includes(model.operation)) throw this.error('Payment operation is unsupported');
        if (!(this.policy().transactionStatuses || []).includes(model.status || 'REQUESTED')) throw this.error('Payment transaction status is unsupported');
        if (!this.validateMoney(model.amount)) throw this.error('Payment amount must be an exact non-negative decimal string');
        if (JSON.stringify(model).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload/i)) {
            throw this.error('Payment Transaction must not store raw credentials, raw provider payloads, or card data');
        }
        model.status = model.status || 'REQUESTED';
        model.requestedAt = model.requestedAt || new Date();
        request.model = model;
        return model;
    },
    /** Builds one authorization/deferred transaction from an order payment group. */
    buildAuthorizationDraft: function (request, paymentGroup) {
        let operation = this.operation(paymentGroup.paymentModeCode);
        let idempotencyKey = [
            request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code || request.orderCode,
            request.orderCode || paymentGroup.orderCode,
            paymentGroup.paymentGroupCode,
            operation,
        ].filter(Boolean).join('::');
        return this.prepareTransaction({
            model: {
                enterpriseCode: request.entCode || request.enterpriseCode || paymentGroup.entCode || paymentGroup.enterpriseCode,
                transactionCode: 'payment::' + idempotencyKey,
                idempotencyKey: idempotencyKey,
                providerCode: this.providerCode(paymentGroup.paymentModeCode),
                paymentModeCode: paymentGroup.paymentModeCode,
                paymentGroupCode: paymentGroup.paymentGroupCode,
                cartCode: request.cartCode || paymentGroup.cartCode,
                orderCode: request.orderCode || paymentGroup.orderCode,
                operation: operation,
                amount: paymentGroup.plannedAmount || paymentGroup.authorizedAmount || paymentGroup.capturedAmount || '0',
                currencyCode: paymentGroup.currencyCode,
                paymentEvidenceCode: 'payment-evidence::' + idempotencyKey,
                status: 'REQUESTED',
            },
        });
    },
    /** Builds one refund transaction draft from return/refund evidence. */
    buildRefundDraft: function (request) {
        if (JSON.stringify(request || {}).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload/i)) {
            throw this.error('Payment refund request must not contain raw credentials, raw provider payloads, or card data');
        }
        let idempotencyKey = [
            request.idempotencyKey || request.returnCode || request.orderCode,
            request.orderCode,
            request.paymentGroupCode,
            request.amount,
            'REFUND',
        ].filter(Boolean).join('::');
        return this.prepareTransaction({
            model: {
                enterpriseCode: request.entCode || request.enterpriseCode,
                transactionCode: request.transactionCode || 'payment::' + idempotencyKey,
                idempotencyKey: idempotencyKey,
                providerCode: request.providerCode || this.providerCode(request.paymentModeCode),
                paymentModeCode: request.paymentModeCode,
                paymentGroupCode: request.paymentGroupCode,
                cartCode: request.cartCode,
                orderCode: request.orderCode,
                operation: 'REFUND',
                amount: request.amount,
                currencyCode: request.currencyCode,
                paymentEvidenceCode: request.paymentEvidenceCode || 'refund-evidence::' + idempotencyKey,
                status: 'REQUESTED',
            },
        });
    },
    /** Rejects destructive Payment transaction deletion. */
    rejectHardDelete: function () {
        return Promise.reject(this.error('Payment transaction evidence cannot be hard-deleted; use lifecycle states'));
    },
};
