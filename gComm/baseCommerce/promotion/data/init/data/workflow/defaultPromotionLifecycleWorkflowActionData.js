/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/data/workflow/defaultPromotionLifecycleWorkflowActionData @description Seeds manual review and automatic repair actions for Promotion lifecycle governance. @layer data @owner promotion */
module.exports = {
  manualReview: {
    code: "promotionLifecycleManualReviewAction",
    name: "Review Promotion Lifecycle Change",
    active: true,
    type: ENUMS.WorkflowActionType.MANUAL.key,
    accessGroups: ["workflowUserGroup"],
    allowedDecisions: ["SUCCESS", "REJECT", "ERROR"],
    channels: [
      "promotionLifecycleManualCompleteChannel",
      "promotionLifecycleManualRejectChannel",
      "defaultErrorChannel",
    ],
  },
  manualComplete: {
    code: "promotionLifecycleManualCompleteAction",
    name: "Complete Approved Promotion Lifecycle Change",
    active: true,
    type: ENUMS.WorkflowActionType.AUTO.key,
    handler: "DefaultPromotionLifecycleWorkflowService.complete",
    accessGroups: ["workflowUserGroup"],
    allowedDecisions: ["SUCCESS", "ERROR"],
    channels: ["defaultSuccessChannel", "defaultErrorChannel"],
  },
  manualReject: {
    code: "promotionLifecycleManualRejectAction",
    name: "Reject Promotion Lifecycle Change",
    active: true,
    type: ENUMS.WorkflowActionType.AUTO.key,
    handler: "DefaultPromotionLifecycleWorkflowService.reject",
    accessGroups: ["workflowUserGroup"],
    allowedDecisions: ["REJECT", "ERROR"],
    channels: ["defaultRejectChannel", "defaultErrorChannel"],
  },
  automaticComplete: {
    code: "promotionLifecycleAutomaticCompleteAction",
    name: "Complete Promotion Automatic Repair",
    active: true,
    type: ENUMS.WorkflowActionType.AUTO.key,
    handler: "DefaultPromotionLifecycleWorkflowService.complete",
    accessGroups: ["workflowUserGroup"],
    allowedDecisions: ["SUCCESS", "ERROR"],
    channels: ["defaultSuccessChannel", "defaultErrorChannel"],
  },
};
