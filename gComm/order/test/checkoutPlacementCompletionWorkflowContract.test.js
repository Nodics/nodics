/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/test/checkoutPlacementCompletionWorkflowContract
 * @description Protects checkout placement Workflow completion evidence across validation, reservation, order projection, allocation copy, order history, and final placement-run completion.
 * @layer test
 * @owner order
 * @override Project modules may replace individual checkout placement Workflow action services while preserving evidence propagation and completion contracts.
 */
const assert = require('assert');

const orderProperties = require('../config/properties');
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

const clone = (value) => JSON.parse(JSON.stringify(value));

let savedHistory = [];
let savedPlacementRuns = [];

global.SERVICE = {
    DefaultPipelineService: {
        start: async (name, request) => ({
            placementRun: {
                entCode: request.entCode,
                placementCode: request.idempotencyKey,
                cartCode: request.cartCode,
                workflowCarrierCode: request.workflowCarrier.code,
                pipelineName: name,
                idempotencyKey: request.idempotencyKey,
                state: 'COMPLETED',
            },
        }),
    },
    DefaultOrderCheckoutPlacementValidationService: {
        validate: async (request) => ({
            valid: true,
            cartCode: request.cartCode,
            counts: {
                entries: 1,
                deliveryGroups: 2,
                paymentGroups: 2,
                deliveryAllocations: 2,
                paymentAllocations: 2,
            },
        }),
    },
    DefaultCheckoutInventoryReservationService: {
        reserve: async (request) => ({
            cartCode: request.cartCode,
            count: 2,
            reservations: [
                { reservationCode: 'promise-reservation-1', bucketType: 'STANDARD' },
                { reservationCode: 'promise-reservation-2', bucketType: 'OVERBOOKED', paymentRequirement: 'ADVANCE' },
            ],
        }),
    },
    DefaultCheckoutOrderProjectionService: {
        create: async (request) => ({
            order: {
                code: 'order::' + request.idempotencyKey,
                cartCode: request.cartCode,
                entCode: request.entCode,
                workflowCarrierCode: request.workflowCarrier.code,
                placementCode: request.idempotencyKey,
            },
            entries: [{ orderCode: 'order::' + request.idempotencyKey, entryCode: 'entry-1' }],
            idempotent: false,
        }),
    },
    DefaultCheckoutAllocationCopyService: {
        copy: async (request) => ({
            orderCode: request.orderProjection.order.code,
            deliveryGroups: [{ deliveryGroupCode: 'ship-home' }, { deliveryGroupCode: 'pickup-store' }],
            paymentGroups: [{ paymentGroupCode: 'card-main' }, { paymentGroupCode: 'cod-balance' }],
            deliveryAllocations: [{ allocationCode: 'delivery-a1' }, { allocationCode: 'delivery-a2' }],
            paymentAllocations: [{ allocationCode: 'payment-a1' }, { allocationCode: 'payment-a2' }],
            idempotent: false,
        }),
    },
    DefaultOrderHistoryEntryService: {
        save: async (request) => {
            savedHistory.push(clone(request.model));
            return { result: [request.model] };
        },
    },
    DefaultCheckoutPlacementRunService: {
        save: async (request) => {
            savedPlacementRuns.push(clone(request.model));
            return { result: [request.model] };
        },
    },
};

const baseRequest = {
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
};

(async () => {
    const started = await workflowService.startPlacementRun(clone(baseRequest));
    assert.strictEqual(started.feedback.action, 'startPlacementRun');
    assert.strictEqual(started.feedback.placementCode, 'checkout-1');

    const validated = await workflowService.validatePlacement(Object.assign(clone(baseRequest), {
        placementCode: started.feedback.placementCode,
    }));
    assert.strictEqual(validated.feedback.validation.valid, true);

    const reserved = await workflowService.reserveInventory(Object.assign(clone(baseRequest), {
        placementCode: started.feedback.placementCode,
        validation: validated.feedback.validation,
    }));
    assert.strictEqual(reserved.feedback.inventoryReservations.count, 2);

    const projected = await workflowService.createOrderProjection(Object.assign(clone(baseRequest), {
        placementCode: started.feedback.placementCode,
        validation: validated.feedback.validation,
        inventoryReservations: reserved.feedback.inventoryReservations,
    }));
    assert.strictEqual(projected.feedback.orderCode, 'order::checkout-1');

    const copied = await workflowService.copyAllocations(Object.assign(clone(baseRequest), {
        placementCode: started.feedback.placementCode,
        orderProjection: projected.feedback.orderProjection,
    }));
    assert.strictEqual(copied.feedback.allocationCopy.deliveryAllocations.length, 2);

    const history = await workflowService.recordHistory(Object.assign(clone(baseRequest), {
        placementCode: started.feedback.placementCode,
        orderProjection: projected.feedback.orderProjection,
        allocationCopy: copied.feedback.allocationCopy,
        inventoryReservations: reserved.feedback.inventoryReservations,
        paymentAuthorization: { authorized: [{ transactionCode: 'tx-card' }], deferred: [{ transactionCode: 'tx-cod' }], failed: [], count: 2 },
        fulfillmentRelease: { consignments: [{ consignmentCode: 'consignment-home' }, { consignmentCode: 'consignment-pickup' }], count: 2 },
    }));
    assert.strictEqual(history.feedback.action, 'recordHistory');
    assert.strictEqual(history.feedback.orderCode, 'order::checkout-1');
    assert.strictEqual(savedHistory.length, 1);
    assert.strictEqual(savedHistory[0].historyCode, 'checkout-1:placement');
    assert.strictEqual(savedHistory[0].orderCode, 'order::checkout-1');
    assert.strictEqual(savedHistory[0].eventType, 'CHECKOUT_PLACEMENT');
    assert.strictEqual(savedHistory[0].sourceOperation, 'checkoutPlacementWorkflow.recordHistory');
    assert.strictEqual(savedHistory[0].evidenceCode, 'checkout-1');

    const completed = await workflowService.completePlacement(Object.assign(clone(baseRequest), {
        placementCode: started.feedback.placementCode,
        orderProjection: projected.feedback.orderProjection,
        allocationCopy: copied.feedback.allocationCopy,
        inventoryReservations: reserved.feedback.inventoryReservations,
        paymentAuthorization: { authorized: [{ transactionCode: 'tx-card' }], deferred: [{ transactionCode: 'tx-cod' }], failed: [], count: 2 },
        fulfillmentRelease: { consignments: [{ consignmentCode: 'consignment-home' }, { consignmentCode: 'consignment-pickup' }], count: 2 },
    }));
    assert.strictEqual(completed.feedback.action, 'completePlacement');
    assert.strictEqual(completed.feedback.orderCode, 'order::checkout-1');
    assert.strictEqual(completed.feedback.placementRun.state, 'COMPLETED');
    assert.strictEqual(completed.feedback.completionEvidence.inventoryReservationCount, 2);
    assert.strictEqual(completed.feedback.completionEvidence.deliveryAllocationCount, 2);
    assert.strictEqual(completed.feedback.completionEvidence.paymentAllocationCount, 2);
    assert.strictEqual(completed.feedback.completionEvidence.paymentAuthorizationCount, 2);
    assert.strictEqual(completed.feedback.completionEvidence.paymentDeferredCount, 1);
    assert.strictEqual(completed.feedback.completionEvidence.fulfillmentReleaseCount, 2);
    assert.strictEqual(savedPlacementRuns.length, 1);
    assert.strictEqual(savedPlacementRuns[0].orderCode, 'order::checkout-1');
    assert.strictEqual(savedPlacementRuns[0].currentStep, 'completePlacement');

    await assert.rejects(
        () => workflowService.recordHistory(clone(baseRequest)),
        (error) => error.code === 'ERR_ORD_00026' && error.message.includes('requires produced orderCode')
    );

    console.log('Checkout placement completion Workflow contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
