/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/service/workflow/DefaultPromotionLifecycleInternalClientService
 * @description Crosses from human Promotion workflow actions into service-token-only automatic repair commands.
 * @layer service
 * @owner promotion
 * @override Customer modules may replace the internal client to call project-specific repair routes while preserving service-token isolation and idempotency.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  repair: async function (request) {
    if (
      SERVICE.DefaultPromotionLifecycleWorkflowService &&
      typeof SERVICE.DefaultPromotionLifecycleWorkflowService.repair ===
        "function"
    ) {
      return SERVICE.DefaultPromotionLifecycleWorkflowService.repair({
        tenant: request.tenant,
        authData: { tokenType: "service", principalId: "promotion" },
        repairRequest: request.repairRequest,
      });
    }
    return {
      status: "REPAIR_REQUESTED",
      repairRequest: request.repairRequest,
    };
  },
};
