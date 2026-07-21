/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowHeadData @description Seeds manual and automatic reconciliation workflow heads. @layer data @owner inventory */
module.exports = {
    manual: { code: 'stockReconciliationManualFlow', name: 'Stock Reconciliation Manual Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['stockReconciliationManualReviewChannel'] },
    automatic: { code: 'stockReconciliationAutomaticFlow', name: 'Stock Reconciliation Automatic Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['stockReconciliationAutomaticCompleteChannel'] }
};
