/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/checkoutFulfillmentReleaseWorkflowContract
 * @description Protects checkout placement fulfillment release as an Order Workflow action that delegates fulfillment authority to the Fulfillment capability.
 * @layer test
 * @owner order
 * @override Project modules may replace Fulfillment implementation without embedding shipment logic in Order.
 */
const assert = require('assert');

global.ENUMS = {
    WorkflowActionType: {
        AUTO: { key: 'AUTO' },
        MANUAL: { key: 'MANUAL' },
    },
};

const properties = require('../config/properties');
const workflowActions = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowActionData');
const workflowChannels = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowChannelData');
const workflowService = require('../src/service/placement/defaultCheckoutPlacementWorkflowService');

global.CONFIG = {
    get: (key) => key === 'order' ? properties.order : undefined,
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
let delegatedRequest = null;

global.SERVICE = {
    DefaultFulfillmentReleaseService: {
        release: async (request) => {
            delegatedRequest = clone(request);
            return {
                orderCode: request.orderCode,
                consignments: [
                    { consignmentCode: 'consignment-home', deliveryGroupCode: 'ship-home', status: 'RELEASED' },
                    { consignmentCode: 'consignment-pickup', deliveryGroupCode: 'pickup-store', status: 'RELEASED' },
                ],
                count: 2,
            };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    workflowCarrier: { code: 'carrier-1', sourceDetail: { cartCode: 'cart-1', entCode: 'enterpriseA', idempotencyKey: 'checkout-1' } },
    placementCode: 'checkout-1',
    orderProjection: { order: { code: 'order::checkout-1' } },
    allocationCopy: {
        orderCode: 'order::checkout-1',
        deliveryGroups: [
            { deliveryGroupCode: 'ship-home', deliveryModeCode: 'STANDARD' },
            { deliveryGroupCode: 'pickup-store', deliveryModeCode: 'PICKUP' },
        ],
        deliveryAllocations: [
            { allocationCode: 'delivery-a1', deliveryGroupCode: 'ship-home' },
            { allocationCode: 'delivery-a2', deliveryGroupCode: 'pickup-store' },
        ],
    },
    paymentAuthorization: { authorized: [{ transactionCode: 'tx-card' }], deferred: [], failed: [], count: 1 },
};

(async () => {
    assert.strictEqual(properties.order.checkoutPlacement.fulfillmentRelease.ownerModule, 'fulfillment');
    assert.strictEqual(workflowActions.releaseFulfillment.handler, 'DefaultCheckoutPlacementWorkflowService.releaseFulfillment');
    assert.strictEqual(workflowActions.authorizePayment.channels[0], 'checkoutPlacementReleaseFulfillmentChannel');
    assert.strictEqual(workflowChannels.releaseFulfillment.target, 'checkoutPlacementReleaseFulfillmentAction');

    const result = await workflowService.releaseFulfillment(clone(request));
    assert.strictEqual(result.decision, 'SUCCESS');
    assert.strictEqual(result.feedback.action, 'releaseFulfillment');
    assert.strictEqual(result.feedback.orderCode, 'order::checkout-1');
    assert.strictEqual(result.feedback.fulfillmentRelease.count, 2);
    assert.strictEqual(delegatedRequest.entCode, 'enterpriseA');
    assert.strictEqual(delegatedRequest.orderCode, 'order::checkout-1');
    assert.strictEqual(delegatedRequest.allocationCopy.deliveryGroups.length, 2);
    assert.strictEqual(delegatedRequest.paymentAuthorization.count, 1);

    const completed = workflowService.completionEvidence({
        cartCode: 'cart-1',
        orderCode: 'order::checkout-1',
        placementCode: 'checkout-1',
        workflowCarrierCode: 'carrier-1',
        allocationCopy: request.allocationCopy,
        paymentAuthorization: request.paymentAuthorization,
        fulfillmentRelease: result.feedback.fulfillmentRelease,
    });
    assert.strictEqual(completed.fulfillmentReleaseCount, 2);

    await assert.rejects(
        () => workflowService.releaseFulfillment({ workflowCarrier: request.workflowCarrier }),
        (error) => error.code === 'ERR_ORD_00030' && error.message.includes('requires produced orderCode')
    );

    console.log('Checkout fulfillment release Workflow contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
