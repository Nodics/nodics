/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/carrier/DefaultFulfillmentCarrierRegistryService
 * @description Resolves carrier provider metadata separately from shipping modes and provider adapters.
 * @layer service
 * @owner fulfillment
 * @override Customer modules may layer providers such as DHL, FedEx, UPS, local fleets, pickup networks, or aggregators through configuration or governed schemas.
 */
module.exports = {
    /** Initializes carrier registry. */
    init: function () { return Promise.resolve(true); },
    /** Completes carrier registry startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Fulfillment policy. */
    policy: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable carrier registry error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00007');
        let error = new Error(message);
        error.code = 'ERR_FUL_00007';
        return error;
    },
    /** Returns configured carrier provider definitions. */
    providers: function () {
        return this.policy().carrierProviders || {};
    },
    /** Resolves one carrier provider by code. */
    provider: function (carrierCode) {
        let code = String(carrierCode || '').trim();
        if (!code) throw this.error('Fulfillment carrier provider code is required');
        let configured = this.providers()[code];
        if (configured) return Object.assign({ carrierCode: code }, configured);
        return {
            carrierCode: code,
            name: code,
            providerType: 'CARRIER',
            modeCodes: [],
            supportedDeliveryModes: [],
            supportsLabels: false,
            supportsTracking: false,
            adapterService: 'DefaultCarrierLabelGatewayService',
            policyService: 'DefaultFulfillmentCarrierPolicyService',
            status: 'ACTIVE',
        };
    },
    /** Resolves the default carrier provider for a shipping mode. */
    defaultCarrierCode: function (deliveryModeCode) {
        let mode = typeof SERVICE !== 'undefined' && SERVICE.DefaultFulfillmentModePolicyService && typeof SERVICE.DefaultFulfillmentModePolicyService.mode === 'function'
            ? SERVICE.DefaultFulfillmentModePolicyService.mode(deliveryModeCode)
            : undefined;
        return mode && mode.defaultCarrierCode;
    },
    /** Validates that a provider can serve a shipping mode. */
    assertSupports: function (provider, deliveryModeCode) {
        let modes = provider.modeCodes || provider.supportedDeliveryModes || [];
        if (deliveryModeCode && modes.length && !modes.includes(deliveryModeCode)) {
            throw this.error('Fulfillment carrier provider does not support shipping mode ' + deliveryModeCode);
        }
        return provider;
    },
};
