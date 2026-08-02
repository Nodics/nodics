/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module order/data/placement/defaultCheckoutPlacementWorkflowChannelData @description Routes checkout placement workflow heads and business actions. @layer data @owner order */
module.exports = {
    manualReview: { code: 'checkoutPlacementManualReviewChannel', name: 'Checkout Placement Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementManualReviewAction' },
    approvedStart: { code: 'checkoutPlacementApprovedStartChannel', name: 'Checkout Placement Approved Start', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementStartRunAction' },
    automaticStart: { code: 'checkoutPlacementAutomaticStartChannel', name: 'Checkout Placement Automatic Start', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementStartRunAction' },
    validate: { code: 'checkoutPlacementValidateChannel', name: 'Checkout Placement Validate', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementValidateAction' },
    reserveInventory: { code: 'checkoutPlacementReserveInventoryChannel', name: 'Checkout Placement Reserve Inventory', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementReserveInventoryAction' },
    createOrder: { code: 'checkoutPlacementCreateOrderChannel', name: 'Checkout Placement Create Order', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementCreateOrderAction' },
    copyAllocations: { code: 'checkoutPlacementCopyAllocationsChannel', name: 'Checkout Placement Copy Allocations', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementCopyAllocationsAction' },
    authorizePayment: { code: 'checkoutPlacementAuthorizePaymentChannel', name: 'Checkout Placement Authorize Payment', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementAuthorizePaymentAction' },
    releaseFulfillment: { code: 'checkoutPlacementReleaseFulfillmentChannel', name: 'Checkout Placement Release Fulfillment', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementReleaseFulfillmentAction' },
    recordHistory: { code: 'checkoutPlacementRecordHistoryChannel', name: 'Checkout Placement Record History', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementRecordHistoryAction' },
    complete: { code: 'checkoutPlacementCompleteChannel', name: 'Checkout Placement Complete', active: true, qualifier: { decision: 'SUCCESS' }, target: 'checkoutPlacementCompleteAction' },
    compensate: { code: 'checkoutPlacementCompensateChannel', name: 'Checkout Placement Compensate Failure', active: true, qualifier: { decision: 'ERROR' }, target: 'checkoutPlacementCompensateAction' }
};
