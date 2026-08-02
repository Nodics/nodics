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
    /** Returns whether a provider can be selected for payment execution. */
    isSelectableStatus: function (provider) {
        return provider && !['DRAFT', 'SUSPENDED', 'INACTIVE', 'RETIRED'].includes(provider.status);
    },
    /** Returns whether a governed provider record should override module defaults. */
    isGovernedOverrideStatus: function (provider) {
        return provider && provider.status !== 'RETIRED' && provider.status !== 'INACTIVE';
    },
    /** Returns configured provider definitions as normalized records. */
    configuredProviders: function () {
        return Object.keys(this.providers()).map((code) => this.provider(code));
    },
    /** Returns true when governed provider records can be read in this runtime. */
    hasRecordService: function () {
        return typeof SERVICE !== 'undefined'
            && SERVICE.DefaultPaymentProviderService
            && typeof SERVICE.DefaultPaymentProviderService.get === 'function';
    },
    /** Extracts result arrays from Nodics service responses. */
    items: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.result && Array.isArray(response.result.items)) return response.result.items;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    },
    /** Builds a governed provider query from runtime context. */
    providerQuery: function (request, providerCode) {
        let transaction = (request || {}).transaction || {};
        let query = {};
        let enterpriseCode = (request || {}).enterpriseCode || (request || {}).entCode || transaction.enterpriseCode || transaction.entCode;
        if (enterpriseCode) query.enterpriseCode = enterpriseCode;
        if (providerCode) query.providerCode = providerCode;
        return query;
    },
    /** Merges a governed Axis record over a provider-module default without allowing records to introduce secrets. */
    normalizeRecord: function (record, configured) {
        let provider = Object.assign({}, configured || {}, record || {});
        if (!provider.providerCode && configured && configured.providerCode) provider.providerCode = configured.providerCode;
        if (Array.isArray(provider.paymentModes) && !Array.isArray(provider.methodCodes)) provider.methodCodes = provider.paymentModes.slice();
        if (Array.isArray(provider.methodCodes) && !Array.isArray(provider.paymentModes)) provider.paymentModes = provider.methodCodes.slice();
        provider.adapterService = provider.adapterService || (configured && configured.adapterService) || 'DefaultManualPaymentProviderAdapterService';
        provider.policyService = provider.policyService || (configured && configured.policyService) || 'DefaultPaymentProviderPolicyService';
        provider.status = provider.status || 'ACTIVE';
        provider.configurationSource = record && record.providerCode ? 'GOVERNED_RECORD' : 'MODULE_CONFIGURATION';
        delete provider.secret;
        delete provider.password;
        delete provider.rawGatewayPayload;
        delete provider.providerPayload;
        delete provider.cardNumber;
        delete provider.cvv;
        delete provider.pan;
        return provider;
    },
    /** Reads one governed provider record from Payment when Axis-managed configuration exists. */
    recordProvider: async function (providerCode, request) {
        if (!this.hasRecordService()) return undefined;
        let query = this.providerQuery(request, providerCode);
        if (!query.providerCode) return undefined;
        let response = await SERVICE.DefaultPaymentProviderService.get({
            tenant: request && request.tenant,
            authData: request && request.authData,
            query: query,
            searchOptions: { limit: 2 },
        });
        let items = this.items(response).filter((item) => this.isGovernedOverrideStatus(item));
        if (items.length > 1) throw this.error('Multiple active Payment Provider records found for ' + providerCode);
        return items[0];
    },
    /** Reads governed provider records for one request scope. */
    recordProviders: async function (request) {
        if (!this.hasRecordService()) return [];
        let response = await SERVICE.DefaultPaymentProviderService.get({
            tenant: request && request.tenant,
            authData: request && request.authData,
            query: this.providerQuery(request),
            searchOptions: { limit: Number((this.policy().axisProviderRecordLimit) || 500) },
        });
        return this.items(response).filter((item) => this.isGovernedOverrideStatus(item));
    },
    /** Resolves one provider by code. */
    provider: function (providerCode) {
        let code = String(providerCode || '').trim();
        if (!code) throw this.error('Payment provider code is required');
        let configured = this.providers()[code];
        if (configured) return this.normalizeRecord({ providerCode: code }, configured);
        return {
            providerCode: code,
            providerType: 'PROJECT_PROVIDER',
            displayName: code,
            methodCodes: [],
            operations: this.policy().operations || [],
            adapterService: 'DefaultManualPaymentProviderAdapterService',
            policyService: 'DefaultPaymentProviderPolicyService',
            status: 'ACTIVE',
            configurationSource: 'RUNTIME_FALLBACK',
        };
    },
    /** Resolves one effective provider, preferring governed Axis-managed records over module defaults. */
    providerForRequest: async function (providerCode, request) {
        let configured = this.provider(providerCode);
        let record = await this.recordProvider(providerCode, request || {});
        return this.normalizeRecord(record, configured);
    },
    /** Resolves effective providers visible for the request scope. */
    providersForRequest: async function (request) {
        let byCode = {};
        this.configuredProviders().forEach((provider) => {
            byCode[provider.providerCode] = provider;
        });
        let records = await this.recordProviders(request || {});
        records.forEach((record) => {
            let configured = byCode[record.providerCode] || {};
            byCode[record.providerCode] = this.normalizeRecord(record, configured);
        });
        return Object.keys(byCode).map((code) => byCode[code]);
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
            .filter((provider) => this.isSelectableStatus(provider))
            .filter((provider) => (provider.methodCodes || provider.paymentModes || []).includes(paymentModeCode));
    },
    /** Returns request-aware eligible providers for Axis/runtime use. */
    eligibleProvidersForRequest: async function (paymentModeCode, request) {
        let providers = await this.providersForRequest(request || {});
        return providers
            .filter((provider) => this.isSelectableStatus(provider))
            .filter((provider) => (provider.methodCodes || provider.paymentModes || []).includes(paymentModeCode));
    },
    /** Validates that a provider can perform an operation for a method. */
    assertSupports: function (provider, paymentModeCode, operation) {
        if (!this.isSelectableStatus(provider)) throw this.error('Payment provider is not active for payment execution');
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
