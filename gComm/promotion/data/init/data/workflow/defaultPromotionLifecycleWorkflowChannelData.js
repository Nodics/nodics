/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/data/workflow/defaultPromotionLifecycleWorkflowChannelData @description Routes Promotion lifecycle workflow heads, approvals, rejections, and automatic repair actions. @layer data @owner promotion */
module.exports = {
  manualReview: {
    code: "promotionLifecycleManualReviewChannel",
    name: "Promotion Lifecycle Manual Review",
    active: true,
    qualifier: { decision: "SUCCESS" },
    target: "promotionLifecycleManualReviewAction",
  },
  manualComplete: {
    code: "promotionLifecycleManualCompleteChannel",
    name: "Promotion Lifecycle Manual Completion",
    active: true,
    qualifier: { decision: "SUCCESS" },
    target: "promotionLifecycleManualCompleteAction",
  },
  manualReject: {
    code: "promotionLifecycleManualRejectChannel",
    name: "Promotion Lifecycle Manual Rejection",
    active: true,
    qualifier: { decision: "REJECT" },
    target: "promotionLifecycleManualRejectAction",
  },
  automaticComplete: {
    code: "promotionLifecycleAutomaticCompleteChannel",
    name: "Promotion Lifecycle Automatic Completion",
    active: true,
    qualifier: { decision: "SUCCESS" },
    target: "promotionLifecycleAutomaticCompleteAction",
  },
};
