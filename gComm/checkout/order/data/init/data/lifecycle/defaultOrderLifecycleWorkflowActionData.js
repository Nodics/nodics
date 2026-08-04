/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/lifecycle/defaultOrderLifecycleWorkflowActionData @description Seeds manual review for immutable Order lifecycle request evidence. @layer data @owner order */
module.exports = {
    evaluate: {
        code: 'orderLifecycleRequestEvaluateAction', name: 'Evaluate Order Lifecycle Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderCancellationWorkflowService.evaluate',
        accessGroups: ['workflowUserGroup'], allowedDecisions: ['AUTO_APPROVE', 'MANUAL_REVIEW', 'REJECT', 'ERROR'],
        channels: ['orderLifecycleRequestAutoApproveChannel', 'orderLifecycleRequestReviewChannel', 'orderLifecycleRequestRejectedChannel', 'defaultErrorChannel']
    },
    review: {
        code: 'orderLifecycleRequestReviewAction', name: 'Review Order Lifecycle Request', active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'REJECT', 'INFORMATION_REQUIRED', 'ESCALATE', 'ERROR'],
        channels: ['orderLifecycleRequestManualApprovedChannel', 'orderLifecycleRequestRejectedChannel', 'orderLifecycleInformationRequiredChannel', 'orderLifecycleEscalateChannel', 'defaultErrorChannel']
    },
    approve: {
        code: 'orderLifecycleRequestApproveAction', name: 'Approve Order Lifecycle Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderCancellationWorkflowService.approve',
        accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['orderLifecycleRequestExecuteChannel', 'defaultErrorChannel']
    },
    execute: {
        code: 'orderLifecycleRequestExecuteAction', name: 'Execute Order Lifecycle Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderCancellationWorkflowService.execute',
        accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel']
    },
    reject: {
        code: 'orderLifecycleRequestRejectAction', name: 'Reject Order Lifecycle Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderCancellationWorkflowService.reject',
        accessGroups: ['workflowUserGroup'], allowedDecisions: ['REJECT', 'ERROR'], channels: ['defaultRejectChannel', 'defaultErrorChannel']
    },
    returnEvaluate: {
        code: 'orderReturnRequestEvaluateAction', name: 'Evaluate Order Return Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderReturnWorkflowService.evaluate', accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['AUTO_APPROVE', 'MANUAL_REVIEW', 'REJECT', 'ERROR'], channels: ['orderReturnRequestAutoAuthorizeChannel', 'orderReturnRequestReviewChannel', 'orderReturnRequestRejectedChannel', 'defaultErrorChannel']
    },
    returnReview: {
        code: 'orderReturnRequestReviewAction', name: 'Review Order Return Request', active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'INFORMATION_REQUIRED', 'ESCALATE', 'ERROR'],
        channels: ['orderReturnRequestManualAuthorizedChannel', 'orderReturnRequestRejectedChannel', 'orderLifecycleInformationRequiredChannel', 'orderLifecycleEscalateChannel', 'defaultErrorChannel']
    },
    returnAuthorize: {
        code: 'orderReturnRequestAuthorizeAction', name: 'Authorize Order Return Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderReturnWorkflowService.authorize', accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['orderReturnRequestCreateRmaChannel', 'defaultErrorChannel']
    },
    returnCreateRma: {
        code: 'orderReturnRequestCreateRmaAction', name: 'Create Fulfillment Return Evidence', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderReturnWorkflowService.createRma', accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel']
    },
    returnReject: {
        code: 'orderReturnRequestRejectAction', name: 'Reject Order Return Request', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderReturnWorkflowService.reject', accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['REJECT', 'ERROR'], channels: ['defaultRejectChannel', 'defaultErrorChannel']
    },
    refundEvaluate: { code: 'orderRefundRequestEvaluateAction', name: 'Evaluate Order Refund', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderRefundWorkflowService.evaluate', accessGroups: ['workflowUserGroup'], allowedDecisions: ['AUTO_APPROVE', 'MANUAL_REVIEW', 'REJECT', 'ERROR'], channels: ['orderRefundRequestAutoApproveChannel', 'orderRefundRequestReviewChannel', 'orderRefundRequestRejectedChannel', 'defaultErrorChannel'] },
    refundReview: { code: 'orderRefundRequestReviewAction', name: 'Review Order Refund', active: true, type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'INFORMATION_REQUIRED', 'ESCALATE', 'ERROR'], channels: ['orderRefundRequestManualApprovedChannel', 'orderRefundRequestRejectedChannel', 'orderLifecycleInformationRequiredChannel', 'orderLifecycleEscalateChannel', 'defaultErrorChannel'] },
    refundApprove: { code: 'orderRefundRequestApproveAction', name: 'Approve Order Refund', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderRefundWorkflowService.approve', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['orderRefundRequestExecuteChannel', 'defaultErrorChannel'] },
    refundExecute: { code: 'orderRefundRequestExecuteAction', name: 'Execute Order Refund', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderRefundWorkflowService.execute', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] },
    refundReject: { code: 'orderRefundRequestRejectAction', name: 'Reject Order Refund', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderRefundWorkflowService.reject', accessGroups: ['workflowUserGroup'], allowedDecisions: ['REJECT', 'ERROR'], channels: ['defaultRejectChannel', 'defaultErrorChannel'] },
    requestInformation: { code: 'orderLifecycleRequestInformationAction', name: 'Request Lifecycle Information', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderLifecycleReviewWorkflowService.requestInformation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] },
    escalate: { code: 'orderLifecycleEscalateAction', name: 'Escalate Lifecycle Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultOrderLifecycleReviewWorkflowService.escalate', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] }
};
