/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderCancellationWorkflowContract
 * @description Protects Workflow-owned cancellation evaluation and approval routing bound to immutable lifecycle request versions.
 * @layer test
 * @owner order
 * @override Projects may replace approval policy while preserving configured pipeline execution, version guards, and no owner execution side effects.
 */
const assert = require('assert');

const properties = require('../config/properties');
global.CONFIG = { get: (key) => key === 'order' ? properties.order : undefined };
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) { super(String(message)); this.cause = cause; this.code = code; }
    },
};

const workflow = require('../src/service/lifecycle/defaultOrderCancellationWorkflowService');
const pipelineCalls = [];
let record;
let itemRecords;
let eligibilityResult;
let calculationResult;

global.SERVICE = {
    DefaultOrderLifecycleAuditService: { record: async () => true },
    DefaultOrderLifecycleOrchestrationService: {
        loadRequest: async () => record,
        loadItems: async () => itemRecords,
        updateState: async (request, current, expectedStates, patch, incrementVersion) => {
            assert(expectedStates.includes(current.state));
            assert.strictEqual(incrementVersion, false, 'submitted request version must remain immutable');
            record = Object.assign({}, current, patch);
            return record;
        },
    },
    DefaultPipelineService: {
        start: async (name) => {
            pipelineCalls.push(name);
            if (name === 'orderCancellationEligibilityPipeline') return eligibilityResult;
            if (name === 'orderCancellationCalculationPipeline') return calculationResult;
            if (name === 'orderCancellationExecutionPipeline') {
                record = Object.assign({}, record, { state: 'EXECUTING', evidence: Object.assign({}, record.evidence, { execution: { currentStep: 'ORDER_FINALIZED' } }) });
                return { order: { code: 'order-1', status: 'PARTIALLY_CANCELLED' } };
            }
            throw new Error('unexpected pipeline ' + name);
        },
    },
};

const carrierRequest = (version) => ({
    tenant: 'default', authData: { tokenType: 'service', principalId: 'workflow' },
    workflowCarrier: {
        code: 'orderLifecycle::request-1::' + version,
        sourceDetail: {
            processType: 'orderLifecycleRequest', requestType: 'CANCELLATION', requestCode: 'request-1',
            requestVersion: version, entCode: 'enterprise-1', orderCode: 'order-1', idempotencyKey: 'cancel-1',
        },
    },
    order: { code: 'order-1', status: 'PLACED', placedAt: '2026-08-03T09:00:00.000Z' },
});

const reset = (version, requesterType) => {
    record = {
        requestCode: 'request-1', requestType: 'CANCELLATION', entCode: 'enterprise-1', orderCode: 'order-1',
        idempotencyKey: 'cancel-1', state: 'SUBMITTED', version: version, requesterType: requesterType, requesterCode: 'employee-1',
    };
    itemRecords = [{
        requestItemCode: 'request-item-1', orderEntryCode: 'entry-1', requestedQuantity: '1', unitCode: 'EA',
        immutableEvidence: { orderedQuantity: '3', alreadyCancelledQuantity: '0' },
    }];
    eligibilityResult = { eligible: true, orderCode: 'order-1', items: [{ orderEntryCode: 'entry-1', requestedQuantity: '1', eligible: true }] };
    calculationResult = { calculationCode: 'calculation-1', amount: '5', eligibleAmount: '5', currencyCode: 'USD', evidence: {} };
};

(async () => {
    reset(2, 'EMPLOYEE');
    const manual = await workflow.evaluate(carrierRequest(2));
    assert.strictEqual(manual.decision, 'MANUAL_REVIEW');
    assert.deepStrictEqual(pipelineCalls.slice(-2), ['orderCancellationEligibilityPipeline', 'orderCancellationCalculationPipeline']);
    assert.strictEqual(record.state, 'APPROVAL_PENDING');
    assert.strictEqual(record.version, 2);
    assert.strictEqual(record.evidence.requestVersion, 2);
    assert.strictEqual(record.evidence.calculation.amount, '5');

    const replay = await workflow.evaluate(carrierRequest(2));
    assert.strictEqual(replay.decision, 'MANUAL_REVIEW');
    assert.strictEqual(replay.feedback.idempotent, true);

    const manualApprovalRequest = carrierRequest(2);
    manualApprovalRequest.authData = { tokenType: 'access', principalId: 'employee-2' };
    const approved = await workflow.approve(manualApprovalRequest);
    assert.strictEqual(approved.decision, 'SUCCESS');
    assert.strictEqual(record.state, 'APPROVED');
    assert.strictEqual(record.version, 2);
    assert.strictEqual(record.evidence.approvalDecision, 'APPROVED');
    assert.strictEqual(record.evidence.approvalActor.actorCode, 'employee-2');

    const executed = await workflow.execute(carrierRequest(2));
    assert.strictEqual(executed.decision, 'SUCCESS');
    assert.strictEqual(record.state, 'COMPLETED');
    assert.strictEqual(record.evidence.execution.currentStep, 'COMPLETED');
    assert.strictEqual(pipelineCalls.slice(-1)[0], 'orderCancellationExecutionPipeline');
    const executionReplay = await workflow.execute(carrierRequest(2));
    assert.strictEqual(executionReplay.feedback.idempotent, true);

    reset(2, 'EMPLOYEE');
    record.state = 'APPROVAL_PENDING';
    record.evidence = { requestVersion: 2, approvalRoute: 'MANUAL_REVIEW' };
    const selfApproval = carrierRequest(2);
    selfApproval.authData = { tokenType: 'access', principalId: 'employee-1' };
    await assert.rejects(workflow.approve(selfApproval), /cannot approve the same request/);

    await assert.rejects(workflow.evaluate(carrierRequest(3)), (error) => error.code === 'ERR_ORD_00052');

    const approvalPolicy = properties.order.orderLifecycle.workflow.approval;
    approvalPolicy.autoApprovalEnabled = true;
    approvalPolicy.autoApprovalMaximumAmount = '10';
    reset(3, 'SERVICE');
    const automatic = await workflow.evaluate(carrierRequest(3));
    assert.strictEqual(automatic.decision, 'AUTO_APPROVE');
    assert.strictEqual(record.evidence.approvalRoute, 'AUTO_APPROVE');

    reset(4, 'CUSTOMER');
    eligibilityResult = { eligible: false, orderCode: 'order-1', items: [{ orderEntryCode: 'entry-1', eligible: false, reasons: ['FULFILLMENT_ALREADY_SHIPPED'] }] };
    const denied = await workflow.evaluate(carrierRequest(4));
    assert.strictEqual(denied.decision, 'REJECT');
    assert.strictEqual(record.state, 'APPROVAL_PENDING');
    assert.strictEqual(record.evidence.approvalRoute, 'REJECT');
    const rejected = await workflow.reject(carrierRequest(4));
    assert.strictEqual(rejected.decision, 'REJECT');
    assert.strictEqual(record.state, 'REJECTED');
    assert.strictEqual(record.version, 4);

    approvalPolicy.autoApprovalEnabled = false;
    approvalPolicy.autoApprovalMaximumAmount = '0';
    console.log('Order cancellation Workflow contract validated');
})().catch((error) => { console.error(error); process.exit(1); });
