/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/service/carrier/DefaultShipmentLabelService
 * @description Requests carrier label references through configurable Fulfillment provider adapters and updates shipment lifecycle evidence.
 * @layer service
 * @owner fulfillment
 * @override Customer modules can replace provider lookup, adapter selection, and label purchasing while preserving safe evidence and lifecycle boundaries.
 */
module.exports = {
    /** Initializes shipment label orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes shipment label orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered fulfillment policy. */
    config: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable shipment label error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00004');
        let error = new Error(message);
        error.code = 'ERR_FUL_00004';
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
    /** Loads the shipment being labelled. */
    loadShipment: async function (request) {
        if (request.shipment) return request.shipment;
        if (!SERVICE.DefaultFulfillmentShipmentLifecycleService || typeof SERVICE.DefaultFulfillmentShipmentLifecycleService.loadShipment !== 'function') {
            throw this.error('Fulfillment shipment lifecycle service is unavailable');
        }
        let shipment = await SERVICE.DefaultFulfillmentShipmentLifecycleService.loadShipment(request);
        if (!shipment) throw this.error('Shipment label request requires an existing shipment');
        return shipment;
    },
    /** Loads active carrier provider metadata. */
    loadProvider: async function (request, shipment) {
        if (request.provider) return request.provider;
        let carrierCode = request.carrierCode || shipment.carrierCode;
        if (!carrierCode) throw this.error('Shipment label request requires carrierCode');
        if (!SERVICE.DefaultFulfillmentCarrierProviderService || typeof SERVICE.DefaultFulfillmentCarrierProviderService.get !== 'function') {
            throw this.error('Fulfillment carrier provider generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentCarrierProviderService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { carrierCode: carrierCode },
            searchOptions: { limit: 2 },
        });
        let providers = this.items(response);
        if (providers.length > 1) throw this.error('Shipment label request resolved duplicate carrier providers');
        if (!providers[0]) throw this.error('Shipment label carrier provider was not found');
        return providers[0];
    },
    /** Resolves a configured provider adapter service. */
    resolveGateway: function (provider) {
        let labelPolicy = this.config().labelPolicy || {};
        let serviceName = provider.serviceAdapter || labelPolicy.defaultLabelGatewayService || 'DefaultCarrierLabelGatewayService';
        let gateway = SERVICE[serviceName];
        if (!gateway || typeof gateway.createLabel !== 'function') throw this.error('Carrier label gateway service is unavailable: ' + serviceName);
        return gateway;
    },
    /** Ensures label request and response are safe for Fulfillment persistence. */
    assertSafe: function (value) {
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.assertSafe === 'function') {
            SERVICE.DefaultFulfillmentPolicyService.assertSafe(value);
        }
    },
    /** Requests a label reference and marks the shipment labelled through the lifecycle service. */
    requestLabel: async function (request) {
        if (!request || !request.tenant || !request.authData) throw this.error('Shipment label request requires tenant and auth');
        this.assertSafe(request);
        let shipment = await this.loadShipment(request);
        let provider = await this.loadProvider(request, shipment);
        if (provider.status !== 'ACTIVE') throw this.error('Shipment label carrier provider is not active');
        if (provider.supportsLabels !== true) throw this.error('Shipment label carrier provider does not support labels');
        let gateway = this.resolveGateway(provider);
        let label = await gateway.createLabel(Object.assign({}, request, { shipment: shipment, provider: provider }));
        this.assertSafe(label);
        if (!label || !label.labelRef) throw this.error('Shipment label gateway did not return labelRef');
        if (!SERVICE.DefaultFulfillmentShipmentLifecycleService || typeof SERVICE.DefaultFulfillmentShipmentLifecycleService.markLabelled !== 'function') {
            throw this.error('Fulfillment shipment lifecycle service is unavailable');
        }
        return SERVICE.DefaultFulfillmentShipmentLifecycleService.markLabelled(Object.assign({}, request, {
            shipmentCode: shipment.shipmentCode,
            labelRef: label.labelRef,
            trackingNumber: label.trackingNumber || shipment.trackingNumber,
            trackingUrl: label.trackingUrl || shipment.trackingUrl,
        }));
    },
};
