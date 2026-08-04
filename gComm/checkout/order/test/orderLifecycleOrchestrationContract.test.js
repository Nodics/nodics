/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderLifecycleOrchestrationContract
 * @description Protects atomic idempotent lifecycle aggregate persistence and immutable-version Workflow submission.
 * @layer test
 * @owner order
 * @override Project modules may replace transaction or workflow selection while preserving fail-closed atomicity and optimistic version guards.
 */
const assert = require('assert');

global.ENUMS = {
    WorkflowActionType: { AUTO: { key: 'AUTO' }, MANUAL: { key: 'MANUAL' } },
    WorkflowActionPosition: { HEAD: { key: 'HEAD' } },
};

const properties = require('../config/properties');
global.CONFIG = { get: (key) => key === 'order' ? properties.order : undefined };
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) { super(String(message)); this.code = code; this.cause = cause; }
    },
};

const policy = require('../src/service/lifecycle/defaultOrderLifecycleRequestPolicyService');
const orchestration = require('../src/service/lifecycle/defaultOrderLifecycleOrchestrationService');
const workflowHeads = require('../data/init/data/lifecycle/defaultOrderLifecycleWorkflowHeadData');
const workflowActions = require('../data/init/data/lifecycle/defaultOrderLifecycleWorkflowActionData');
const workflowChannels = require('../data/init/data/lifecycle/defaultOrderLifecycleWorkflowChannelData');
const requests = [];
const requestItems = [];
let transactionExecutions = 0;
let workflowInitializations = 0;
let lastCarrier;

assert.strictEqual(workflowHeads.review.code, 'orderLifecycleRequestFlow');
assert.strictEqual(workflowHeads.review.channels[0], 'orderLifecycleRequestEvaluateChannel');
assert.strictEqual(workflowActions.evaluate.handler, 'DefaultOrderCancellationWorkflowService.evaluate');
assert.strictEqual(workflowActions.review.type, 'MANUAL');
assert.deepStrictEqual(workflowActions.review.allowedDecisions, ['SUCCESS', 'REJECT', 'INFORMATION_REQUIRED', 'ESCALATE', 'ERROR']);
assert.strictEqual(workflowActions.requestInformation.handler, 'DefaultOrderLifecycleReviewWorkflowService.requestInformation');
assert.strictEqual(workflowActions.escalate.handler, 'DefaultOrderLifecycleReviewWorkflowService.escalate');
assert.strictEqual(workflowChannels.evaluate.target, 'orderLifecycleRequestEvaluateAction');
assert.strictEqual(workflowChannels.review.qualifier.decision, 'MANUAL_REVIEW');
assert.strictEqual(workflowChannels.autoApprove.target, 'orderLifecycleRequestApproveAction');

const rows = (records, query) => records.filter((record) => Object.entries(query || {}).every(([key, value]) => record[key] === value));

global.SERVICE = {
    DefaultOrderLifecycleRequestPolicyService: policy,
    DefaultDatabaseTransactionService: {
        execute: async (scope, work) => {
            transactionExecutions += 1;
            assert.strictEqual(scope.moduleName, 'order');
            assert.strictEqual(scope.tenant, 'default');
            return work(Object.freeze({ transactionId: 'transaction-' + transactionExecutions }));
        },
    },
    DefaultOrderLifecycleRequestService: {
        get: async (request) => ({ result: rows(requests, request.query) }),
        save: async (request) => {
            assert.strictEqual(request._orderLifecycleMutationAuthorized, true);
            assert(request.transactionContext, 'request save must carry transaction context');
            requests.push(Object.assign({}, request.model));
            return { result: [request.model] };
        },
        update: async (request) => {
            assert.strictEqual(request._orderLifecycleMutationAuthorized, true);
            const index = requests.findIndex((record) => rows([record], request.query).length === 1);
            if (index < 0) return { modifiedCount: 0 };
            requests[index] = Object.assign({}, requests[index], request.model);
            return { modifiedCount: 1 };
        },
    },
    DefaultOrderLifecycleRequestItemService: {
        get: async (request) => ({ result: rows(requestItems, request.query) }),
        save: async (request) => {
            assert.strictEqual(request._orderLifecycleMutationAuthorized, true);
            assert(request.transactionContext, 'item save must carry transaction context');
            requestItems.push(Object.assign({}, request.model));
            return { result: [request.model] };
        },
        update: async (request) => {
            assert.strictEqual(request._orderLifecycleMutationAuthorized, true);
            assert(request.transactionContext, 'item decision update must carry transaction context');
            const index = requestItems.findIndex((record) => rows([record], request.query).length === 1);
            if (index < 0) return { modifiedCount: 0 };
            requestItems[index] = Object.assign({}, requestItems[index], request.model);
            return { modifiedCount: 1 };
        },
    },
    DefaultWorkflowCarrierService: { isCarrierAvailable: async () => false },
    DefaultWorkflowService: {
        initCarrier: async (request) => {
            workflowInitializations += 1;
            lastCarrier = request;
            return { result: true };
        },
    },
};

const input = {
    tenant: 'default',
    authData: { tokenType: 'access', principalId: 'employee-1' },
    orderLifecycle: {
        entCode: 'enterprise-1', orderCode: 'order-1', idempotencyKey: 'cancel-order-1-entry-1',
        requestType: 'CANCELLATION', reasonCode: 'CUSTOMER_REQUEST', customerCode: 'customer-1',
        items: [{ orderEntryCode: 'entry-1', requestedQuantity: '1', unitCode: 'EA', immutableEvidence: { orderedQuantity: '3' } }],
    },
};

(async () => {
    const created = await orchestration.createDraft(input);
    assert.strictEqual(created.idempotent, false);
    assert.strictEqual(transactionExecutions, 1);
    assert.strictEqual(requests.length, 1);
    assert.strictEqual(requestItems.length, 1);

    const replay = await orchestration.createDraft(input);
    assert.strictEqual(replay.idempotent, true);
    assert.strictEqual(transactionExecutions, 1, 'idempotent replay must not open another write transaction');

    const submitted = await orchestration.submit({
        tenant: input.tenant, authData: input.authData,
        orderLifecycle: { entCode: created.request.entCode, requestCode: created.request.requestCode },
    });
    assert.strictEqual(submitted.request.state, 'SUBMITTED');
    assert.strictEqual(submitted.request.version, 2);
    assert.strictEqual(workflowInitializations, 1);
    assert.strictEqual(lastCarrier.workflowCode, 'orderLifecycleRequestFlow');
    assert.strictEqual(lastCarrier.carrier.sourceDetail.requestVersion, 2);
    assert.strictEqual(lastCarrier.carrier.items[0].schemaName, 'orderLifecycleRequestItem');

    const submittedReplay = await orchestration.submit({
        tenant: input.tenant, authData: input.authData,
        orderLifecycle: { entCode: created.request.entCode, requestCode: created.request.requestCode },
    });
    assert.strictEqual(submittedReplay.idempotent, true);
    assert.strictEqual(workflowInitializations, 1);

    const decided = await orchestration.updateDecisionAggregate(
        { tenant: input.tenant, authData: input.authData }, submitted.request, ['SUBMITTED'],
        [{ requestItemCode: requestItems[0].requestItemCode, approvedQuantity: '0.5', rejectedQuantity: '0.5', state: 'PARTIALLY_AUTHORIZED' }],
        { state: 'AUTHORIZED', evidence: { authorizationDecision: 'PARTIALLY_AUTHORIZED' } },
    );
    assert.strictEqual(decided.state, 'AUTHORIZED');
    assert.strictEqual(requestItems[0].approvedQuantity, '0.5');
    assert.strictEqual(requestItems[0].rejectedQuantity, '0.5');
    assert.strictEqual(transactionExecutions, 2);

    await assert.rejects(
        orchestration.updateState({ tenant: input.tenant, authData: input.authData }, submitted.request, ['DRAFT'], { state: 'SUBMISSION_PENDING' }),
        (error) => error.code === 'ERR_ORD_00046',
    );

    console.log('Order lifecycle orchestration contract validated');
})().catch((error) => { console.error(error); process.exit(1); });
