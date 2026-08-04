/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentReturnRequestContract
 * @description Protects Fulfillment-owned return request, pickup, received, and closure evidence.
 * @layer test
 * @owner fulfillment
 * @override Project modules may customize approval, pickup, inspection, and disposition while preserving Fulfillment authority.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultFulfillmentPolicyService');
const returnService = require('../src/service/return/defaultReturnRequestService');

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
let savedReturns = [];

global.SERVICE = {
    DefaultFulfillmentPolicyService: policyService,
    DefaultFulfillmentReturnRequestService: {
        get: async (request) => ({
            result: savedReturns.filter((item) => {
                if (request.query.returnCode) return item.returnCode === request.query.returnCode;
                return item.idempotencyKey === request.query.idempotencyKey;
            }),
        }),
        save: async (request) => {
            let model = clone(request.model);
            let index = savedReturns.findIndex((item) => item.returnCode === model.returnCode);
            if (index >= 0) savedReturns[index] = model;
            else savedReturns.push(model);
            return { result: [request.model] };
        },
    },
};

const baseRequest = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    entCode: 'enterpriseA',
    orderCode: 'order::checkout-1',
    consignmentCode: 'consignment::checkout-1',
    shipmentCode: 'shipment::checkout-1',
    returnReasonCode: 'DAMAGED',
    requestedQuantity: '2',
    allocationCodes: ['order-delivery-allocation-1'],
    inventoryAllocationCodes: ['inventory-allocation-1'],
    itemCodes: ['entry-1'],
};

(async () => {
    const created = await returnService.requestReturn(clone(baseRequest));
    assert.strictEqual(created.status, 'REQUESTED');
    assert.strictEqual(created.enterpriseCode, 'enterpriseA');
    assert.strictEqual(created.returnType, 'CUSTOMER_RETURN');
    assert.strictEqual(created.returnCode.startsWith('return::'), true);
    assert.strictEqual(created.requestedQuantity, '2');
    assert.strictEqual(savedReturns.length, 1);

    const replay = await returnService.requestReturn(clone(baseRequest));
    assert.strictEqual(replay.idempotent, true);
    assert.strictEqual(savedReturns.length, 1);

    const approved = await returnService.approveReturn(Object.assign(clone(baseRequest), {
        returnCode: created.returnCode,
        dispositionCode: 'INSPECT',
        refundPolicyCode: 'refund-after-inspection',
    }));
    assert.strictEqual(approved.status, 'APPROVED');
    assert.strictEqual(approved.refundPolicyCode, 'refund-after-inspection');

    const pickup = await returnService.requestPickup(Object.assign(clone(baseRequest), {
        returnCode: created.returnCode,
        returnShipmentCode: 'return-shipment-1',
    }));
    assert.strictEqual(pickup.status, 'PICKUP_REQUESTED');
    assert.strictEqual(pickup.returnShipmentCode, 'return-shipment-1');

    const received = await returnService.receiveReturn(Object.assign(clone(baseRequest), {
        returnCode: created.returnCode,
        receivedQuantity: '1',
    }));
    assert.strictEqual(received.status, 'RECEIVED');
    assert.strictEqual(received.receivedQuantity, '1');

    const closed = await returnService.closeReturn(Object.assign(clone(baseRequest), {
        returnCode: created.returnCode,
        dispositionCode: 'RESTOCK',
        inspectionResult: 'SELLABLE',
    }));
    assert.strictEqual(closed.status, 'CLOSED');
    assert.strictEqual(closed.dispositionCode, 'RESTOCK');
    assert(properties.fulfillment.fulfillmentPolicy.returnDisposition.supportedDispositionCodes.includes('MISSING'));
    assert(properties.fulfillment.fulfillmentPolicy.returnDisposition.supportedDispositionCodes.includes('RETURN_TO_VENDOR'));
    const missingIntent = SERVICE.DefaultFulfillmentPolicyService.buildReturnDispositionIntent({ dispositionCode: 'MISSING', receivedQuantity: '1' }, Object.assign({}, closed, { returnCode: 'return-missing' }));
    assert.strictEqual(missingIntent, undefined);
    const returnToVendorIntent = SERVICE.DefaultFulfillmentPolicyService.buildReturnDispositionIntent({ dispositionCode: 'RETURN_TO_VENDOR', receivedQuantity: '1' }, Object.assign({}, closed, { returnCode: 'return-rtv' }));
    assert.strictEqual(returnToVendorIntent.dispositionCode, 'RETURN_TO_VENDOR');
    assert.strictEqual(returnToVendorIntent.movementType, 'RETURN');
    assert.strictEqual(closed.inspectionResult, 'SELLABLE');
    assert.strictEqual(closed.inventoryDispositionIntent.ownerModule, 'inventory');
    assert.strictEqual(closed.inventoryDispositionIntent.movementType, 'RETURN');
    assert.strictEqual(closed.inventoryDispositionIntent.status, 'PENDING_INVENTORY_MOVEMENT');
    assert.deepStrictEqual(closed.inventoryDispositionIntent.inventoryAllocationCodes, ['inventory-allocation-1']);

    const recoveryReview = await returnService.reviewReturnRecovery(Object.assign(clone(baseRequest), {
        returnCode: created.returnCode,
    }));
    assert.strictEqual(recoveryReview.recoveryOwner, 'fulfillment');
    assert.strictEqual(recoveryReview.recoveryAction, 'REVIEW_RETURN');
    assert.strictEqual(recoveryReview.recoveryStatus, 'RETURN_TERMINAL');
    assert.strictEqual(recoveryReview.recovered, true);
    assert.deepStrictEqual(recoveryReview.nextActions, []);

    const pendingReturn = await returnService.requestReturn(Object.assign(clone(baseRequest), {
        orderCode: 'order::checkout-review',
        idempotencyKey: 'return-review',
    }));
    const pendingRecoveryReview = await returnService.reviewReturnRecovery(Object.assign(clone(baseRequest), {
        returnCode: pendingReturn.returnCode,
    }));
    assert.strictEqual(pendingRecoveryReview.recoveryStatus, 'RETURN_REVIEW_REQUIRED');
    assert.strictEqual(pendingRecoveryReview.recovered, false);
    assert.deepStrictEqual(pendingRecoveryReview.nextActions, ['REVIEW_RETURN', 'CLOSE_OR_CANCEL_RETURN']);

    await assert.rejects(
        () => returnService.approveReturn(Object.assign(clone(baseRequest), { returnCode: created.returnCode })),
        (error) => error.code === 'ERR_FUL_00007' && error.message.includes('unsupported')
    );

    const secondReturn = await returnService.requestReturn(Object.assign(clone(baseRequest), {
        orderCode: 'order::checkout-2',
        idempotencyKey: 'return-2',
    }));
    await returnService.approveReturn(Object.assign(clone(baseRequest), { returnCode: secondReturn.returnCode }));
    await returnService.receiveReturn(Object.assign(clone(baseRequest), { returnCode: secondReturn.returnCode }));
    await assert.rejects(
        () => returnService.closeReturn(Object.assign(clone(baseRequest), {
            returnCode: secondReturn.returnCode,
            dispositionCode: 'DONATE_TO_RANDOM_PLACE',
        })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('disposition is unsupported')
    );

    await assert.rejects(
        () => returnService.requestReturn(Object.assign(clone(baseRequest), {
            idempotencyKey: 'unsafe-return',
            rawCarrierPayload: { token: 'never-store' },
        })),
        (error) => error.code === 'ERR_FUL_00001' && error.message.includes('must not store provider secrets')
    );

    console.log('Fulfillment return request contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
