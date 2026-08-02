/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentMethodPolicyService
 * @description Resolves payment method policy independently from provider implementation so customers can add methods without changing checkout or provider code.
 * @layer service
 * @owner payment
 * @override Customer modules may layer new payment methods or replace this service to source methods from a governed schema.
 */
module.exports = {
    /** Initializes payment method policy. */
    init: function () { return Promise.resolve(true); },
    /** Completes payment method policy startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered payment policy. */
    policy: function () { return ((CONFIG.get('payment') || {}).paymentPolicy) || {}; },
    /** Creates a stable payment method error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00006');
        let error = new Error(message);
        error.code = 'ERR_PAY_00006';
        return error;
    },
    /** Returns configured method definitions. */
    methods: function () {
        return this.policy().methods || {};
    },
    /** Resolves one payment method policy, including legacy fallback arrays. */
    method: function (paymentModeCode) {
        let code = String(paymentModeCode || '').trim();
        if (!code) throw this.error('Payment method code is required');
        let configured = this.methods()[code];
        if (configured) return Object.assign({ methodCode: code }, configured);
        let policy = this.policy();
        let operation = (policy.deferredPaymentModes || []).includes(code) ? 'DEFER' : 'AUTHORIZE';
        return {
            methodCode: code,
            displayName: code,
            defaultOperation: operation,
            providerRequired: true,
            gatewayRequired: (policy.gatewayRequiredModes || []).includes(code),
            defaultProviderCode: (policy.defaultProviderByPaymentMode || {})[code] || (policy.defaultProviderByPaymentMode || {}).DEFAULT || 'manualPaymentProvider',
            allowedProviderTypes: [],
        };
    },
    /** Resolves the default operation for a method. */
    operation: function (paymentModeCode) {
        return this.method(paymentModeCode).defaultOperation || 'AUTHORIZE';
    },
    /** Returns whether the payment method is deferred. */
    isDeferred: function (paymentModeCode) {
        return this.operation(paymentModeCode) === 'DEFER';
    },
    /** Returns whether the payment method needs provider gateway execution. */
    gatewayRequired: function (paymentModeCode) {
        return this.method(paymentModeCode).gatewayRequired === true;
    },
};
