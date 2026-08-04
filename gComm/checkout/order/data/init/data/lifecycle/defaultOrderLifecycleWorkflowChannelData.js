/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/lifecycle/defaultOrderLifecycleWorkflowChannelData @description Routes lifecycle request heads to governed manual review. @layer data @owner order */
module.exports = {
    evaluate: {
        code: 'orderLifecycleRequestEvaluateChannel', name: 'Order Lifecycle Request Evaluation', active: true,
        qualifier: { decision: 'SUCCESS' }, target: 'orderLifecycleRequestEvaluateAction'
    },
    autoApprove: {
        code: 'orderLifecycleRequestAutoApproveChannel', name: 'Order Lifecycle Request Automatic Approval', active: true,
        qualifier: { decision: 'AUTO_APPROVE' }, target: 'orderLifecycleRequestApproveAction'
    },
    review: {
        code: 'orderLifecycleRequestReviewChannel', name: 'Order Lifecycle Request Review', active: true,
        qualifier: { decision: 'MANUAL_REVIEW' }, target: 'orderLifecycleRequestReviewAction'
    },
    manualApproved: {
        code: 'orderLifecycleRequestManualApprovedChannel', name: 'Order Lifecycle Request Manual Approval', active: true,
        qualifier: { decision: 'SUCCESS' }, target: 'orderLifecycleRequestApproveAction'
    },
    execute: {
        code: 'orderLifecycleRequestExecuteChannel', name: 'Order Lifecycle Request Execution', active: true,
        qualifier: { decision: 'SUCCESS' }, target: 'orderLifecycleRequestExecuteAction'
    },
    rejected: {
        code: 'orderLifecycleRequestRejectedChannel', name: 'Order Lifecycle Request Rejection', active: true,
        qualifier: { decision: 'REJECT' }, target: 'orderLifecycleRequestRejectAction'
    },
    returnEvaluate: { code: 'orderReturnRequestEvaluateChannel', name: 'Evaluate Order Return', active: true, qualifier: { decision: 'SUCCESS' }, target: 'orderReturnRequestEvaluateAction' },
    returnAutoAuthorize: { code: 'orderReturnRequestAutoAuthorizeChannel', name: 'Automatic Return Authorization', active: true, qualifier: { decision: 'AUTO_APPROVE' }, target: 'orderReturnRequestAuthorizeAction' },
    returnReview: { code: 'orderReturnRequestReviewChannel', name: 'Manual Return Review', active: true, qualifier: { decision: 'MANUAL_REVIEW' }, target: 'orderReturnRequestReviewAction' },
    returnManualAuthorized: { code: 'orderReturnRequestManualAuthorizedChannel', name: 'Manual Return Authorization', active: true, qualifier: { decision: 'SUCCESS' }, target: 'orderReturnRequestAuthorizeAction' },
    returnCreateRma: { code: 'orderReturnRequestCreateRmaChannel', name: 'Create Fulfillment RMA', active: true, qualifier: { decision: 'SUCCESS' }, target: 'orderReturnRequestCreateRmaAction' },
    returnRejected: { code: 'orderReturnRequestRejectedChannel', name: 'Reject Order Return', active: true, qualifier: { decision: 'REJECT' }, target: 'orderReturnRequestRejectAction' },
    refundEvaluate: { code: 'orderRefundRequestEvaluateChannel', name: 'Evaluate Order Refund', active: true, qualifier: { decision: 'SUCCESS' }, target: 'orderRefundRequestEvaluateAction' },
    refundAutoApprove: { code: 'orderRefundRequestAutoApproveChannel', name: 'Automatic Refund Approval', active: true, qualifier: { decision: 'AUTO_APPROVE' }, target: 'orderRefundRequestApproveAction' },
    refundReview: { code: 'orderRefundRequestReviewChannel', name: 'Manual Refund Review', active: true, qualifier: { decision: 'MANUAL_REVIEW' }, target: 'orderRefundRequestReviewAction' },
    refundManualApproved: { code: 'orderRefundRequestManualApprovedChannel', name: 'Manual Refund Approval', active: true, qualifier: { decision: 'SUCCESS' }, target: 'orderRefundRequestApproveAction' },
    refundExecute: { code: 'orderRefundRequestExecuteChannel', name: 'Execute Payment Refund', active: true, qualifier: { decision: 'SUCCESS' }, target: 'orderRefundRequestExecuteAction' },
    refundRejected: { code: 'orderRefundRequestRejectedChannel', name: 'Reject Order Refund', active: true, qualifier: { decision: 'REJECT' }, target: 'orderRefundRequestRejectAction' },
    informationRequired: { code: 'orderLifecycleInformationRequiredChannel', name: 'Request Lifecycle Information', active: true, qualifier: { decision: 'INFORMATION_REQUIRED' }, target: 'orderLifecycleRequestInformationAction' },
    escalate: { code: 'orderLifecycleEscalateChannel', name: 'Escalate Lifecycle Review', active: true, qualifier: { decision: 'ESCALATE' }, target: 'orderLifecycleEscalateAction' }
};
