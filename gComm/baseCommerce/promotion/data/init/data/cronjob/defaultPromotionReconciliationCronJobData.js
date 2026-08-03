/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/data/cronjob/defaultPromotionReconciliationCronJobData
 * @description Seeds the disabled default CronJob contract for Promotion evaluation reconciliation.
 * @layer data
 * @owner promotion
 * @override Customer or environment modules may replace timing, node ownership, active state, tenant, enterprise, and handler body without changing Promotion source.
 */
module.exports = {
  defaultPromotionEvaluationReconciliationJob: {
    code: "promotionEvaluationReconciliationJob",
    description:
      "Runs Promotion-owned failed evaluation reconciliation through CronJob-owned scheduling.",
    runOnNode: "node0",
    active: false,
    logResult: true,
    jobDetail: {
      startNode: "DefaultPromotionReconciliationSchedulerService.run",
      body: {
        enterpriseCode: "default",
        operationType: "RECONCILE_EVIDENCE",
      },
    },
    trigger: {
      expression: "0 */15 * * * *",
    },
    event: {
      executed: true,
      completed: false,
      targetModule: "promotion",
      eventType: "ASYNC",
    },
    priority: 750,
    status: "NEW",
    state: "NEW",
  },
};
