/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowActionData @description Seeds manual review and automatic completion actions for reconciliation. @layer data @owner inventory */
module.exports = {
    manualReview: { code: 'stockReconciliationManualReviewAction', name: 'Review Stock Reconciliation Finding', active: true, type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'], channels: ['stockReconciliationManualCompleteChannel', 'defaultRejectChannel', 'defaultErrorChannel'] },
    manualComplete: { code: 'stockReconciliationManualCompleteAction', name: 'Complete Approved Stock Reconciliation', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultStockReconciliationWorkflowService.complete', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] },
    automaticComplete: { code: 'stockReconciliationAutomaticCompleteAction', name: 'Automatically Complete Stock Reconciliation', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultStockReconciliationWorkflowService.complete', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] }
};
