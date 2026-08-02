/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/test/checkoutAllocationCopyServiceContract
 * @description Protects checkout placement allocation copy as an Order-owned Workflow action that preserves distributed delivery/payment evidence from Cart.
 * @layer test
 * @owner order
 * @override Project modules may customize checkout allocation copy services while preserving source cart references and idempotent order evidence.
 */
const assert = require('assert');

global.ENUMS = {
    ReasonType: {
        ORDERSTATUS: { key: 'ORDERSTATUS' },
        PAYMENT: { key: 'PAYMENT' },
        SHIPMENT: { key: 'SHIPMENT' },
    },
};

const orderProperties = require('../config/properties');
const copyService = require('../src/service/placement/defaultCheckoutAllocationCopyService');
const workflowService = require('../src/service/placement/defaultCheckoutPlacementWorkflowService');
const allocationPolicyService = require('../src/service/allocation/defaultOrderCheckoutAllocationPolicyService');

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

const clone = (value) => JSON.parse(JSON.stringify(value));

let savedDeliveryGroups = [];
let savedPaymentGroups = [];
let savedDeliveryAllocations = [];
let savedPaymentAllocations = [];

const serviceStore = function (store) {
    return {
        get: async (request) => ({ result: store.filter((item) => item.orderCode === request.query.orderCode) }),
        save: async (request) => {
            store.push(clone(request.model));
            return { result: [request.model] };
        },
    };
};

global.SERVICE = {
    DefaultOrderCheckoutAllocationPolicyService: allocationPolicyService,
    DefaultOrderDeliveryGroupService: serviceStore(savedDeliveryGroups),
    DefaultOrderPaymentGroupService: serviceStore(savedPaymentGroups),
    DefaultOrderDeliveryAllocationService: serviceStore(savedDeliveryAllocations),
    DefaultOrderPaymentAllocationService: serviceStore(savedPaymentAllocations),
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    workflowCarrier: { code: 'carrier-1', sourceDetail: { cartCode: 'cart-1', entCode: 'enterpriseA', idempotencyKey: 'checkout-1' } },
    idempotencyKey: 'checkout-1',
    cartCode: 'cart-1',
    entCode: 'enterpriseA',
    orderProjection: { order: { code: 'order::checkout-1' } },
    cartDeliveryGroups: [
        { entCode: 'enterpriseA', cartCode: 'cart-1', deliveryGroupCode: 'ship-home', groupType: 'ADDRESS', addressCode: 'address-x', status: 'ACTIVE' },
        { entCode: 'enterpriseA', cartCode: 'cart-1', deliveryGroupCode: 'pickup-store', groupType: 'PICKUP', addressCode: 'store-1', status: 'ACTIVE' },
    ],
    cartPaymentGroups: [
        { entCode: 'enterpriseA', cartCode: 'cart-1', paymentGroupCode: 'card-main', paymentModeCode: 'CARD', currencyCode: 'USD', plannedAmount: '20.00', status: 'ACTIVE' },
        { entCode: 'enterpriseA', cartCode: 'cart-1', paymentGroupCode: 'cod-balance', paymentModeCode: 'COD', currencyCode: 'USD', plannedAmount: '10.00', status: 'ACTIVE' },
    ],
    cartDeliveryAllocations: [
        { entCode: 'enterpriseA', cartCode: 'cart-1', allocationCode: 'delivery-a1', entryCode: 'entry-1', deliveryGroupCode: 'ship-home', quantity: '2', unitCode: 'EA', serialNumbers: ['serial-1', 'serial-2'], status: 'ACTIVE' },
        { entCode: 'enterpriseA', cartCode: 'cart-1', allocationCode: 'delivery-a2', entryCode: 'entry-1', deliveryGroupCode: 'pickup-store', quantity: '1', unitCode: 'EA', serialNumbers: ['serial-3'], status: 'ACTIVE' },
    ],
    cartPaymentAllocations: [
        { entCode: 'enterpriseA', cartCode: 'cart-1', allocationCode: 'payment-a1', entryCode: 'entry-1', paymentGroupCode: 'card-main', quantity: '2', unitCode: 'EA', serialNumbers: ['serial-1', 'serial-2'], amount: '20.00', currencyCode: 'USD', status: 'ACTIVE' },
        { entCode: 'enterpriseA', cartCode: 'cart-1', allocationCode: 'payment-a2', entryCode: 'entry-1', paymentGroupCode: 'cod-balance', quantity: '1', unitCode: 'EA', serialNumbers: ['serial-3'], amount: '10.00', currencyCode: 'USD', status: 'ACTIVE' },
    ],
};

(async () => {
    assert.strictEqual(orderProperties.order.checkoutPlacement.allocationCopy.enabled, true);
    assert.strictEqual(orderProperties.order.checkoutPlacement.allocationCopy.targetStatus, 'ORDERED');

    const copied = await copyService.copy(clone(request));
    assert.strictEqual(copied.orderCode, 'order::checkout-1');
    assert.strictEqual(copied.deliveryGroups.length, 2);
    assert.strictEqual(copied.paymentGroups.length, 2);
    assert.strictEqual(copied.deliveryAllocations.length, 2);
    assert.strictEqual(copied.paymentAllocations.length, 2);
    assert.strictEqual(copied.idempotent, false);
    assert.strictEqual(savedDeliveryGroups[0].orderCode, 'order::checkout-1');
    assert.strictEqual(savedDeliveryGroups[0].cartCode, 'cart-1');
    assert.strictEqual(savedDeliveryGroups[0].deliveryGroupCode, 'ship-home');
    assert.strictEqual(savedDeliveryGroups[0].sourceDeliveryGroupCode, 'ship-home');
    assert.strictEqual(savedDeliveryGroups[0].status, 'ORDERED');
    assert.strictEqual(savedPaymentGroups[1].sourcePaymentGroupCode, 'cod-balance');
    assert.strictEqual(savedDeliveryAllocations[1].sourceAllocationCode, 'delivery-a2');
    assert.strictEqual(savedDeliveryAllocations[1].sourceDeliveryGroupCode, 'pickup-store');
    assert.deepStrictEqual(savedDeliveryAllocations[1].serialNumbers, ['serial-3']);
    assert.strictEqual(savedPaymentAllocations[0].sourcePaymentGroupCode, 'card-main');
    assert.strictEqual(savedPaymentAllocations[0].amount, '20.00');

    const replay = await copyService.copy(clone(request));
    assert.strictEqual(replay.idempotent, true);
    assert.strictEqual(savedDeliveryGroups.length, 2);
    assert.strictEqual(savedPaymentGroups.length, 2);
    assert.strictEqual(savedDeliveryAllocations.length, 2);
    assert.strictEqual(savedPaymentAllocations.length, 2);

    SERVICE.DefaultCheckoutAllocationCopyService = copyService;
    const workflowResult = await workflowService.copyAllocations(clone(request));
    assert.strictEqual(workflowResult.decision, 'SUCCESS');
    assert.strictEqual(workflowResult.feedback.action, 'copyAllocations');
    assert.strictEqual(workflowResult.feedback.allocationCopy.idempotent, true);
    assert.strictEqual(workflowResult.feedback.allocationCopy.orderCode, 'order::checkout-1');

    const invalid = clone(request);
    invalid.idempotencyKey = 'checkout-2';
    invalid.orderProjection.order.code = 'order::checkout-2';
    invalid.cartPaymentAllocations[0].amount = 0.1 + 0.2;
    await assert.rejects(
        () => copyService.copy(invalid),
        (error) => error.code === 'ERR_ORD_00002' && error.message.includes('amount must be an exact non-negative decimal string')
    );

    console.log('Checkout allocation copy service contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
