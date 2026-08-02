/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentShipmentLabelContract
 * @description Protects configurable carrier label provider boundaries and safe shipment label evidence.
 * @layer test
 * @owner fulfillment
 * @override Customer modules may replace carrier label gateway services without storing provider secrets or moving label state into Order.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');
const lifecycleService = require('../src/service/shipment/defaultFulfillmentShipmentLifecycleService');
const defaultGateway = require('../src/service/carrier/defaultCarrierLabelGatewayService');
const labelService = require('../src/service/carrier/defaultShipmentLabelService');

global.CONFIG = {
    get: (key) => key === 'fulfillment' ? properties.fulfillment : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) {
            super(String(message));
            this.cause = cause;
            this.code = code;
        }
    },
};

const clone = (value) => JSON.parse(JSON.stringify(value));
let shipments = [
    {
        enterpriseCode: 'enterpriseA',
        shipmentCode: 'shipment-1',
        idempotencyKey: 'shipment-1',
        consignmentCode: 'consignment-1',
        orderCode: 'order-1',
        carrierCode: 'carrierA',
        status: 'CREATED',
    },
];
let providers = [
    {
        enterpriseCode: 'enterpriseA',
        carrierCode: 'carrierA',
        name: 'Carrier A',
        status: 'ACTIVE',
        providerType: 'CARRIER',
        supportsLabels: true,
        supportsTracking: true,
    },
    {
        enterpriseCode: 'enterpriseA',
        carrierCode: 'carrierNoLabels',
        name: 'Carrier Without Labels',
        status: 'ACTIVE',
        providerType: 'CARRIER',
        supportsLabels: false,
    },
    {
        enterpriseCode: 'enterpriseA',
        carrierCode: 'customCarrier',
        name: 'Custom Carrier',
        status: 'ACTIVE',
        providerType: 'CARRIER',
        supportsLabels: true,
        serviceAdapter: 'ProjectCarrierLabelGatewayService',
    },
];
let customGatewayCalled = false;

global.SERVICE = {
    DefaultFulfillmentPolicyService: policyService,
    DefaultFulfillmentShipmentLifecycleService: lifecycleService,
    DefaultCarrierLabelGatewayService: defaultGateway,
    ProjectCarrierLabelGatewayService: {
        createLabel: async (request) => {
            customGatewayCalled = true;
            return {
                carrierCode: request.provider.carrierCode,
                labelRef: 'projectLabel::' + request.shipment.shipmentCode,
                trackingNumber: 'CUSTOM-TRACK',
            };
        },
    },
    DefaultFulfillmentShipmentService: {
        get: async (request) => ({
            result: shipments.filter((item) =>
                request.query.shipmentCode ? item.shipmentCode === request.query.shipmentCode : item.idempotencyKey === request.query.idempotencyKey),
        }),
        save: async (request) => {
            let existingIndex = shipments.findIndex((item) => item.shipmentCode === request.model.shipmentCode);
            if (existingIndex >= 0) shipments[existingIndex] = clone(request.model);
            else shipments.push(clone(request.model));
            return { result: [clone(request.model)] };
        },
    },
    DefaultFulfillmentCarrierProviderService: {
        get: async (request) => ({ result: providers.filter((item) => item.carrierCode === request.query.carrierCode) }),
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    shipmentCode: 'shipment-1',
};

(async () => {
    const labelled = await labelService.requestLabel(clone(request));
    assert.strictEqual(labelled.status, 'LABELLED');
    assert.strictEqual(labelled.labelRef, 'carrierLabel::shipment-1');

    await assert.rejects(
        () => labelService.requestLabel(Object.assign(clone(request), { rawProviderPayload: { token: 'never-store' } })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
    );

    shipments.push({
        enterpriseCode: 'enterpriseA',
        shipmentCode: 'shipment-2',
        idempotencyKey: 'shipment-2',
        consignmentCode: 'consignment-2',
        orderCode: 'order-2',
        carrierCode: 'carrierNoLabels',
        status: 'CREATED',
    });
    await assert.rejects(
        () => labelService.requestLabel(Object.assign(clone(request), { shipmentCode: 'shipment-2' })),
        (error) => error.code === 'ERR_FUL_00004' && error.message.includes('does not support labels')
    );

    shipments.push({
        enterpriseCode: 'enterpriseA',
        shipmentCode: 'shipment-3',
        idempotencyKey: 'shipment-3',
        consignmentCode: 'consignment-3',
        orderCode: 'order-3',
        carrierCode: 'customCarrier',
        status: 'CREATED',
    });
    const customLabelled = await labelService.requestLabel(Object.assign(clone(request), { shipmentCode: 'shipment-3' }));
    assert.strictEqual(customGatewayCalled, true);
    assert.strictEqual(customLabelled.labelRef, 'projectLabel::shipment-3');
    assert.strictEqual(customLabelled.trackingNumber, 'CUSTOM-TRACK');

    console.log('Fulfillment shipment label contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
