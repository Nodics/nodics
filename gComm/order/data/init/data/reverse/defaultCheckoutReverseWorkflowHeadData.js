/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module order/data/reverse/defaultCheckoutReverseWorkflowHeadData @description Seeds manual and automatic checkout reverse workflow heads. @layer data @owner order */
module.exports = {
    manual: { code: 'checkoutReverseManualFlow', name: 'Checkout Reverse Manual Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['checkoutReverseManualReviewChannel'] },
    automatic: { code: 'checkoutReverseAutomaticFlow', name: 'Checkout Reverse Automatic Flow', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['checkoutReverseAutomaticStartChannel'] }
};
