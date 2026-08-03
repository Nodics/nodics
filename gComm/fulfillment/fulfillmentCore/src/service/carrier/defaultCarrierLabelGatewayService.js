/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/carrier/DefaultCarrierLabelGatewayService
 * @description Default safe carrier-label gateway that returns label references without storing provider payloads.
 * @layer service
 * @owner fulfillment
 * @override Customer modules replace this service or provider-specific adapter services to purchase labels from real carriers.
 */
module.exports = {
    /** Initializes the carrier label gateway. */
    init: function () { return Promise.resolve(true); },
    /** Completes carrier label gateway startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered label policy. */
    policy: function () { return (((CONFIG.get('fulfillment') || {}).fulfillmentPolicy || {}).labelPolicy) || {}; },
    /** Creates deterministic safe label evidence for local/dev and test providers. */
    createLabel: async function (request) {
        let shipment = request.shipment || {};
        let provider = request.provider || {};
        let prefix = this.policy().labelReferencePrefix || 'carrierLabel';
        return {
            carrierCode: provider.carrierCode || shipment.carrierCode,
            labelRef: [prefix, shipment.shipmentCode].filter(Boolean).join('::'),
            trackingNumber: request.trackingNumber || shipment.trackingNumber,
            trackingUrl: request.trackingUrl || shipment.trackingUrl,
        };
    },
};
