/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/reverse/defaultCheckoutReverseWorkflowChannelData @description Routes checkout reverse workflow heads and business actions. @layer data @owner order */
module.exports = {
    manualReview: { code: 'checkoutReverseManualReviewChannel', name: 'Checkout Reverse Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseManualReviewAction' },
    approvedStart: { code: 'checkoutReverseApprovedStartChannel', name: 'Checkout Reverse Approved Start', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseStartRunAction' },
    automaticStart: { code: 'checkoutReverseAutomaticStartChannel', name: 'Checkout Reverse Automatic Start', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseStartRunAction' },
    requestReturn: { code: 'checkoutReverseRequestReturnChannel', name: 'Checkout Reverse Request Return', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseRequestReturnAction' },
    approveReturn: { code: 'checkoutReverseApproveReturnChannel', name: 'Checkout Reverse Approve Return', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseApproveReturnAction' },
    receiveReturn: { code: 'checkoutReverseReceiveReturnChannel', name: 'Checkout Reverse Receive Return', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseReceiveReturnAction' },
    disposeReturn: { code: 'checkoutReverseDisposeReturnChannel', name: 'Checkout Reverse Dispose Return', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseDisposeReturnAction' },
    applyInventoryDisposition: { code: 'checkoutReverseApplyInventoryDispositionChannel', name: 'Checkout Reverse Apply Inventory Disposition', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseApplyInventoryDispositionAction' },
    calculateRefund: { code: 'checkoutReverseCalculateRefundChannel', name: 'Checkout Reverse Calculate Refund', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseCalculateRefundAction' },
    refundPayment: { code: 'checkoutReverseRefundPaymentChannel', name: 'Checkout Reverse Refund Payment', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseRefundPaymentAction' },
    recordHistory: { code: 'checkoutReverseRecordHistoryChannel', name: 'Checkout Reverse Record History', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseRecordHistoryAction' },
    complete: { code: 'checkoutReverseCompleteChannel', name: 'Checkout Reverse Complete', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutReverseCompleteAction' },
    compensate: { code: 'checkoutReverseCompensateChannel', name: 'Checkout Reverse Compensate Failure', active: true, qualifier: { decision: 'ERROR' }, target: 'checkoutReverseCompensateAction' }
};
