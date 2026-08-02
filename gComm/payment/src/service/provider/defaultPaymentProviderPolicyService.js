/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderPolicyService
 * @description Builds effective payment provider execution policy from method, provider, operation, and request context.
 * @layer service
 * @owner payment
 * @override Customer modules may replace this service for enterprise routing, provider failover, capture strategy, retry policy, or country-specific payment rules.
 */
module.exports = {
    /** Initializes payment provider policy. */
    init: function () { return Promise.resolve(true); },
    /** Completes payment provider policy startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Creates a stable provider policy error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_PAY_00008');
        let error = new Error(message);
        error.code = 'ERR_PAY_00008';
        return error;
    },
    /** Resolves full execution policy for a transaction. */
    resolve: function (request) {
        let transaction = (request || {}).transaction || request || {};
        let methodService = SERVICE.DefaultPaymentMethodPolicyService;
        let registryService = SERVICE.DefaultPaymentProviderRegistryService;
        if (!methodService || typeof methodService.method !== 'function') throw this.error('Payment method policy service is unavailable');
        if (!registryService || typeof registryService.provider !== 'function') throw this.error('Payment provider registry service is unavailable');
        let method = methodService.method(transaction.paymentModeCode);
        let operation = transaction.operation || method.defaultOperation || 'AUTHORIZE';
        let providerCode = transaction.providerCode || registryService.defaultProviderCode(method.methodCode);
        let provider = registryService.provider(providerCode);
        registryService.assertSupports(provider, method.methodCode, operation);
        return {
            method: method,
            provider: provider,
            providerCode: provider.providerCode,
            providerType: provider.providerType,
            operation: operation,
            adapterService: provider.adapterService || 'DefaultManualPaymentProviderAdapterService',
            gatewayRequired: method.gatewayRequired === true,
            policyService: provider.policyService || 'DefaultPaymentProviderPolicyService',
        };
    },
};
