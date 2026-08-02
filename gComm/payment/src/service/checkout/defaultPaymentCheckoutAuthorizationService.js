/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module payment/service/checkout/DefaultPaymentCheckoutAuthorizationService
 * @description Authorizes checkout/order payment groups through Payment-owned provider and transaction evidence services.
 * @layer service
 * @owner payment
 * @override Project modules may replace loading, provider orchestration, idempotency strategy, or lifecycle mapping while preserving Payment as payment authority.
 */
module.exports = {
    /** Initializes checkout payment authorization. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout payment authorization startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered payment policy. */
    config: function () { return ((CONFIG.get('payment') || {}).paymentPolicy) || {}; },
    /** Creates a stable checkout payment authorization error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00003');
        let error = new Error(message);
        error.code = 'ERR_PAY_00003';
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
    /** Loads order payment groups from feedback or the generated Order service. */
    loadPaymentGroups: async function (request) {
        if (request.paymentGroups) return this.items(request.paymentGroups);
        if (request.allocationCopy && request.allocationCopy.paymentGroups) return this.items(request.allocationCopy.paymentGroups);
        if (request.feedback && request.feedback.allocationCopy && request.feedback.allocationCopy.paymentGroups) {
            return this.items(request.feedback.allocationCopy.paymentGroups);
        }
        if (!SERVICE.DefaultOrderPaymentGroupService || typeof SERVICE.DefaultOrderPaymentGroupService.get !== 'function') return [];
        let response = await SERVICE.DefaultOrderPaymentGroupService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { orderCode: request.orderCode },
            searchOptions: { limit: Number(this.config().maximumAggregateRecords || 1000) },
        });
        return this.items(response);
    },
    /** Loads an existing payment transaction by idempotency key. */
    existingTransaction: async function (request, idempotencyKey) {
        if (!SERVICE.DefaultPaymentTransactionService || typeof SERVICE.DefaultPaymentTransactionService.get !== 'function') return undefined;
        let response = await SERVICE.DefaultPaymentTransactionService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { idempotencyKey: idempotencyKey },
            searchOptions: { limit: 2 },
        });
        let transactions = this.items(response);
        if (transactions.length > 1) throw this.error('Payment authorization resolved duplicate idempotency records');
        return transactions[0];
    },
    /** Persists safe transaction evidence through the generated Payment service. */
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
    /** Executes one payment group authorization/deferred transaction idempotently. */
    authorizeGroup: async function (request, paymentGroup) {
        if (!SERVICE.DefaultPaymentPolicyService || typeof SERVICE.DefaultPaymentPolicyService.buildAuthorizationDraft !== 'function') {
            throw this.error('Payment policy service is unavailable');
        }
        if (!SERVICE.DefaultPaymentProviderGatewayService || typeof SERVICE.DefaultPaymentProviderGatewayService.authorize !== 'function') {
            throw this.error('Payment provider gateway service is unavailable');
        }
        let draft = SERVICE.DefaultPaymentPolicyService.buildAuthorizationDraft(request, paymentGroup);
        let existing = await this.existingTransaction(request, draft.idempotencyKey);
        if (existing) return Object.assign({ idempotent: true }, existing);
        let providerResult = await SERVICE.DefaultPaymentProviderGatewayService.authorize(Object.assign({}, request, { transaction: draft }));
        let transaction = Object.assign({}, draft, {
            status: providerResult.status,
            providerTransactionRef: providerResult.providerTransactionRef,
            completedAt: providerResult.completedAt || new Date(),
        });
        return this.saveTransaction(request, transaction);
    },
    /** Authorizes all payment groups for an order while preserving distributed payment split evidence. */
    authorize: async function (request) {
        if (!request || !request.tenant || !request.authData || !request.orderCode || !request.entCode) {
            throw this.error('Payment authorization requires tenant, auth, orderCode, and entCode');
        }
        let paymentGroups = await this.loadPaymentGroups(request);
        if (!paymentGroups.length) throw this.error('Payment authorization requires order payment groups');
        let authorized = [];
        let deferred = [];
        let failed = [];
        for (let paymentGroup of paymentGroups) {
            try {
                let transaction = await this.authorizeGroup(request, paymentGroup);
                if (transaction.status === 'DEFERRED') deferred.push(transaction);
                else if (transaction.status === 'FAILED') failed.push(transaction);
                else authorized.push(transaction);
            } catch (error) {
                failed.push({
                    paymentGroupCode: paymentGroup && paymentGroup.paymentGroupCode,
                    status: 'FAILED',
                    failureCode: error.code || 'ERR_PAY_00003',
                    failureMessage: String(error.message || error).slice(0, Number(this.config().failureMessageLimit || 240)),
                });
            }
        }
        if (failed.length) throw this.error('Payment authorization failed for one or more payment groups');
        return {
            orderCode: request.orderCode,
            authorized: authorized,
            deferred: deferred,
            failed: failed,
            count: authorized.length + deferred.length + failed.length,
        };
    },
};
