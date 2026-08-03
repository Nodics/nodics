/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentShipmentLifecycleContract
 * @description Protects Fulfillment-owned shipment lifecycle transitions and Inventory-owned fulfillment reconciliation.
 * @layer test
 * @owner fulfillment
 * @override Project modules may customize carrier/provider behavior while preserving shipment evidence, idempotency, and owner-module delegation.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');
const lifecycleService = require('../src/service/shipment/defaultFulfillmentShipmentLifecycleService');

global.CONFIG = {
    get: (key) => key === 'fulfillment' ? properties.fulfillment : key === 'inventory' ? { stockAllocation: { requireServiceToken: false } } : undefined,
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
let consignments = [
    {
        enterpriseCode: 'enterpriseA',
        consignmentCode: 'consignment-home',
        idempotencyKey: 'checkout-1::order-1::home::fulfillmentRelease',
        orderCode: 'order-1',
        deliveryGroupCode: 'home',
        allocationCodes: ['delivery-a1'],
        inventoryAllocationCodes: ['stock-allocation-1'],
        carrierCode: 'carrierA',
        status: 'RELEASED',
    },
];
let shipments = [];
let inventoryFulfillRequests = [];

global.SERVICE = {
    DefaultFulfillmentPolicyService: policyService,
    DefaultFulfillmentConsignmentService: {
        get: async (request) => ({ result: consignments.filter((item) => item.consignmentCode === request.query.consignmentCode) }),
        save: async (request) => {
            let existingIndex = consignments.findIndex((item) => item.consignmentCode === request.model.consignmentCode);
            if (existingIndex >= 0) consignments[existingIndex] = clone(request.model);
            else consignments.push(clone(request.model));
            return { result: [clone(request.model)] };
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
    DefaultStockAllocationIntentService: {
        fulfill: async (request) => {
            inventoryFulfillRequests.push(clone(request));
            return { code: 'SUC_INV_00005', data: { code: request.body.code, state: 'FULFILLED' } };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    entCode: 'enterpriseA',
    consignmentCode: 'consignment-home',
};

(async () => {
    const created = await lifecycleService.createShipment(clone(request));
    assert.strictEqual(created.shipmentCode, 'shipment::checkout-1::order-1::home::fulfillmentRelease::shipment');
    assert.strictEqual(created.status, 'CREATED');
    assert.strictEqual(created.idempotencyKey, 'checkout-1::order-1::home::fulfillmentRelease::shipment');
    assert.strictEqual(created.consignment.status, 'PACKED');
    assert.strictEqual(shipments.length, 1);

    const replay = await lifecycleService.createShipment(clone(request));
    assert.strictEqual(replay.idempotent, true);
    assert.strictEqual(shipments.length, 1);

    const labelled = await lifecycleService.markLabelled(Object.assign(clone(request), {
        shipmentCode: created.shipmentCode,
        labelRef: 'media::label-1',
        trackingNumber: 'TRACK-1',
    }));
    assert.strictEqual(labelled.status, 'LABELLED');
    assert.strictEqual(labelled.labelRef, 'media::label-1');
    assert.strictEqual(labelled.trackingNumber, 'TRACK-1');

    await assert.rejects(
        () => lifecycleService.markLabelled(Object.assign(clone(request), {
            shipmentCode: created.shipmentCode,
            rawLabel: 'base64-provider-payload',
        })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
    );

    const dispatched = await lifecycleService.dispatch(Object.assign(clone(request), {
        shipmentCode: created.shipmentCode,
        trackingUrl: 'https://carrier.example/track/TRACK-1',
    }));
    assert.strictEqual(dispatched.shipment.status, 'DISPATCHED');
    assert.strictEqual(dispatched.consignment.status, 'SHIPPED');
    assert.strictEqual(dispatched.inventoryFulfillment.length, 1);
    assert.strictEqual(inventoryFulfillRequests.length, 1);
    assert.strictEqual(inventoryFulfillRequests[0].body.code, 'stock-allocation-1');
    assert.strictEqual(inventoryFulfillRequests[0].enterpriseCode, 'enterpriseA');

    const delivered = await lifecycleService.deliver(Object.assign(clone(request), { shipmentCode: created.shipmentCode }));
    assert.strictEqual(delivered.shipment.status, 'DELIVERED');
    assert.strictEqual(delivered.consignment.status, 'DELIVERED');

    await assert.rejects(
        () => lifecycleService.dispatch(Object.assign(clone(request), { shipmentCode: created.shipmentCode })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('transition from DELIVERED to DISPATCHED')
    );

    console.log('Fulfillment shipment lifecycle contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
