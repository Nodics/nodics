/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/carrier/DefaultFulfillmentCarrierPolicyService
 * @description Builds effective carrier execution policy from shipping mode, carrier provider, shipment, and request context.
 * @layer service
 * @owner fulfillment
 * @override Customer modules may replace this service for region routing, provider failover, SLA selection, label policy, or country-specific shipping rules.
 */
module.exports = {
    /** Initializes carrier policy. */
    init: function () { return Promise.resolve(true); },
    /** Completes carrier policy startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Creates a stable carrier policy error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00008');
        let error = new Error(message);
        error.code = 'ERR_FUL_00008';
        return error;
    },
    /** Resolves full carrier execution policy. */
    resolve: function (request) {
        let shipment = (request || {}).shipment || {};
        let providerInput = (request || {}).provider;
        let modeCode = request.deliveryModeCode || shipment.deliveryModeCode;
        let modeService = SERVICE.DefaultFulfillmentModePolicyService;
        let registryService = SERVICE.DefaultFulfillmentCarrierRegistryService;
        if (!registryService || typeof registryService.provider !== 'function') throw this.error('Fulfillment carrier registry service is unavailable');
        let mode = modeCode && modeService && typeof modeService.mode === 'function' ? modeService.mode(modeCode) : undefined;
        let carrierCode = (providerInput && providerInput.carrierCode) || request.carrierCode || shipment.carrierCode || (mode && mode.defaultCarrierCode);
        let provider = providerInput || registryService.provider(carrierCode);
        registryService.assertSupports(provider, modeCode);
        return {
            mode: mode,
            modeCode: modeCode,
            provider: provider,
            carrierCode: provider.carrierCode,
            providerType: provider.providerType,
            adapterService: provider.adapterService || provider.serviceAdapter || 'DefaultCarrierLabelGatewayService',
            policyService: provider.policyService || 'DefaultFulfillmentCarrierPolicyService',
            labelRequired: mode ? mode.labelRequired === true : provider.supportsLabels === true,
        };
    },
};
