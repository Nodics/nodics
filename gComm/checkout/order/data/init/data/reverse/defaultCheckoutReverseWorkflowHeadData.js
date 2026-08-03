/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/reverse/defaultCheckoutReverseWorkflowHeadData @description Seeds manual and automatic checkout reverse workflow heads. @layer data @owner order */
module.exports = {
    manual: { code: 'checkoutReverseManualFlow', name: 'Checkout Reverse Manual Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['checkoutReverseManualReviewChannel'] },
    automatic: { code: 'checkoutReverseAutomaticFlow', name: 'Checkout Reverse Automatic Flow', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['checkoutReverseAutomaticStartChannel'] }
};
