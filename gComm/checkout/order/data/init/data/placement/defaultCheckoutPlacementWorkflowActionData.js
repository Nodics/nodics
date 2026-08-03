/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/placement/defaultCheckoutPlacementWorkflowActionData @description Seeds business-level checkout placement workflow actions. @layer data @owner order */
module.exports = {
    manualReview: { code: 'checkoutPlacementManualReviewAction', name: 'Review Checkout Placement', active: true, type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'], channels: ['checkoutPlacementApprovedStartChannel', 'defaultRejectChannel', 'defaultErrorChannel'] },
    startPlacementRun: { code: 'checkoutPlacementStartRunAction', name: 'Start Checkout Placement Run', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.startPlacementRun', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementValidateChannel', 'defaultErrorChannel'] },
    validatePlacement: { code: 'checkoutPlacementValidateAction', name: 'Validate Checkout Placement', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.validatePlacement', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementReserveInventoryChannel', 'defaultErrorChannel'] },
    reserveInventory: { code: 'checkoutPlacementReserveInventoryAction', name: 'Reserve Checkout Inventory', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.reserveInventory', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementCreateOrderChannel', 'checkoutPlacementCompensateChannel'] },
    createOrderProjection: { code: 'checkoutPlacementCreateOrderAction', name: 'Create Checkout Order Projection', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.createOrderProjection', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementCopyAllocationsChannel', 'checkoutPlacementCompensateChannel'] },
    copyAllocations: { code: 'checkoutPlacementCopyAllocationsAction', name: 'Copy Checkout Allocations', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.copyAllocations', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementAuthorizePaymentChannel', 'checkoutPlacementCompensateChannel'] },
    authorizePayment: { code: 'checkoutPlacementAuthorizePaymentAction', name: 'Authorize Checkout Payment', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.authorizePayment', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementReleaseFulfillmentChannel', 'checkoutPlacementCompensateChannel'] },
    releaseFulfillment: { code: 'checkoutPlacementReleaseFulfillmentAction', name: 'Release Checkout Fulfillment', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.releaseFulfillment', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementRecordHistoryChannel', 'checkoutPlacementCompensateChannel'] },
    recordHistory: { code: 'checkoutPlacementRecordHistoryAction', name: 'Record Checkout Placement History', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.recordHistory', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['checkoutPlacementCompleteChannel', 'checkoutPlacementCompensateChannel'] },
    completePlacement: { code: 'checkoutPlacementCompleteAction', name: 'Complete Checkout Placement', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.completePlacement', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'checkoutPlacementCompensateChannel'] },
    compensatePlacement: { code: 'checkoutPlacementCompensateAction', name: 'Compensate Checkout Placement Failure', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultCheckoutPlacementWorkflowService.compensatePlacement', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultErrorChannel'] }
};
