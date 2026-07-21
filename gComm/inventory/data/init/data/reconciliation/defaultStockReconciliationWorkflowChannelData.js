/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowChannelData @description Routes reconciliation heads and approved reviews to their configured actions. @layer data @owner inventory */
module.exports = {
    manualReview: { code: 'stockReconciliationManualReviewChannel', name: 'Stock Reconciliation Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'stockReconciliationManualReviewAction' },
    manualComplete: { code: 'stockReconciliationManualCompleteChannel', name: 'Stock Reconciliation Manual Completion', active: true, qualifier: { decision: 'SUCCESS' }, target: 'stockReconciliationManualCompleteAction' },
    automaticComplete: { code: 'stockReconciliationAutomaticCompleteChannel', name: 'Stock Reconciliation Automatic Completion', active: true, qualifier: { decision: 'SUCCESS' }, target: 'stockReconciliationAutomaticCompleteAction' }
};
