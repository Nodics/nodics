/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/data/workflow/defaultPromotionLifecycleWorkflowHeadData @description Seeds manual and automatic Promotion lifecycle workflow heads. @layer data @owner promotion */
module.exports = {
  manual: {
    code: "promotionLifecycleManualFlow",
    name: "Promotion Lifecycle Manual Review",
    active: true,
    type: ENUMS.WorkflowActionType.AUTO.key,
    position: ENUMS.WorkflowActionPosition.HEAD.key,
    handler: "DefaultWorkflowActionExecutionService.performHeadOperation",
    accessGroups: ["workflowUserGroup", "employeeUserGroup"],
    allowedDecisions: ["SUCCESS"],
    channels: ["promotionLifecycleManualReviewChannel"],
  },
  automatic: {
    code: "promotionLifecycleAutomaticFlow",
    name: "Promotion Lifecycle Automatic Repair",
    active: true,
    type: ENUMS.WorkflowActionType.AUTO.key,
    position: ENUMS.WorkflowActionPosition.HEAD.key,
    handler: "DefaultWorkflowActionExecutionService.performHeadOperation",
    accessGroups: ["workflowUserGroup"],
    allowedDecisions: ["SUCCESS"],
    channels: ["promotionLifecycleAutomaticCompleteChannel"],
  },
};
