/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowHeadData @description Seeds manual and automatic reconciliation workflow heads. @layer data @owner inventory */
module.exports = {
    manual: { code: 'stockReconciliationManualFlow', name: 'Stock Reconciliation Manual Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['stockReconciliationManualReviewChannel'] },
    automatic: { code: 'stockReconciliationAutomaticFlow', name: 'Stock Reconciliation Automatic Review', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['stockReconciliationAutomaticCompleteChannel'] }
};
