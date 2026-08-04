/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderReturnWorkflowContract @description Protects Return-specific Workflow routing, authorization, and Fulfillment-owned RMA delegation. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
let record; const items = [{ requestItemCode: 'item-1', requestCode: 'return-1', orderEntryCode: 'entry-1', unitCode: 'EA', requestedQuantity: '1', immutableEvidence: { allocationReferences: ['alloc-1'] } }];
const calls = [];
global.SERVICE = {
    DefaultExactUnitsService: require('../../../../gCore/units/src/service/exact/defaultExactUnitsService'),
    DefaultOrderLifecycleAuditService: { record: async () => true },
    DefaultOrderLifecycleOrchestrationService: {
        loadRequest: async () => record, loadItems: async () => items,
        updateState: async (request, current, states, patch, increment) => { assert(states.includes(current.state)); assert.strictEqual(increment, false); record = Object.assign({}, current, patch); return record; },
        updateDecisionAggregate: async (request, current, states, decisions, patch) => { assert(states.includes(current.state)); decisions.forEach(decision => Object.assign(items.find(item => item.requestItemCode === decision.requestItemCode), decision)); record = Object.assign({}, current, patch); return record; },
    },
    DefaultPipelineService: { start: async name => { calls.push(name); return name === 'returnRequestValidationPipeline' ? { eligible: true, items: [{ orderEntryCode: 'entry-1', eligible: true }] } : { route: 'MANUAL_REVIEW' }; } },
    DefaultReturnRequestService: { requestReturn: async request => { calls.push(request); return { returnCode: 'rma-1', status: 'REQUESTED' }; } },
};
const workflow = require('../src/service/lifecycle/defaultOrderReturnWorkflowService');
const carrier = authData => ({ tenant: 'default', authData: authData || { tokenType: 'service', principalId: 'workflow' }, workflowCarrier: { code: 'orderLifecycle::return-1::2', sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'RETURN', requestCode: 'return-1', requestVersion: 2, entCode: 'ent-1', orderCode: 'order-1' } } });

(async () => {
    record = { requestCode: 'return-1', requestType: 'RETURN', version: 2, state: 'SUBMITTED', entCode: 'ent-1', orderCode: 'order-1', reasonCode: 'CUSTOMER_RETURN', requesterCode: 'customer-1', requesterType: 'CUSTOMER' };
    const evaluated = await workflow.evaluate(carrier());
    assert.strictEqual(evaluated.decision, 'MANUAL_REVIEW');
    assert.deepStrictEqual(calls.slice(0, 2), ['returnRequestValidationPipeline', 'returnAuthorizationPipeline']);
    assert.strictEqual(record.state, 'AUTHORIZATION_PENDING');
    let approval = carrier({ tokenType: 'access', principalId: 'employee-1' }); approval.workflowDecision = { items: [{ requestItemCode: 'item-1', approvedQuantity: '0.5', rejectedQuantity: '0.5', decisionReasonCode: 'PACKAGE_DAMAGED' }] };
    const authorized = await workflow.authorize(approval);
    assert.strictEqual(authorized.decision, 'SUCCESS'); assert.strictEqual(record.state, 'AUTHORIZED');
    assert.strictEqual(record.evidence.authorizationDecision, 'PARTIALLY_AUTHORIZED'); assert.strictEqual(items[0].state, 'PARTIALLY_AUTHORIZED');
    const completed = await workflow.createRma(carrier());
    assert.strictEqual(completed.decision, 'SUCCESS'); assert.strictEqual(record.state, 'PARTIALLY_COMPLETED');
    const ownerCall = calls.find(value => value && value.idempotencyKey);
    assert.strictEqual(ownerCall.idempotencyKey, 'return-1::2::item-1'); assert.strictEqual(ownerCall.requestedQuantity, '0.5');
    const replay = await workflow.createRma(carrier()); assert.strictEqual(replay.feedback.idempotent, true);
    record = { requestCode: 'return-1', requestType: 'RETURN', version: 2, state: 'AUTHORIZATION_PENDING', entCode: 'ent-1', orderCode: 'order-1', reasonCode: 'CUSTOMER_RETURN', requesterCode: 'customer-1', requesterType: 'CUSTOMER', evidence: { authorizationRoute: 'MANUAL_REVIEW' } };
    items[0] = { requestItemCode: 'item-1', requestCode: 'return-1', orderEntryCode: 'entry-1', unitCode: 'EA', requestedQuantity: '1', immutableEvidence: { allocationReferences: ['alloc-1'] } };
    const rejected = await workflow.reject(carrier({ tokenType: 'access', principalId: 'employee-1' })); assert.strictEqual(rejected.decision, 'REJECT'); assert.strictEqual(record.state, 'REJECTED');
    const projection = require('../src/service/lifecycle/defaultOrderLifecycleStatusProjectionService').project({ request: record, items: items }); assert.strictEqual(projection.statusProjection.quantities[0].rejectedQuantity, '1');
    console.log('Order Return Workflow contract validated');
})().catch(error => { console.error(error); process.exit(1); });
