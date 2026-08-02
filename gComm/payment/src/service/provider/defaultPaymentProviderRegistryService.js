/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderRegistryService
 * @description Resolves payment provider definitions separately from payment methods and gateway adapters.
 * @layer service
 * @owner payment
 * @override Customer modules may layer providers such as Stripe, PayPal, CyberSource, bank transfer, or local providers through configuration or a governed provider schema.
 */
module.exports = {
    /** Initializes payment provider registry. */
    init: function () { return Promise.resolve(true); },
    /** Completes payment provider registry startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered payment policy. */
    policy: function () { return ((CONFIG.get('payment') || {}).paymentPolicy) || {}; },
    /** Creates a stable provider registry error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00007');
        let error = new Error(message);
        error.code = 'ERR_PAY_00007';
        return error;
    },
    /** Returns configured provider definitions. */
    providers: function () {
        return this.policy().providers || {};
    },
    /** Resolves one provider by code. */
    provider: function (providerCode) {
        let code = String(providerCode || '').trim();
        if (!code) throw this.error('Payment provider code is required');
        let configured = this.providers()[code];
        if (configured) return Object.assign({ providerCode: code }, configured);
        return {
            providerCode: code,
            providerType: 'PROJECT_PROVIDER',
            displayName: code,
            methodCodes: [],
            operations: this.policy().operations || [],
            adapterService: 'DefaultManualPaymentProviderAdapterService',
            policyService: 'DefaultPaymentProviderPolicyService',
            status: 'ACTIVE',
        };
    },
    /** Resolves the default provider for a method. */
    defaultProviderCode: function (paymentModeCode) {
        let method = typeof SERVICE !== 'undefined' && SERVICE.DefaultPaymentMethodPolicyService && typeof SERVICE.DefaultPaymentMethodPolicyService.method === 'function'
            ? SERVICE.DefaultPaymentMethodPolicyService.method(paymentModeCode)
            : undefined;
        if (method && method.defaultProviderCode) return method.defaultProviderCode;
        let map = this.policy().defaultProviderByPaymentMode || {};
        return map[paymentModeCode] || map.DEFAULT || 'manualPaymentProvider';
    },
    /** Returns providers eligible for a method. */
    eligibleProviders: function (paymentModeCode) {
        let providers = this.providers();
        return Object.keys(providers)
            .map((code) => this.provider(code))
            .filter((provider) => provider.status !== 'INACTIVE')
            .filter((provider) => (provider.methodCodes || provider.paymentModes || []).includes(paymentModeCode));
    },
    /** Validates that a provider can perform an operation for a method. */
    assertSupports: function (provider, paymentModeCode, operation) {
        let methodCodes = provider.methodCodes || provider.paymentModes || [];
        if (methodCodes.length && !methodCodes.includes(paymentModeCode)) {
            throw this.error('Payment provider does not support payment method ' + paymentModeCode);
        }
        if ((provider.operations || []).length && !provider.operations.includes(operation)) {
            throw this.error('Payment provider does not support operation ' + operation);
        }
        return provider;
    },
};
