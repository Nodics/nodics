/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/checkoutPaymentAuthorizationWorkflowContract
 * @description Protects checkout placement payment authorization as an Order Workflow action that delegates payment authority to the Payment capability.
 * @layer test
 * @owner order
 * @override Project modules may replace Payment implementation without embedding gateway logic in Order.
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
    DefaultPaymentCheckoutAuthorizationService: {
        authorize: async (request) => {
            delegatedRequest = clone(request);
            return {
                orderCode: request.orderCode,
                authorized: [{ transactionCode: 'tx-card', status: 'AUTHORIZED' }],
                deferred: [{ transactionCode: 'tx-cod', status: 'DEFERRED' }],
                failed: [],
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
        paymentGroups: [
            { paymentGroupCode: 'card-main', paymentModeCode: 'CARD', plannedAmount: '20.00', currencyCode: 'USD' },
            { paymentGroupCode: 'cod-balance', paymentModeCode: 'COD', plannedAmount: '10.00', currencyCode: 'USD' },
        ],
    },
};

(async () => {
    assert.strictEqual(properties.order.checkoutPlacement.paymentAuthorization.ownerModule, 'payment');
    assert.strictEqual(workflowActions.authorizePayment.handler, 'DefaultCheckoutPlacementWorkflowService.authorizePayment');
    assert.strictEqual(workflowActions.copyAllocations.channels[0], 'checkoutPlacementAuthorizePaymentChannel');
    assert.strictEqual(workflowChannels.authorizePayment.target, 'checkoutPlacementAuthorizePaymentAction');

    const result = await workflowService.authorizePayment(clone(request));
    assert.strictEqual(result.decision, 'SUCCESS');
    assert.strictEqual(result.feedback.action, 'authorizePayment');
    assert.strictEqual(result.feedback.orderCode, 'order::checkout-1');
    assert.strictEqual(result.feedback.paymentAuthorization.count, 2);
    assert.strictEqual(delegatedRequest.entCode, 'enterpriseA');
    assert.strictEqual(delegatedRequest.orderCode, 'order::checkout-1');
    assert.strictEqual(delegatedRequest.allocationCopy.paymentGroups.length, 2);

    const completed = workflowService.completionEvidence({
        cartCode: 'cart-1',
        orderCode: 'order::checkout-1',
        placementCode: 'checkout-1',
        workflowCarrierCode: 'carrier-1',
        allocationCopy: request.allocationCopy,
        paymentAuthorization: result.feedback.paymentAuthorization,
    });
    assert.strictEqual(completed.paymentAuthorizationCount, 2);
    assert.strictEqual(completed.paymentAuthorizedCount, 1);
    assert.strictEqual(completed.paymentDeferredCount, 1);

    await assert.rejects(
        () => workflowService.authorizePayment({ workflowCarrier: request.workflowCarrier }),
        (error) => error.code === 'ERR_ORD_00029' && error.message.includes('requires produced orderCode')
    );

    console.log('Checkout payment authorization Workflow contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
