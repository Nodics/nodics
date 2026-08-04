/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module fulfillment/test/returnReceiptDispositionPipelineContract @description Protects pipeline-ordered receipt, inspection, Inventory disposition delegation, and close evidence. @layer test @owner fulfillment */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'fulfillment' ? properties.fulfillment : undefined };
let state = { returnCode: 'return-1', status: 'APPROVED', requestedQuantity: '1', inventoryAllocationCodes: ['allocation-1'] };
const calls = [];
global.SERVICE = {
    DefaultReturnRequestService: {
        loadReturn: async () => state,
        receiveReturn: async request => { calls.push('receive'); state = Object.assign({}, state, { status: 'RECEIVED', receivedQuantity: request.receivedQuantity }); return state; },
        inspectReturn: async request => { calls.push('inspect'); state = Object.assign({}, state, { status: 'INSPECTED', dispositionCode: request.dispositionCode, inventoryDispositionIntent: { sourceCode: 'return-1', dispositionCode: request.dispositionCode, inventoryAllocationCodes: ['allocation-1'] } }); return state; },
        closeReturn: async request => { calls.push('close'); state = Object.assign({}, state, { status: 'CLOSED', inventoryDispositionEvidence: request.inventoryDispositionEvidence }); return state; },
    },
    DefaultReturnDispositionMovementService: { execute: async request => { calls.push('inventory'); assert.strictEqual(request.dispositionIntent.sourceCode, 'return-1'); return { status: 'INVENTORY_DISPOSITION_APPLIED', movements: [{ code: 'movement-1' }] }; } },
};
const service = require('../src/service/return/defaultReturnReceiptDispositionService');
const request = { tenant: 'default', authData: { tokenType: 'service' }, returnReceiptDisposition: { returnCode: 'return-1', receivedQuantity: '1', dispositionCode: 'RESTOCK', inspectionResult: 'SELLABLE' } };
const response = {};
const invoke = method => new Promise((resolve, reject) => service[method](request, response, { nextSuccess: resolve, error: (req, res, error) => reject(error) }));

(async () => {
    await invoke('validateReceipt'); await invoke('receiveReturn'); await invoke('inspectReturn'); await invoke('applyInventoryDisposition'); await invoke('closeReturn');
    assert.deepStrictEqual(calls, ['receive', 'inspect', 'inventory', 'close']);
    assert.strictEqual(response.closedReturn.status, 'CLOSED');
    assert.strictEqual(response.closedReturn.inventoryDispositionEvidence.movements[0].code, 'movement-1');
    let invalidResponse = {}; await assert.rejects(() => new Promise((resolve, reject) => service.validateReceipt({ tenant: 'default', authData: { tokenType: 'access' }, returnReceiptDisposition: request.returnReceiptDisposition }, invalidResponse, { nextSuccess: resolve, error: (req, res, error) => reject(error) })), /internal identity/);
    console.log('Fulfillment Return receipt disposition Pipeline contract validated');
})().catch(error => { console.error(error); process.exit(1); });
