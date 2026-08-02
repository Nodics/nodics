/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/test/checkoutPlacementCompensationContract
 * @description Protects checkout placement failure compensation as owner-delegated release and safe failure evidence, not hidden Order-owned rollback logic.
 * @layer test
 * @owner order
 * @override Project modules may add compensation stages while preserving Inventory-owned release authority and secret-safe placement failure evidence.
 */
const assert = require('assert');

global.ENUMS = {
    WorkflowActionType: {
        AUTO: { key: 'AUTO' },
        MANUAL: { key: 'MANUAL' },
    },
    WorkflowActionPosition: {
        HEAD: { key: 'HEAD' },
    },
};

const properties = require('../config/properties');
const workflowActions = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowActionData');
const workflowChannels = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowChannelData');
const compensationService = require('../src/service/placement/defaultCheckoutPlacementCompensationService');
const workflowService = require('../src/service/placement/defaultCheckoutPlacementWorkflowService');

global.CONFIG = {
    get: (key) => key === 'order' ? properties.order : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) {
            super(String(message));
            this.code = code;
            this.cause = cause;
        }
    },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

let released = [];
let savedHistory = [];
let savedPlacementRuns = [];
let cancelledFulfillment = [];

global.SERVICE = {
    DefaultInventoryPromiseReservationOrchestrationService: {
        release: async (request) => {
            released.push(clone(request.promiseReservation));
            if (request.promiseReservation.code === 'promise-reservation-fail') {
                let error = new Error('release provider unavailable');
                error.code = 'ERR_INV_TEST';
                throw error;
            }
            return {
                code: request.promiseReservation.code,
                promiseCode: 'phone-preorder',
                state: request.promiseReservation.state,
            };
        },
    },
    DefaultOrderHistoryEntryService: {
        save: async (request) => {
            savedHistory.push(clone(request.model));
            return { result: [request.model] };
        },
    },
    DefaultFulfillmentReleaseService: {
        cancelRelease: async (request) => {
            cancelledFulfillment = (request.fulfillmentRelease.consignments || []).map((consignment) => Object.assign({}, consignment, { status: 'CANCELLED' }));
            return { cancelled: cancelledFulfillment, failed: [], count: cancelledFulfillment.length };
        },
    },
    DefaultCheckoutPlacementRunService: {
        save: async (request) => {
            savedPlacementRuns.push(clone(request.model));
            return { result: [request.model] };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    workflowCarrier: {
        code: 'carrier-checkout-1',
        sourceDetail: {
            cartCode: 'cart-1',
            entCode: 'enterpriseA',
            idempotencyKey: 'checkout-1',
        },
    },
    orderProjection: {
        order: { code: 'order::checkout-1' },
    },
    inventoryReservations: {
        reserved: [
            { code: 'promise-reservation-1', promiseCode: 'phone-preorder', state: 'ACTIVE' },
            { code: 'promise-reservation-2', promiseCode: 'phone-stock', state: 'ACTIVE' },
        ],
        count: 2,
    },
    fulfillmentRelease: {
        consignments: [
            { consignmentCode: 'consignment-home', status: 'RELEASED' },
        ],
    },
    failure: {
        code: 'ERR_TEST',
        message: 'Create order projection failed after promise reservation',
    },
};

(async () => {
    assert.strictEqual(properties.order.checkoutPlacement.compensation.enabled, true);
    assert.strictEqual(properties.order.checkoutPlacement.compensation.releaseInventoryReservations, true);
    assert.strictEqual(properties.order.checkoutPlacement.compensation.cancelFulfillmentReleases, true);
    assert.strictEqual(workflowActions.compensatePlacement.handler, 'DefaultCheckoutPlacementWorkflowService.compensatePlacement');
    assert.strictEqual(workflowChannels.compensate.target, 'checkoutPlacementCompensateAction');
    assert(workflowActions.createOrderProjection.channels.includes('checkoutPlacementCompensateChannel'));
    assert(workflowActions.copyAllocations.channels.includes('checkoutPlacementCompensateChannel'));
    assert(workflowActions.releaseFulfillment.channels.includes('checkoutPlacementCompensateChannel'));

    const result = await compensationService.compensate(clone(request));
    assert.strictEqual(result.state, 'COMPENSATED');
    assert.strictEqual(result.orderCode, 'order::checkout-1');
    assert.strictEqual(result.fulfillmentCancellations.count, 1);
    assert.strictEqual(cancelledFulfillment[0].status, 'CANCELLED');
    assert.strictEqual(result.inventoryReleases.count, 2);
    assert.strictEqual(result.inventoryReleases.failed.length, 0);
    assert.strictEqual(released.length, 2);
    assert.strictEqual(released[0].state, 'RELEASED');
    assert.strictEqual(released[0].reasonCode, 'CHECKOUT_PLACEMENT_FAILED');
    assert.strictEqual(savedHistory.length, 1);
    assert.strictEqual(savedHistory[0].historyCode, 'checkout-1:placement-failed');
    assert.strictEqual(savedHistory[0].eventType, 'CHECKOUT_PLACEMENT_FAILED');
    assert.strictEqual(savedHistory[0].statusTo, 'PLACEMENT_FAILED');
    assert.strictEqual(savedPlacementRuns.length, 1);
    assert.strictEqual(savedPlacementRuns[0].state, 'COMPENSATED');
    assert.strictEqual(savedPlacementRuns[0].failureCode, 'ERR_TEST');
    assert.strictEqual(savedPlacementRuns[0].evidence.releasedInventoryReservationCount, 2);
    assert.strictEqual(savedPlacementRuns[0].evidence.cancelledFulfillmentConsignmentCount, 1);

    SERVICE.DefaultCheckoutPlacementCompensationService = compensationService;
    const workflowResult = await workflowService.compensatePlacement(clone(request));
    assert.strictEqual(workflowResult.decision, 'SUCCESS');
    assert.strictEqual(workflowResult.feedback.action, 'compensatePlacement');
    assert.strictEqual(workflowResult.feedback.compensation.state, 'COMPENSATED');

    const partialFailure = clone(request);
    partialFailure.workflowCarrier.code = 'carrier-checkout-2';
    partialFailure.workflowCarrier.sourceDetail.idempotencyKey = 'checkout-2';
    partialFailure.orderProjection.order.code = 'order::checkout-2';
    partialFailure.inventoryReservations.reserved = [{ code: 'promise-reservation-fail', state: 'ACTIVE' }];
    const failed = await compensationService.compensate(partialFailure);
    assert.strictEqual(failed.state, 'COMPENSATION_FAILED');
    assert.strictEqual(failed.inventoryReleases.failed.length, 1);
    assert.strictEqual(failed.placementRun.evidence.failedInventoryReservationCount, 1);

    console.log('Checkout placement compensation contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
