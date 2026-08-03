/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentTrackingEventContract
 * @description Protects safe carrier tracking event ingestion and shipment lifecycle projection.
 * @layer test
 * @owner fulfillment
 * @override Customer modules may replace carrier normalization and event mapping without storing raw payloads or bypassing shipment lifecycle services.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');
const lifecycleService = require('../src/service/shipment/defaultFulfillmentShipmentLifecycleService');
const trackingService = require('../src/service/tracking/defaultTrackingEventService');

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
let consignments = [
    {
        enterpriseCode: 'enterpriseA',
        consignmentCode: 'consignment-home',
        idempotencyKey: 'checkout-1::order-1::home::fulfillmentRelease',
        orderCode: 'order-1',
        deliveryGroupCode: 'home',
        allocationCodes: ['delivery-a1'],
        status: 'SHIPPED',
    },
];
let shipments = [
    {
        enterpriseCode: 'enterpriseA',
        shipmentCode: 'shipment-1',
        idempotencyKey: 'shipment-1',
        consignmentCode: 'consignment-home',
        orderCode: 'order-1',
        carrierCode: 'carrierA',
        trackingNumber: 'TRACK-1',
        status: 'DISPATCHED',
        shippedAt: new Date().toISOString(),
    },
];
let events = [];

global.SERVICE = {
    DefaultFulfillmentPolicyService: policyService,
    DefaultFulfillmentShipmentLifecycleService: lifecycleService,
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
    DefaultFulfillmentTrackingEventService: {
        get: async (request) => ({
            result: events.filter((item) =>
                request.query.eventCode ? item.eventCode === request.query.eventCode : item.idempotencyKey === request.query.idempotencyKey),
        }),
        save: async (request) => {
            let existingIndex = events.findIndex((item) => item.eventCode === request.model.eventCode);
            if (existingIndex >= 0) events[existingIndex] = clone(request.model);
            else events.push(clone(request.model));
            return { result: [clone(request.model)] };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'carrier-webhook' },
    entCode: 'enterpriseA',
    shipmentCode: 'shipment-1',
};

(async () => {
    const inTransit = await trackingService.ingestEvent(Object.assign(clone(request), {
        normalizedEventType: 'IN_TRANSIT',
        providerEventCode: 'ARRIVED_HUB',
        eventTime: '2026-08-01T10:00:00.000Z',
        locationCode: 'DXB',
        message: 'Arrived at carrier hub',
    }));
    assert.strictEqual(inTransit.event.status, 'APPLIED');
    assert.strictEqual(inTransit.event.appliedShipmentStatus, 'IN_TRANSIT');
    assert.strictEqual(inTransit.shipment.status, 'IN_TRANSIT');
    assert.strictEqual(events.length, 1);

    const replay = await trackingService.ingestEvent(Object.assign(clone(request), {
        normalizedEventType: 'IN_TRANSIT',
        providerEventCode: 'ARRIVED_HUB',
        eventTime: '2026-08-01T10:00:00.000Z',
        message: 'Arrived at carrier hub',
    }));
    assert.strictEqual(replay.event.idempotent, true);
    assert.strictEqual(events.length, 1);

    const delivered = await trackingService.ingestEvent(Object.assign(clone(request), {
        normalizedEventType: 'DELIVERED',
        providerEventCode: 'DELIVERED',
        eventTime: '2026-08-01T14:00:00.000Z',
        message: 'Delivered to recipient',
    }));
    assert.strictEqual(delivered.event.status, 'APPLIED');
    assert.strictEqual(delivered.event.appliedShipmentStatus, 'DELIVERED');
    assert.strictEqual(delivered.shipment.status, 'DELIVERED');
    assert.strictEqual(consignments[0].status, 'DELIVERED');

    shipments.push({
        enterpriseCode: 'enterpriseA',
        shipmentCode: 'shipment-2',
        idempotencyKey: 'shipment-2',
        consignmentCode: 'consignment-home',
        orderCode: 'order-1',
        carrierCode: 'carrierA',
        status: 'DISPATCHED',
    });
    const failed = await trackingService.ingestEvent(Object.assign(clone(request), {
        shipmentCode: 'shipment-2',
        normalizedEventType: 'EXCEPTION',
        providerEventCode: 'ADDRESS_FAILED',
        eventTime: '2026-08-01T15:00:00.000Z',
        message: 'Address could not be reached',
    }));
    assert.strictEqual(failed.event.status, 'APPLIED');
    assert.strictEqual(failed.shipment.status, 'FAILED');
    assert.strictEqual(failed.shipment.failureCode, 'ADDRESS_FAILED');

    await assert.rejects(
        () => trackingService.ingestEvent(Object.assign(clone(request), {
            normalizedEventType: 'IN_TRANSIT',
            rawCarrierPayload: { token: 'never-store' },
        })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
    );

    console.log('Fulfillment tracking event contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
