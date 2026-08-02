/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/checkoutReverseWorkflowContract
 * @description Protects reverse checkout as an Order-coordinated Workflow that delegates return evidence to Fulfillment and refund evidence to Payment.
 * @layer test
 * @owner order
 * @override Project modules may replace reverse workflow actions while preserving owner-delegated Fulfillment and Payment boundaries.
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
    ReasonType: {
        ORDERSTATUS: { key: 'ORDERSTATUS' },
        PAYMENT: { key: 'PAYMENT' },
        SHIPMENT: { key: 'SHIPMENT' },
    },
};

const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas');
const reverseHeads = require('../data/init/data/reverse/defaultCheckoutReverseWorkflowHeadData');
const reverseActions = require('../data/init/data/reverse/defaultCheckoutReverseWorkflowActionData');
const reverseChannels = require('../data/init/data/reverse/defaultCheckoutReverseWorkflowChannelData');
const reverseHeadHeader = require('../data/init/header/reverse/defaultCheckoutReverseWorkflowHeadHeader');
const reverseActionHeader = require('../data/init/header/reverse/defaultCheckoutReverseWorkflowActionHeader');
const reverseChannelHeader = require('../data/init/header/reverse/defaultCheckoutReverseWorkflowChannelHeader');
const reverseWorkflowService = require('../src/service/reverse/defaultCheckoutReverseWorkflowService');

const reverseConfig = properties.order.checkoutReverse;
const reverseSchema = schemas.order.checkoutReverseRun;
const navigation = properties.backofficeCapabilities.order.navigation;
const byId = Object.fromEntries(navigation.map((item) => [item.id, item]));

assert.strictEqual(reverseConfig.enabled, true);
assert.strictEqual(reverseConfig.workflow.defaultMode, 'MANUAL');
assert.strictEqual(reverseConfig.workflow.manualWorkflowCode, 'checkoutReverseManualFlow');
assert.strictEqual(reverseConfig.workflow.automaticWorkflowCode, 'checkoutReverseAutomaticFlow');
assert.strictEqual(reverseConfig.returnRequest.ownerModule, 'fulfillment');
assert.strictEqual(reverseConfig.returnRequest.recoveryService, 'DefaultReturnRequestService');
assert.strictEqual(reverseConfig.returnRequest.defaultDispositionCode, 'INSPECT');
assert.strictEqual(reverseConfig.inventoryDisposition.ownerModule, 'inventory');
assert.strictEqual(reverseConfig.inventoryDisposition.service, 'DefaultReturnDispositionMovementService');
assert.strictEqual(reverseConfig.inventoryDisposition.recoveryService, 'DefaultReturnDispositionMovementService');
assert.strictEqual(reverseConfig.paymentRefund.ownerModule, 'payment');
assert.strictEqual(reverseConfig.paymentRefund.requireReceivedReturnBeforeRefund, true);
assert.strictEqual(reverseConfig.paymentRefund.calculateBeforeRefund, true);
assert.strictEqual(reverseConfig.paymentRefund.allocationSourceService, 'DefaultOrderPaymentAllocationService');
assert.strictEqual(reverseConfig.paymentRefund.recoveryService, 'DefaultPaymentRefundService');
assert.strictEqual(reverseConfig.compensation.state, 'COMPENSATING');
assert.strictEqual(reverseConfig.compensation.recoveryStrategies.INVENTORY_DISPOSITION_APPLIED, 'PAYMENT_RETRY_REQUIRED');
assert.strictEqual(reverseConfig.compensation.recoveryStrategies.REFUNDED, 'ORDER_HISTORY_RETRY_REQUIRED');
assert.deepStrictEqual(reverseConfig.compensation.ownerActions.fulfillment, ['REVIEW_RETURN', 'CLOSE_OR_CANCEL_RETURN']);
assert.deepStrictEqual(reverseConfig.compensation.ownerActions.inventory, ['REVIEW_DISPOSITION_MOVEMENT', 'ADJUST_THROUGH_STOCK_MOVEMENT']);
assert.deepStrictEqual(reverseConfig.compensation.ownerActions.payment, ['RETRY_REFUND', 'RECONCILE_PROVIDER_REFUND']);

assert.strictEqual(reverseSchema.model, true);
assert.strictEqual(reverseSchema.service.enabled, true);
assert.strictEqual(reverseSchema.router.enabled, true, 'reverse runs must be visible through governed Schema Workbench operations');
assert.strictEqual(reverseSchema.refSchema.orderCode.schemaName, 'order');
assert.strictEqual(reverseSchema.definition.reverseCode.required, true);
assert.strictEqual(reverseSchema.definition.orderCode.required, true);
assert.strictEqual(reverseSchema.definition.returnCode.required, false);
assert.strictEqual(reverseSchema.definition.refundCalculationCode.required, false);
assert.strictEqual(reverseSchema.definition.refundTransactionCode.required, false);
assert.strictEqual(reverseSchema.definition.failureMessage.description.includes('Do not store secrets'), true);
assert.strictEqual(reverseSchema.definition.recoveryStrategy.searchOptions.enabled, true);
assert.strictEqual(reverseSchema.definition.recoveryOwner.searchOptions.enabled, true);
assert.strictEqual(reverseSchema.indexes.individual.idempotencyKey.options.unique, true);
assert.strictEqual(byId['checkout-reverse-runs'].workbenchTarget.schemaName, 'checkoutReverseRun');

assert.strictEqual(reverseHeads.manual.code, 'checkoutReverseManualFlow');
assert.deepStrictEqual(reverseHeads.automatic.channels, ['checkoutReverseAutomaticStartChannel']);
assert.strictEqual(reverseActions.manualReview.type, 'MANUAL');
assert.strictEqual(reverseActions.startReverseRun.handler, 'DefaultCheckoutReverseWorkflowService.startReverseRun');
assert.strictEqual(reverseActions.requestReturn.handler, 'DefaultCheckoutReverseWorkflowService.requestReturn');
assert.strictEqual(reverseActions.approveReturn.handler, 'DefaultCheckoutReverseWorkflowService.approveReturn');
assert.strictEqual(reverseActions.receiveReturn.handler, 'DefaultCheckoutReverseWorkflowService.receiveReturn');
assert.strictEqual(reverseActions.receiveReturn.channels[0], 'checkoutReverseDisposeReturnChannel');
assert.strictEqual(reverseActions.disposeReturn.handler, 'DefaultCheckoutReverseWorkflowService.disposeReturn');
assert.strictEqual(reverseActions.disposeReturn.channels[0], 'checkoutReverseApplyInventoryDispositionChannel');
assert.strictEqual(reverseActions.applyInventoryDisposition.handler, 'DefaultCheckoutReverseWorkflowService.applyInventoryDisposition');
assert.strictEqual(reverseActions.applyInventoryDisposition.channels[0], 'checkoutReverseCalculateRefundChannel');
assert.strictEqual(reverseActions.calculateRefund.handler, 'DefaultCheckoutReverseWorkflowService.calculateRefund');
assert.strictEqual(reverseActions.refundPayment.handler, 'DefaultCheckoutReverseWorkflowService.refundPayment');
assert.strictEqual(reverseActions.recoverFulfillment.handler, 'DefaultCheckoutReverseWorkflowService.recoverFulfillment');
assert.strictEqual(reverseActions.recoverInventory.handler, 'DefaultCheckoutReverseWorkflowService.recoverInventory');
assert.strictEqual(reverseActions.recoverPayment.handler, 'DefaultCheckoutReverseWorkflowService.recoverPayment');
assert.strictEqual(reverseActions.recordHistory.handler, 'DefaultCheckoutReverseWorkflowService.recordHistory');
assert.strictEqual(reverseActions.recoverHistory.handler, 'DefaultCheckoutReverseWorkflowService.recoverHistory');
assert.strictEqual(reverseActions.completeReverse.handler, 'DefaultCheckoutReverseWorkflowService.completeReverse');
assert.strictEqual(reverseActions.compensateReverse.handler, 'DefaultCheckoutReverseWorkflowService.compensateReverse');
assert.strictEqual(reverseChannels.requestReturn.target, 'checkoutReverseRequestReturnAction');
assert.strictEqual(reverseChannels.disposeReturn.target, 'checkoutReverseDisposeReturnAction');
assert.strictEqual(reverseChannels.applyInventoryDisposition.target, 'checkoutReverseApplyInventoryDispositionAction');
assert.strictEqual(reverseChannels.calculateRefund.target, 'checkoutReverseCalculateRefundAction');
assert.strictEqual(reverseChannels.refundPayment.target, 'checkoutReverseRefundPaymentAction');
assert.strictEqual(reverseChannels.compensate.qualifier.decision, 'ERROR');
assert.strictEqual(reverseHeadHeader.workflow.defaultCheckoutReverseWorkflowHead.options.schemaName, 'workflowAction');
assert.strictEqual(reverseActionHeader.workflow.defaultCheckoutReverseWorkflowAction.options.schemaName, 'workflowAction');
assert.strictEqual(reverseChannelHeader.workflow.defaultCheckoutReverseWorkflowChannel.options.schemaName, 'workflowChannel');

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

let submittedCarrier = null;
let savedRuns = [];
let savedHistory = [];
let ownerCalls = [];
global.SERVICE = {
    DefaultWorkflowCarrierService: {
        isCarrierAvailable: async () => false,
    },
    DefaultWorkflowService: {
        initCarrier: async (request) => {
            submittedCarrier = request;
            return { result: true };
        },
    },
    DefaultCheckoutReverseRunService: {
        save: async (request) => {
            savedRuns.push(request.model);
            return { result: [request.model] };
        },
    },
    DefaultReturnRequestService: {
        requestReturn: async (request) => {
            ownerCalls.push({ owner: 'fulfillment', action: 'requestReturn', request });
            return { returnCode: request.returnCode || 'return::reverse-1', status: 'REQUESTED', orderCode: request.orderCode };
        },
        approveReturn: async (request) => {
            ownerCalls.push({ owner: 'fulfillment', action: 'approveReturn', request });
            return { returnCode: request.returnCode, status: 'APPROVED', orderCode: request.orderCode };
        },
        receiveReturn: async (request) => {
            ownerCalls.push({ owner: 'fulfillment', action: 'receiveReturn', request });
            return { returnCode: request.returnCode, status: 'RECEIVED', receivedQuantity: request.receivedQuantity, orderCode: request.orderCode };
        },
        closeReturn: async (request) => {
            ownerCalls.push({ owner: 'fulfillment', action: 'disposeReturn', request });
            return {
                returnCode: request.returnCode,
                status: 'CLOSED',
                receivedQuantity: request.receivedQuantity,
                dispositionCode: request.dispositionCode,
                inventoryDispositionIntent: {
                    ownerModule: 'inventory',
                    status: 'PENDING_INVENTORY_MOVEMENT',
                    sourceType: 'FULFILLMENT_RETURN',
                    sourceCode: request.returnCode,
                    movementType: 'RETURN',
                    dispositionCode: request.dispositionCode,
                    inventoryAllocationCodes: ['inventory-allocation-1'],
                },
                orderCode: request.orderCode,
            };
        },
        reviewReturnRecovery: async (request) => {
            ownerCalls.push({ owner: 'fulfillment', action: 'reviewReturnRecovery', request });
            return {
                recovered: false,
                recoveryAction: request.recoveryAction || 'REVIEW_RETURN',
                recoveryOwner: 'fulfillment',
                recoveryStatus: 'RETURN_REVIEW_REQUIRED',
                returnCode: request.returnCode,
                orderCode: request.orderCode,
                status: 'RECEIVED',
                nextActions: ['REVIEW_RETURN', 'CLOSE_OR_CANCEL_RETURN'],
            };
        },
    },
    DefaultReturnDispositionMovementService: {
        execute: async (request) => {
            ownerCalls.push({ owner: 'inventory', action: 'applyInventoryDisposition', request });
            return {
                status: 'INVENTORY_DISPOSITION_APPLIED',
                sourceCode: request.dispositionIntent.sourceCode,
                movements: [{ code: 'movement::return-1', state: 'APPLIED', movementType: 'RETURN' }],
            };
        },
        reviewDispositionRecovery: async (request) => {
            ownerCalls.push({ owner: 'inventory', action: 'reviewDispositionRecovery', request });
            return {
                recovered: true,
                recoveryAction: request.recoveryAction || 'REVIEW_DISPOSITION_MOVEMENT',
                recoveryOwner: 'inventory',
                recoveryStatus: 'MOVEMENT_FOUND',
                sourceCode: request.dispositionIntent.sourceCode,
                movementCodes: ['movement::return-1'],
                movements: [{ code: 'movement::return-1', state: 'APPLIED', movementType: 'RETURN' }],
                nextActions: [],
            };
        },
    },
    DefaultOrderPaymentAllocationService: {
        get: async (request) => {
            ownerCalls.push({ owner: 'order', action: 'loadPaymentAllocations', request });
            return {
                result: [
                    {
                        allocationCode: 'payment-allocation-1',
                        sourceAllocationCode: 'cart-allocation-1',
                        paymentGroupCode: 'card-main',
                        amount: '12.50',
                        currencyCode: 'USD',
                    },
                ],
            };
        },
    },
    DefaultPaymentRefundCalculationService: {
        calculate: (request) => {
            ownerCalls.push({ owner: 'payment', action: 'calculateRefund', request });
            assert.strictEqual(request.paymentAllocations.length, 1);
            return {
                calculationCode: 'refundCalculation::reverse-1',
                orderCode: request.orderCode,
                returnCode: request.returnCode,
                paymentGroupCode: request.paymentGroupCode,
                amount: '12.50',
                eligibleAmount: '12.50',
                currencyCode: 'USD',
                allocationCodes: ['payment-allocation-1'],
                evidence: { allocationCount: 1 },
            };
        },
    },
    DefaultPaymentRefundService: {
        refund: async (request) => {
            ownerCalls.push({ owner: 'payment', action: 'refund', request });
            return { transactionCode: 'payment::refund-1', operation: 'REFUND', status: 'REFUNDED', orderCode: request.orderCode };
        },
        retryRefund: async (request) => {
            ownerCalls.push({ owner: 'payment', action: 'retryRefund', request });
            return {
                transactionCode: 'payment::refund-recovered',
                operation: 'REFUND',
                status: 'REFUNDED',
                recovered: true,
                recoveryAction: 'RETRY_REFUND',
                orderCode: request.orderCode,
            };
        },
    },
    DefaultOrderHistoryEntryService: {
        get: async (request) => ({ result: savedHistory.filter((item) => item.historyCode === request.query.historyCode) }),
        save: async (request) => {
            savedHistory.push(request.model);
            return { result: [request.model] };
        },
    },
};

const workflowCarrier = {
    code: 'reverse-1',
    sourceDetail: {
        entCode: 'enterpriseA',
        orderCode: 'order::checkout-1',
        idempotencyKey: 'reverse-1',
        returnReasonCode: 'DAMAGED',
        requestedQuantity: '1',
        receivedQuantity: '1',
        dispositionCode: 'RESTOCK',
        paymentGroupCode: 'card-main',
        paymentModeCode: 'CARD',
        refundAmount: '12.50',
        currencyCode: 'USD',
    },
};

(async () => {
    const submitted = await reverseWorkflowService.submit({
        tenant: 'default',
        authData: { tokenType: 'access', principalId: 'admin' },
        body: {
            entCode: 'enterpriseA',
            orderCode: 'order::checkout-1',
            idempotencyKey: 'reverse-1',
            approvalMode: 'MANUAL',
        },
    });
    assert.strictEqual(submitted.workflowCode, 'checkoutReverseManualFlow');
    assert.strictEqual(submittedCarrier.carrier.sourceDetail.processType, 'checkoutReverse');
    assert.strictEqual(submittedCarrier.carrier.items[0].schemaName, 'order');

    const started = await reverseWorkflowService.startReverseRun({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
    });
    assert.strictEqual(started.feedback.action, 'startReverseRun');
    assert.strictEqual(savedRuns[0].state, 'RUNNING');

    const requested = await reverseWorkflowService.requestReturn({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: started.feedback,
    });
    assert.strictEqual(requested.feedback.returnCode, 'return::reverse-1');
    assert.strictEqual(ownerCalls[0].owner, 'fulfillment');
    assert.strictEqual(ownerCalls[0].request.entCode, 'enterpriseA');
    assert.strictEqual(savedRuns.at(-1).state, 'RETURN_REQUESTED');

    const approved = await reverseWorkflowService.approveReturn({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: requested.feedback,
    });
    assert.strictEqual(approved.feedback.returnRequest.status, 'APPROVED');

    const received = await reverseWorkflowService.receiveReturn({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: approved.feedback,
    });
    assert.strictEqual(received.feedback.returnRequest.status, 'RECEIVED');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'receiveReturn').request.receivedQuantity, '1');

    const disposed = await reverseWorkflowService.disposeReturn({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: received.feedback,
    });
    assert.strictEqual(disposed.feedback.returnRequest.status, 'CLOSED');
    assert.strictEqual(disposed.feedback.dispositionCode, 'RESTOCK');
    assert.strictEqual(disposed.feedback.inventoryDispositionIntent.ownerModule, 'inventory');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'disposeReturn').request.dispositionCode, 'RESTOCK');
    assert.strictEqual(savedRuns.at(-1).state, 'RETURN_DISPOSED');

    const fulfillmentCompensation = await reverseWorkflowService.compensateReverse({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: received.feedback,
        failure: { code: 'RETURN_REVIEW', message: 'Return receipt requires fulfillment review before disposition' },
    });
    assert.strictEqual(fulfillmentCompensation.feedback.recovery.currentState, 'RETURN_RECEIVED');
    assert.strictEqual(fulfillmentCompensation.feedback.recovery.strategy, 'FULFILLMENT_REVIEW_REQUIRED');
    assert.deepStrictEqual(fulfillmentCompensation.feedback.recovery.requiredOwners, ['fulfillment']);

    const fulfillmentRecovery = await reverseWorkflowService.recoverFulfillment({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: Object.assign({}, received.feedback, { recovery: fulfillmentCompensation.feedback.recovery }),
    });
    assert.strictEqual(fulfillmentRecovery.feedback.fulfillmentRecovery.recoveryStatus, 'RETURN_REVIEW_REQUIRED');
    assert.strictEqual(fulfillmentRecovery.feedback.recovery.fulfillmentRecoveryAction, 'REVIEW_RETURN');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'reviewReturnRecovery').request.returnCode, 'return::reverse-1');
    assert.strictEqual(savedRuns.at(-1).state, 'COMPENSATING');
    assert.strictEqual(savedRuns.at(-1).currentStep, 'recoverFulfillment');

    const inventoryCompensation = await reverseWorkflowService.compensateReverse({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: disposed.feedback,
        failure: { code: 'INVENTORY_REVIEW', message: 'Inventory disposition movement requires review' },
    });
    assert.strictEqual(inventoryCompensation.feedback.recovery.currentState, 'RETURN_DISPOSED');
    assert.strictEqual(inventoryCompensation.feedback.recovery.strategy, 'INVENTORY_REVIEW_REQUIRED');
    assert.deepStrictEqual(inventoryCompensation.feedback.recovery.requiredOwners, ['inventory']);

    const inventoryRecovery = await reverseWorkflowService.recoverInventory({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: Object.assign({}, disposed.feedback, { recovery: inventoryCompensation.feedback.recovery }),
    });
    assert.strictEqual(inventoryRecovery.feedback.inventoryRecovery.recoveryStatus, 'MOVEMENT_FOUND');
    assert.strictEqual(inventoryRecovery.feedback.recovery.inventoryRecoveryAction, 'REVIEW_DISPOSITION_MOVEMENT');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'reviewDispositionRecovery').request.dispositionIntent.sourceCode, 'return::reverse-1');
    assert.strictEqual(savedRuns.at(-1).state, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(savedRuns.at(-1).currentStep, 'recoverInventory');

    const inventoryDisposition = await reverseWorkflowService.applyInventoryDisposition({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: disposed.feedback,
    });
    assert.strictEqual(inventoryDisposition.feedback.inventoryDispositionResult.status, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'applyInventoryDisposition').request.dispositionIntent.sourceCode, 'return::reverse-1');
    assert.strictEqual(savedRuns.at(-1).state, 'INVENTORY_DISPOSITION_APPLIED');

    const ownerCallCountBeforePaymentRecovery = ownerCalls.length;
    const paymentRecovery = await reverseWorkflowService.compensateReverse({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: inventoryDisposition.feedback,
        failure: { code: 'PAYMENT_TIMEOUT', message: 'Payment provider timeout after inventory disposition' },
    });
    assert.strictEqual(paymentRecovery.feedback.recovery.currentState, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(paymentRecovery.feedback.recovery.strategy, 'PAYMENT_RETRY_REQUIRED');
    assert.deepStrictEqual(paymentRecovery.feedback.recovery.requiredOwners, ['payment']);
    assert.deepStrictEqual(paymentRecovery.feedback.recovery.ownerActions.payment, ['RETRY_REFUND', 'RECONCILE_PROVIDER_REFUND']);
    assert.strictEqual(paymentRecovery.feedback.compensation.state, 'COMPENSATING');
    assert.strictEqual(paymentRecovery.feedback.compensation.recoveryStrategy, 'PAYMENT_RETRY_REQUIRED');
    assert.strictEqual(paymentRecovery.feedback.compensation.recoveryOwner, 'payment');
    assert.strictEqual(paymentRecovery.feedback.compensation.evidence.recovery.strategy, 'PAYMENT_RETRY_REQUIRED');
    assert.strictEqual(ownerCalls.length, ownerCallCountBeforePaymentRecovery);

    const recoveredPayment = await reverseWorkflowService.recoverPayment({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: paymentRecovery.feedback,
    });
    assert.strictEqual(recoveredPayment.feedback.paymentRecovery.status, 'REFUNDED');
    assert.strictEqual(recoveredPayment.feedback.recovery.paymentRecoveryAction, 'RETRY_REFUND');
    assert.strictEqual(recoveredPayment.feedback.refundTransactionCode, 'payment::refund-recovered');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'retryRefund').request.amount, '12.50');
    assert.strictEqual(savedRuns.at(-1).state, 'REFUNDED');
    assert.strictEqual(savedRuns.at(-1).currentStep, 'recoverPayment');

    const calculated = await reverseWorkflowService.calculateRefund({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: inventoryDisposition.feedback,
    });
    assert.strictEqual(calculated.feedback.refundCalculation.amount, '12.50');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'loadPaymentAllocations').request.query.orderCode, 'order::checkout-1');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'calculateRefund').request.entCode, 'enterpriseA');
    assert.strictEqual(savedRuns.at(-1).state, 'REFUND_CALCULATED');

    const refunded = await reverseWorkflowService.refundPayment({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: calculated.feedback,
    });
    assert.strictEqual(refunded.feedback.refundTransaction.status, 'REFUNDED');
    assert.strictEqual(ownerCalls.find((call) => call.action === 'refund').request.amount, '12.50');
    assert.strictEqual(savedRuns.at(-1).state, 'REFUNDED');

    const historyRecovery = await reverseWorkflowService.compensateReverse({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: refunded.feedback,
        failure: { code: 'HISTORY_CONFLICT', message: 'History write conflict after refund was accepted' },
    });
    assert.strictEqual(historyRecovery.feedback.recovery.currentState, 'REFUNDED');
    assert.strictEqual(historyRecovery.feedback.recovery.strategy, 'ORDER_HISTORY_RETRY_REQUIRED');
    assert.deepStrictEqual(historyRecovery.feedback.recovery.requiredOwners, ['order']);
    assert.strictEqual(historyRecovery.feedback.compensation.recoveryOwner, 'order');

    const ownerCallCountBeforeHistoryRecovery = ownerCalls.length;
    const recoveredHistory = await reverseWorkflowService.recoverHistory({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: Object.assign({}, refunded.feedback, { recovery: historyRecovery.feedback.recovery }),
    });
    assert.strictEqual(recoveredHistory.feedback.recovery.orderRecoveryAction, 'RETRY_HISTORY');
    assert.strictEqual(recoveredHistory.feedback.recovery.historyRecovered, true);
    assert.strictEqual(recoveredHistory.feedback.historyEntry.historyCode, 'reverse-1:reverse');
    assert.strictEqual(savedHistory.length, 1);
    assert.strictEqual(ownerCalls.length, ownerCallCountBeforeHistoryRecovery);
    assert.strictEqual(savedRuns.at(-1).currentStep, 'recoverHistory');

    const history = await reverseWorkflowService.recordHistory({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: refunded.feedback,
    });
    assert.strictEqual(history.feedback.historyEntry.eventType, 'ORDER_REVERSE_FLOW');
    assert.strictEqual(history.feedback.historyEntry.idempotent, true);
    assert.strictEqual(savedHistory[0].sourceOperation, 'checkoutReverseWorkflow.recordHistory');
    assert.strictEqual(savedHistory.length, 1);

    const completed = await reverseWorkflowService.completeReverse({
        tenant: 'default',
        authData: { tokenType: 'service', principalId: 'workflow' },
        workflowCarrier,
        previousFeedback: history.feedback,
    });
    assert.strictEqual(completed.feedback.action, 'completeReverse');
    assert.strictEqual(savedRuns.at(-1).state, 'COMPLETED');

    await assert.rejects(
        () => reverseWorkflowService.submit({
            tenant: 'default',
            authData: { tokenType: 'access', principalId: 'admin' },
            body: {
                entCode: 'enterpriseA',
                orderCode: 'order::checkout-2',
                rawGatewayPayload: { token: 'never-store' },
            },
        }),
        (error) => error.code === 'ERR_ORD_00031' && error.message.includes('must not contain credentials')
    );

    console.log('Checkout reverse Workflow contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
