/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/refund/DefaultPaymentRefundService
 * @description Creates Payment-owned refund transaction evidence for returns or order adjustments.
 * @layer service
 * @owner payment
 * @override Customer modules may replace provider refund orchestration while preserving safe Payment transaction evidence and Order/Fulfillment boundaries.
 */
module.exports = {
    /** Initializes refund orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes refund orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered payment policy. */
    config: function () { return ((CONFIG.get('payment') || {}).paymentPolicy) || {}; },
    /** Creates a stable refund error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00004');
        let error = new Error(message);
        error.code = 'ERR_PAY_00004';
        return error;
    },
    /** Normalizes generated-service responses and preloaded arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Loads one existing refund transaction using a bounded query. */
    existingTransactionByQuery: async function (request, query) {
        if (!SERVICE.DefaultPaymentTransactionService || typeof SERVICE.DefaultPaymentTransactionService.get !== 'function') return undefined;
        let response = await SERVICE.DefaultPaymentTransactionService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: { limit: 2 },
        });
        let transactions = this.items(response);
        if (transactions.length > 1) throw this.error('Payment refund resolved duplicate idempotency records');
        return transactions[0];
    },
    /** Loads an existing refund transaction by idempotency key. */
    existingTransaction: async function (request, idempotencyKey) {
        return this.existingTransactionByQuery(request, { idempotencyKey: idempotencyKey });
    },
    /** Loads an existing refund transaction by transaction code. */
    existingTransactionByCode: async function (request, transactionCode) {
        if (!transactionCode) return undefined;
        return this.existingTransactionByQuery(request, { transactionCode: transactionCode });
    },
    /** Persists safe refund transaction evidence. */
    saveTransaction: async function (request, transaction) {
        if (!SERVICE.DefaultPaymentTransactionService || typeof SERVICE.DefaultPaymentTransactionService.save !== 'function') {
            throw this.error('Payment transaction generated service is unavailable');
        }
        let response = await SERVICE.DefaultPaymentTransactionService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: transaction,
        });
        return this.items(response)[0] || response.result || transaction;
    },
    /** Ensures a request may safely enter Payment recovery. */
    assertRecoveryRequest: function (request) {
        if (!request || !request.tenant || !request.authData || !request.orderCode || !request.entCode) {
            throw this.error('Payment refund recovery requires tenant, auth, orderCode, and entCode');
        }
        if (JSON.stringify(request || {}).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload/i)) {
            throw this.error('Payment refund recovery request must not contain raw credentials, raw provider payloads, or card data');
        }
        if (!SERVICE.DefaultPaymentPolicyService || typeof SERVICE.DefaultPaymentPolicyService.buildRefundDraft !== 'function') {
            throw this.error('Payment policy service is unavailable');
        }
    },
    /** Creates refund transaction evidence idempotently. */
    refund: async function (request) {
        if (!request || !request.tenant || !request.authData || !request.orderCode || !request.entCode) {
            throw this.error('Payment refund requires tenant, auth, orderCode, and entCode');
        }
        if (!SERVICE.DefaultPaymentPolicyService || typeof SERVICE.DefaultPaymentPolicyService.buildRefundDraft !== 'function') {
            throw this.error('Payment policy service is unavailable');
        }
        if (!SERVICE.DefaultPaymentProviderGatewayService || typeof SERVICE.DefaultPaymentProviderGatewayService.refund !== 'function') {
            throw this.error('Payment provider refund gateway service is unavailable');
        }
        let draft = SERVICE.DefaultPaymentPolicyService.buildRefundDraft(request);
        let existing = await this.existingTransaction(request, draft.idempotencyKey);
        if (existing) return Object.assign({ idempotent: true }, existing);
        let providerResult = await SERVICE.DefaultPaymentProviderGatewayService.refund(Object.assign({}, request, { transaction: draft }));
        let transaction = Object.assign({}, draft, {
            status: providerResult.status,
            providerTransactionRef: providerResult.providerTransactionRef,
            completedAt: providerResult.completedAt || new Date(),
        });
        return this.saveTransaction(request, transaction);
    },
    /** Retries a failed or incomplete refund through the Payment-owned provider boundary. */
    retryRefund: async function (request) {
        this.assertRecoveryRequest(request);
        if (!SERVICE.DefaultPaymentProviderGatewayService || typeof SERVICE.DefaultPaymentProviderGatewayService.refund !== 'function') {
            throw this.error('Payment provider refund gateway service is unavailable');
        }
        let recovery = (this.config().refundRecovery || {});
        if (recovery.enabled === false) throw this.error('Payment refund recovery is disabled');
        let draft = SERVICE.DefaultPaymentPolicyService.buildRefundDraft(request);
        let existing = await this.existingTransaction(request, draft.idempotencyKey);
        let terminalStatuses = recovery.terminalSuccessStatuses || ['REFUNDED'];
        if (existing && terminalStatuses.includes(existing.status)) {
            return Object.assign({ idempotent: true, recovered: true, recoveryAction: 'NO_RETRY_REQUIRED' }, existing);
        }
        let retryStatuses = recovery.retryStatuses || ['REQUESTED', 'FAILED'];
        if (existing && !retryStatuses.includes(existing.status)) {
            throw this.error('Payment refund recovery cannot retry transaction in status ' + existing.status);
        }
        let retryCount = Number((existing && existing.retryCount) || 0) + 1;
        if (retryCount > Number(recovery.maximumRetries || 3)) {
            throw this.error('Payment refund recovery retry limit exceeded');
        }
        let transaction = Object.assign({}, draft, existing || {}, {
            retryCount: retryCount,
            recoveryAction: 'RETRY_REFUND',
            recoveryStatus: 'RETRYING',
        });
        let providerResult = await SERVICE.DefaultPaymentProviderGatewayService.refund(Object.assign({}, request, { transaction: transaction }));
        let saved = await this.saveTransaction(request, Object.assign({}, transaction, {
            status: providerResult.status,
            providerTransactionRef: providerResult.providerTransactionRef,
            completedAt: providerResult.completedAt || new Date(),
            recoveryStatus: 'RECOVERED',
        }));
        return Object.assign({ recovered: true, recoveryAction: 'RETRY_REFUND' }, saved);
    },
    /** Reconciles safe refund evidence without calling the provider boundary. */
    reconcileRefund: async function (request) {
        this.assertRecoveryRequest(request);
        let draft = SERVICE.DefaultPaymentPolicyService.buildRefundDraft(request);
        let existing = await this.existingTransactionByCode(request, request.refundTransactionCode || request.transactionCode) ||
            await this.existingTransaction(request, draft.idempotencyKey);
        if (!existing) throw this.error('Payment refund recovery could not find transaction evidence to reconcile');
        let recovery = (this.config().refundRecovery || {});
        let terminalStatuses = recovery.terminalSuccessStatuses || ['REFUNDED'];
        return {
            recovered: terminalStatuses.includes(existing.status),
            recoveryAction: 'RECONCILE_PROVIDER_REFUND',
            transactionCode: existing.transactionCode,
            idempotencyKey: existing.idempotencyKey,
            status: existing.status,
            providerCode: existing.providerCode,
            providerTransactionRef: existing.providerTransactionRef,
            orderCode: existing.orderCode,
            paymentGroupCode: existing.paymentGroupCode,
            amount: existing.amount,
            currencyCode: existing.currencyCode,
        };
    },
};
