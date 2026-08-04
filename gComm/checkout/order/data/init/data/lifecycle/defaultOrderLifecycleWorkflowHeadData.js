/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/lifecycle/defaultOrderLifecycleWorkflowHeadData @description Seeds the governed post-order lifecycle request review head without executing adjacent-owner operations. @layer data @owner order */
module.exports = {
    review: {
        code: 'orderLifecycleRequestFlow', name: 'Order Lifecycle Request Review', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultWorkflowActionExecutionService.performHeadOperation',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'],
        channels: ['orderLifecycleRequestEvaluateChannel']
    },
    returnReview: {
        code: 'orderReturnRequestFlow', name: 'Order Return Request Authorization', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultWorkflowActionExecutionService.performHeadOperation',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'],
        channels: ['orderReturnRequestEvaluateChannel']
    },
    refundReview: {
        code: 'orderRefundRequestFlow', name: 'Order Refund Request Approval', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['orderRefundRequestEvaluateChannel']
    }
};
