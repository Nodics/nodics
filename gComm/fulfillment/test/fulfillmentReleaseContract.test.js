/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentReleaseContract
 * @description Protects idempotent Fulfillment-owned consignment release from Order delivery groups and allocations.
 * @layer test
 * @owner fulfillment
 * @override Project modules may change grouping or provider release while preserving Order and Inventory ownership boundaries.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');
const releaseService = require('../src/service/release/defaultFulfillmentReleaseService');

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
let savedConsignments = [];

global.SERVICE = {
    DefaultFulfillmentPolicyService: policyService,
    DefaultFulfillmentConsignmentService: {
        get: async (request) => ({ result: savedConsignments.filter((item) => item.idempotencyKey === request.query.idempotencyKey) }),
        save: async (request) => {
            savedConsignments.push(clone(request.model));
            return { result: [request.model] };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    entCode: 'enterpriseA',
    orderCode: 'order::checkout-1',
    idempotencyKey: 'checkout-1',
    allocationCopy: {
        deliveryGroups: [
            { entCode: 'enterpriseA', orderCode: 'order::checkout-1', deliveryGroupCode: 'ship-home', deliveryModeCode: 'STANDARD', carrierCode: 'carrierA' },
            { entCode: 'enterpriseA', orderCode: 'order::checkout-1', deliveryGroupCode: 'pickup-store', deliveryModeCode: 'PICKUP' },
        ],
        deliveryAllocations: [
            { allocationCode: 'delivery-a1', deliveryGroupCode: 'ship-home', inventoryAllocationCode: 'inv-a1' },
            { allocationCode: 'delivery-a2', deliveryGroupCode: 'pickup-store', inventoryAllocationCode: 'inv-a2' },
        ],
    },
};

(async () => {
    const result = await releaseService.release(clone(request));
    assert.strictEqual(result.orderCode, 'order::checkout-1');
    assert.strictEqual(result.count, 2);
    assert.strictEqual(result.consignments[0].deliveryGroupCode, 'ship-home');
    assert.deepStrictEqual(result.consignments[0].allocationCodes, ['delivery-a1']);
    assert.deepStrictEqual(result.consignments[0].inventoryAllocationCodes, ['inv-a1']);
    assert.strictEqual(result.consignments[1].deliveryGroupCode, 'pickup-store');
    assert.strictEqual(savedConsignments.length, 2);

    const replay = await releaseService.release(clone(request));
    assert.strictEqual(replay.consignments[0].idempotent, true);
    assert.strictEqual(replay.consignments[1].idempotent, true);
    assert.strictEqual(savedConsignments.length, 2);

    const cancelled = await releaseService.cancelRelease({
        tenant: 'default',
        authData: request.authData,
        fulfillmentRelease: { consignments: result.consignments },
    });
    assert.strictEqual(cancelled.count, 2);
    assert.strictEqual(cancelled.cancelled[0].status, 'CANCELLED');
    assert.strictEqual(savedConsignments.length, 4);

    const invalid = clone(request);
    invalid.idempotencyKey = 'checkout-2';
    invalid.allocationCopy.deliveryAllocations = [];
    await assert.rejects(
        () => releaseService.release(invalid),
        (error) => error.code === 'ERR_FUL_00002' && error.message.includes('requires order delivery allocations')
    );

    console.log('Fulfillment release contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
