/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/checkoutInventoryReservationBridgeContract
 * @description Protects the checkout placement reserveInventory Workflow action as an Order-to-Inventory bridge, not an Inventory counter implementation.
 * @layer test
 * @owner order
 * @override Project modules may customize promise-code mapping and allocation source through configuration while Inventory remains the promise authority.
 */
const assert = require('assert');

const orderProperties = require('../config/properties');
const reservationBridge = require('../src/service/placement/defaultCheckoutInventoryReservationService');
const workflowService = require('../src/service/placement/defaultCheckoutPlacementWorkflowService');

global.CONFIG = {
    get: (key) => key === 'order' ? orderProperties.order : undefined,
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

let reservationRequests = [];
global.SERVICE = {
    DefaultInventoryPromiseReservationOrchestrationService: {
        reserve: async (request) => {
            reservationRequests.push(request);
            return {
                code: 'promise-reservation-' + reservationRequests.length,
                promiseReservationCode: request.promiseReservation.idempotencyKey,
                promiseCode: request.promiseReservation.promiseCode,
                checkoutAllocationCode: request.promiseReservation.checkoutAllocationCode,
                demandLineCode: request.promiseReservation.demandLineCode,
                promiseBucket: request.promiseReservation.promiseCode === 'phone-preorder' ? 'OVERBOOKED' : 'STANDARD',
                quantity: request.promiseReservation.quantity,
                paymentRequirement: request.promiseReservation.promiseCode === 'phone-preorder' ? 'ADVANCE' : 'NONE',
                commercialPolicyCode: request.promiseReservation.promiseCode === 'phone-preorder' ? 'preorderAdvancePolicy' : undefined,
                state: 'ACTIVE',
            };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    workflowCarrier: { code: 'carrier-1', sourceDetail: { cartCode: 'cart-1', entCode: 'enterpriseA', idempotencyKey: 'checkout-1' } },
    idempotencyKey: 'checkout-1',
    cartCode: 'cart-1',
    entCode: 'enterpriseA',
    cartEntries: [
        { cartCode: 'cart-1', entCode: 'enterpriseA', entryCode: 'entry-1', quantity: '3', unitCode: 'EA', inventoryPromiseCode: 'phone-preorder' },
        { cartCode: 'cart-1', entCode: 'enterpriseA', entryCode: 'entry-2', quantity: '1', unitCode: 'EA' },
    ],
    cartDeliveryAllocations: [
        { cartCode: 'cart-1', entCode: 'enterpriseA', allocationCode: 'delivery-entry-1-home', entryCode: 'entry-1', deliveryGroupCode: 'home', quantity: '2', unitCode: 'EA' },
        { cartCode: 'cart-1', entCode: 'enterpriseA', allocationCode: 'delivery-entry-1-office', entryCode: 'entry-1', deliveryGroupCode: 'office', quantity: '1', unitCode: 'EA', promiseCode: 'phone-stock' },
        { cartCode: 'cart-1', entCode: 'enterpriseA', allocationCode: 'delivery-entry-2-home', entryCode: 'entry-2', deliveryGroupCode: 'home', quantity: '1', unitCode: 'EA' },
    ],
};

(async () => {
    assert.strictEqual(orderProperties.order.checkoutPlacement.inventoryReservation.allocationSource, 'delivery');
    assert.deepStrictEqual(orderProperties.order.checkoutPlacement.inventoryReservation.promiseCodeFields, ['promiseCode', 'inventoryPromiseCode']);

    const result = await reservationBridge.reserve(JSON.parse(JSON.stringify(request)));
    assert.strictEqual(result.count, 2);
    assert.strictEqual(result.skipped.length, 1);
    assert.strictEqual(result.reserved[0].promiseCode, 'phone-preorder');
    assert.strictEqual(result.reserved[0].paymentRequirement, 'ADVANCE');
    assert.strictEqual(result.reserved[1].promiseCode, 'phone-stock');
    assert.strictEqual(result.reserved[1].paymentRequirement, 'NONE');
    assert.strictEqual(reservationRequests[0].enterpriseCode, 'enterpriseA');
    assert.strictEqual(reservationRequests[0].promiseReservation.demandType, 'CART');
    assert.strictEqual(reservationRequests[0].promiseReservation.demandCode, 'cart-1');
    assert.strictEqual(reservationRequests[0].promiseReservation.demandLineCode, 'entry-1');
    assert.strictEqual(reservationRequests[0].promiseReservation.checkoutAllocationCode, 'delivery-entry-1-home');
    assert(reservationRequests[0].promiseReservation.idempotencyKey.includes('checkout-1::cart-1::entry-1::delivery-entry-1-home::phone-preorder'));

    SERVICE.DefaultCheckoutInventoryReservationService = reservationBridge;
    const workflowResult = await workflowService.reserveInventory(JSON.parse(JSON.stringify(request)));
    assert.strictEqual(workflowResult.decision, 'SUCCESS');
    assert.strictEqual(workflowResult.feedback.action, 'reserveInventory');
    assert.strictEqual(workflowResult.feedback.inventoryReservations.reserved.length, 2);

    const unavailable = JSON.parse(JSON.stringify(request));
    const orchestration = SERVICE.DefaultInventoryPromiseReservationOrchestrationService;
    delete SERVICE.DefaultInventoryPromiseReservationOrchestrationService;
    await assert.rejects(
        () => reservationBridge.reserve(unavailable),
        (error) => error.code === 'ERR_ORD_00023' && error.message.includes('orchestration is unavailable')
    );
    SERVICE.DefaultInventoryPromiseReservationOrchestrationService = orchestration;

    console.log('Checkout inventory reservation bridge contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
