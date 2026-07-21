/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowActionData @description Seeds manual review and automatic completion actions for reconciliation. @layer data @owner inventory */
module.exports = {
    manualReview: { code: 'stockReconciliationManualReviewAction', name: 'Review Stock Reconciliation Finding', active: true, type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'], channels: ['stockReconciliationManualCompleteChannel', 'defaultRejectChannel', 'defaultErrorChannel'] },
    manualComplete: { code: 'stockReconciliationManualCompleteAction', name: 'Complete Approved Stock Reconciliation', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultStockReconciliationWorkflowService.complete', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] },
    automaticComplete: { code: 'stockReconciliationAutomaticCompleteAction', name: 'Automatically Complete Stock Reconciliation', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultStockReconciliationWorkflowService.complete', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] }
};
