/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderRefundWorkflowContract @description Protects exact Refund calculation, maker-checker approval, Payment execution, and reconciliation routing. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, cause, code) { super(message); this.code = code; } } };
let record; const items = [{ requestItemCode: 'item-1', orderEntryCode: 'entry-1', requestedQuantity: '1', unitCode: 'EA', immutableEvidence: {} }]; const calls = [];
global.SERVICE = {
    DefaultOrderLifecycleAuditService: { record: async () => true },
    DefaultOrderLifecycleOrchestrationService: { loadRequest: async () => record, loadItems: async () => items, updateState: async (request, current, states, patch, increment) => { assert(states.includes(current.state)); assert.strictEqual(increment, false); record = Object.assign({}, current, patch); return record; } },
    DefaultPipelineService: { start: async name => { calls.push(name); if (name === 'refundCalculationPipeline') return { amount: '8.50', currencyCode: 'USD', paymentCalculation: { allocationEvidence: [{ originalTransactionCode: 'capture-1', paymentGroupCode: 'card', amount: '8.50', currencyCode: 'USD' }] } }; if (name === 'refundApprovalPreparationPipeline') return { route: 'MANUAL_REVIEW', riskEvidence: {} }; if (name === 'refundExecutionPipeline') return { transactions: [{ transactionCode: 'refund-tx-1', status: 'REFUNDED' }] }; throw new Error('unexpected pipeline'); } },
};
const workflow = require('../src/service/lifecycle/defaultOrderRefundWorkflowService');
const carrier = authData => ({ tenant: 'default', authData: authData || { tokenType: 'service', principalId: 'workflow' }, workflowCarrier: { code: 'orderLifecycle::refund-1::1', sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'REFUND', requestCode: 'refund-1', requestVersion: 1, entCode: 'ent-1', orderCode: 'order-1' } } });
(async () => {
    record = { requestCode: 'refund-1', requestType: 'REFUND', version: 1, state: 'SUBMITTED', entCode: 'ent-1', orderCode: 'order-1', idempotencyKey: 'refund-key', requesterCode: 'support-1', requesterType: 'EMPLOYEE' };
    let evaluated = await workflow.evaluate(carrier()); assert.strictEqual(evaluated.decision, 'MANUAL_REVIEW'); assert.deepStrictEqual(calls.slice(0, 2), ['refundCalculationPipeline', 'refundApprovalPreparationPipeline']); assert.strictEqual(record.state, 'APPROVAL_PENDING');
    await assert.rejects(() => workflow.approve(carrier({ tokenType: 'access', principalId: 'support-1' })), /cannot approve/);
    let approved = await workflow.approve(carrier({ tokenType: 'access', principalId: 'finance-1' })); assert.strictEqual(approved.decision, 'SUCCESS'); assert.strictEqual(record.state, 'APPROVED');
    let executed = await workflow.execute(carrier()); assert.strictEqual(executed.decision, 'SUCCESS'); assert.strictEqual(record.state, 'COMPLETED'); assert.strictEqual(record.evidence.paymentExecution.transactions[0].status, 'REFUNDED');
    let replay = await workflow.execute(carrier()); assert.strictEqual(replay.feedback.idempotent, true);
    console.log('Order Refund Workflow contract validated');
})().catch(error => { console.error(error); process.exit(1); });
