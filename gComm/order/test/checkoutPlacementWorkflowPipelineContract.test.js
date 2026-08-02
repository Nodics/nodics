/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/checkoutPlacementWorkflowPipelineContract
 * @description Protects checkout placement as a Workflow-owned business
 * process that uses nPipeline only for atomic technical tasks.
 * @layer test
 * @owner order
 * @override Project modules may replace checkout placement workflow heads,
 * actions, channels, atomic pipeline nodes, and handlers through layered modules while
 * preserving Order-owned placement run evidence and Workflow/nPipeline authority.
 */
const assert = require('assert');

global.ENUMS = {
    WorkflowActionType: {
        AUTO: { key: 'AUTO' },
        MANUAL: { key: 'MANUAL' },
        PARALLEL: { key: 'PARALLEL' },
    },
    WorkflowActionPosition: {
        HEAD: { key: 'HEAD' },
        ACTION: { key: 'ACTION' },
        END: { key: 'END' },
    },
    ReasonType: {
        ORDERSTATUS: { key: 'ORDERSTATUS' },
        PAYMENT: { key: 'PAYMENT' },
        SHIPMENT: { key: 'SHIPMENT' },
    },
};

const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas');
const pipelines = require('../src/pipelines/pipelines');
const workflowHeads = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowHeadData');
const workflowActions = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowActionData');
const workflowChannels = require('../data/init/data/placement/defaultCheckoutPlacementWorkflowChannelData');
const workflowHeadHeader = require('../data/init/header/placement/defaultCheckoutPlacementWorkflowHeadHeader');
const workflowActionHeader = require('../data/init/header/placement/defaultCheckoutPlacementWorkflowActionHeader');
const workflowChannelHeader = require('../data/init/header/placement/defaultCheckoutPlacementWorkflowChannelHeader');

const placementSchema = schemas.order.checkoutPlacementRun;
const reverseSchema = schemas.order.checkoutReverseRun;
const placementConfig = properties.order.checkoutPlacement;
const reverseConfig = properties.order.checkoutReverse;
const navigation = properties.backofficeCapabilities.order.navigation;
const byId = Object.fromEntries(navigation.map((item) => [item.id, item]));

assert(placementConfig.enabled, 'checkout placement must be configuration-backed');
assert.strictEqual(placementConfig.workflow.enabled, true);
assert.strictEqual(placementConfig.workflow.automaticWorkflowCode, 'checkoutPlacementAutomaticFlow');
assert.strictEqual(placementConfig.workflow.manualWorkflowCode, 'checkoutPlacementManualFlow');
assert.strictEqual(placementConfig.pipeline.name, 'checkoutPlacementRunPipeline');
assert.deepStrictEqual(placementConfig.pipeline.steps, ['validateRequest', 'startPlacementRun', 'finalizePlacementRun']);
assert(!placementConfig.pipeline.steps.includes('reserveInventoryPromises'), 'inventory reservation is a Workflow action, not a pipeline node');

assert.strictEqual(placementSchema.model, true);
assert.strictEqual(placementSchema.service.enabled, true);
assert.strictEqual(placementSchema.router.enabled, true, 'placement runs must be visible through governed Schema Workbench operations');
assert.strictEqual(placementSchema.refSchema.orderCode.schemaName, 'order');
assert.strictEqual(placementSchema.definition.workflowCarrierCode.required, false);
assert.strictEqual(placementSchema.definition.pipelineName.required, true);
assert.strictEqual(placementSchema.definition.idempotencyKey.required, true);
assert.strictEqual(placementSchema.indexes.individual.idempotencyKey.options.unique, true);
assert.strictEqual(placementSchema.definition.failureMessage.description.includes('Do not store secrets'), true);
assert.strictEqual(byId['checkout-placement-runs'].workbenchTarget.schemaName, 'checkoutPlacementRun');
assert.strictEqual(reverseConfig.workflow.manualWorkflowCode, 'checkoutReverseManualFlow');
assert.strictEqual(reverseConfig.paymentRefund.ownerModule, 'payment');
assert.strictEqual(reverseSchema.service.enabled, true);
assert.strictEqual(reverseSchema.router.enabled, true);
assert.strictEqual(reverseSchema.refSchema.orderCode.schemaName, 'order');
assert.strictEqual(reverseSchema.indexes.individual.idempotencyKey.options.unique, true);
assert.strictEqual(byId['checkout-reverse-runs'].workbenchTarget.schemaName, 'checkoutReverseRun');

const pipeline = pipelines.checkoutPlacementRunPipeline;
assert.strictEqual(pipeline.startNode, 'validateRequest');
assert.strictEqual(pipeline.handleError, 'handleError');
assert.strictEqual(pipeline.nodes.validateRequest.handler, 'DefaultCheckoutPlacementPipelineService.validateRequest');
assert.strictEqual(pipeline.nodes.startPlacementRun.success, 'finalizePlacementRun');
assert.strictEqual(pipeline.nodes.reserveInventoryPromises, undefined);
assert.strictEqual(pipeline.nodes.createOrderProjection, undefined);
assert.strictEqual(pipeline.nodes.finalizePlacementRun.success, 'successEnd');

assert.strictEqual(workflowHeads.automatic.code, 'checkoutPlacementAutomaticFlow');
assert.strictEqual(workflowHeads.automatic.handler, 'DefaultWorkflowActionExecutionService.performHeadOperation');
assert.deepStrictEqual(workflowHeads.automatic.channels, ['checkoutPlacementAutomaticStartChannel']);
assert.strictEqual(workflowHeads.manual.position, 'HEAD');
assert.strictEqual(workflowActions.startPlacementRun.handler, 'DefaultCheckoutPlacementWorkflowService.startPlacementRun');
assert.strictEqual(workflowActions.validatePlacement.handler, 'DefaultCheckoutPlacementWorkflowService.validatePlacement');
assert.strictEqual(workflowActions.reserveInventory.handler, 'DefaultCheckoutPlacementWorkflowService.reserveInventory');
assert.strictEqual(workflowActions.createOrderProjection.handler, 'DefaultCheckoutPlacementWorkflowService.createOrderProjection');
assert.strictEqual(workflowActions.copyAllocations.handler, 'DefaultCheckoutPlacementWorkflowService.copyAllocations');
assert.strictEqual(workflowActions.authorizePayment.handler, 'DefaultCheckoutPlacementWorkflowService.authorizePayment');
assert.strictEqual(workflowActions.releaseFulfillment.handler, 'DefaultCheckoutPlacementWorkflowService.releaseFulfillment');
assert.strictEqual(workflowActions.recordHistory.handler, 'DefaultCheckoutPlacementWorkflowService.recordHistory');
assert.strictEqual(workflowActions.completePlacement.handler, 'DefaultCheckoutPlacementWorkflowService.completePlacement');
assert.strictEqual(workflowActions.compensatePlacement.handler, 'DefaultCheckoutPlacementWorkflowService.compensatePlacement');
assert.strictEqual(workflowActions.manualReview.type, 'MANUAL');
assert.strictEqual(workflowChannels.automaticStart.target, 'checkoutPlacementStartRunAction');
assert.strictEqual(workflowChannels.approvedStart.target, 'checkoutPlacementStartRunAction');
assert.strictEqual(workflowChannels.validate.target, 'checkoutPlacementValidateAction');
assert.strictEqual(workflowChannels.reserveInventory.target, 'checkoutPlacementReserveInventoryAction');
assert.strictEqual(workflowChannels.createOrder.target, 'checkoutPlacementCreateOrderAction');
assert.strictEqual(workflowChannels.copyAllocations.target, 'checkoutPlacementCopyAllocationsAction');
assert.strictEqual(workflowChannels.authorizePayment.target, 'checkoutPlacementAuthorizePaymentAction');
assert.strictEqual(workflowChannels.releaseFulfillment.target, 'checkoutPlacementReleaseFulfillmentAction');
assert.strictEqual(workflowChannels.recordHistory.target, 'checkoutPlacementRecordHistoryAction');
assert.strictEqual(workflowChannels.complete.target, 'checkoutPlacementCompleteAction');
assert.strictEqual(workflowChannels.compensate.target, 'checkoutPlacementCompensateAction');
assert.strictEqual(workflowChannels.compensate.qualifier.decision, 'ERROR');
assert(workflowActions.createOrderProjection.channels.includes('checkoutPlacementCompensateChannel'));
assert(workflowActions.authorizePayment.channels.includes('checkoutPlacementReleaseFulfillmentChannel'));
assert(workflowActions.releaseFulfillment.channels.includes('checkoutPlacementRecordHistoryChannel'));
assert.strictEqual(workflowHeadHeader.workflow.defaultCheckoutPlacementWorkflowHead.options.schemaName, 'workflowAction');
assert.strictEqual(workflowActionHeader.workflow.defaultCheckoutPlacementWorkflowAction.options.schemaName, 'workflowAction');
assert.strictEqual(workflowChannelHeader.workflow.defaultCheckoutPlacementWorkflowChannel.options.schemaName, 'workflowChannel');

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

const workflowService = require('../src/service/placement/defaultCheckoutPlacementWorkflowService');
let submittedCarrier = null;
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
    DefaultPipelineService: {
        start: async (name, request) => ({
            placementRun: {
                placementCode: request.idempotencyKey,
            },
        }),
    },
};

(async () => {
    let submitted = await workflowService.submit({
        tenant: 'default',
        authData: { tokenType: 'access', principalId: 'admin' },
        body: { cartCode: 'cart-1', entCode: 'default', idempotencyKey: 'checkout-1', approvalMode: 'AUTOMATIC' },
    });
    assert.strictEqual(submitted.workflowCode, 'checkoutPlacementAutomaticFlow');
    assert.strictEqual(submittedCarrier.workflowCode, 'checkoutPlacementAutomaticFlow');
    assert.strictEqual(submittedCarrier.releaseCarrier, true);
    assert.strictEqual(submittedCarrier.carrier.sourceDetail.processType, 'checkoutPlacement');
    assert.strictEqual(submittedCarrier.carrier.items[0].schemaName, 'cart');

    let placed = await workflowService.startPlacementRun({
        tenant: 'default',
        authData: { tokenType: 'service' },
        workflowCarrier: {
            code: 'checkout-1',
            sourceDetail: {
                cartCode: 'cart-1',
                entCode: 'default',
                idempotencyKey: 'checkout-1',
            },
        },
    });
    assert.strictEqual(placed.decision, 'SUCCESS');
    assert.strictEqual(placed.feedback.action, 'startPlacementRun');
    assert.strictEqual(placed.feedback.pipelineName, 'checkoutPlacementRunPipeline');

    let validated = await workflowService.validatePlacement({
        tenant: 'default',
        authData: { tokenType: 'service' },
        workflowCarrier: {
            code: 'checkout-1',
            sourceDetail: { cartCode: 'cart-1', entCode: 'default' },
        },
    });
    assert.strictEqual(validated.feedback.action, 'validatePlacement');
    console.log('Checkout placement Workflow and Pipeline contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
