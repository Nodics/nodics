/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowChannelData @description Routes reconciliation heads and approved reviews to their configured actions. @layer data @owner inventory */
module.exports = {
    manualReview: { code: 'stockReconciliationManualReviewChannel', name: 'Stock Reconciliation Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'stockReconciliationManualReviewAction' },
    manualComplete: { code: 'stockReconciliationManualCompleteChannel', name: 'Stock Reconciliation Manual Completion', active: true, qualifier: { decision: 'SUCCESS' }, target: 'stockReconciliationManualCompleteAction' },
    automaticComplete: { code: 'stockReconciliationAutomaticCompleteChannel', name: 'Stock Reconciliation Automatic Completion', active: true, qualifier: { decision: 'SUCCESS' }, target: 'stockReconciliationAutomaticCompleteAction' }
};
