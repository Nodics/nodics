/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/data/workflow/defaultPromotionLifecycleWorkflowActionHeader @description Imports Promotion lifecycle workflow actions into Workflow-owned schemas. @layer data @owner promotion */
module.exports = {
  workflow: {
    defaultPromotionLifecycleWorkflowAction: {
      options: {
        enabled: true,
        schemaName: "workflowAction",
        operation: "saveAll",
        dataFilePrefix: "defaultPromotionLifecycleWorkflowActionData",
      },
      query: { code: "$code" },
    },
  },
};
