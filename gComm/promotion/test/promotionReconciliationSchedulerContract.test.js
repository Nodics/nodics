/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/test/promotionReconciliationSchedulerContract
 * @description Protects CronJob-owned Promotion reconciliation scheduling metadata and service-token execution handoff.
 * @layer test
 * @owner promotion
 * @override Customer modules may replace schedule timing or fan-out while preserving CronJob ownership and Promotion service-token repair execution.
 */
const assert = require("assert");

const properties = require("../config/properties").promotion;
const scheduler = require("../src/service/scheduler/defaultPromotionReconciliationSchedulerService");
const cronJobData = require("../data/init/data/cronjob/defaultPromotionReconciliationCronJobData");
const cronJobHeader = require("../data/init/headers/cronjob/defaultPromotionReconciliationCronJobHeader");

global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.cause = cause;
      this.code = code;
    }
  },
};
global.CONFIG = {
  get: (key) => (key === "promotion" ? properties : undefined),
};

const schedulerConfig = properties.reconciliation.scheduler;
assert.strictEqual(schedulerConfig.enabled, true);
assert.strictEqual(
  schedulerConfig.jobCode,
  "promotionEvaluationReconciliationJob",
);
assert.strictEqual(schedulerConfig.activeByDefault, false);
assert.strictEqual(
  schedulerConfig.handler,
  "DefaultPromotionReconciliationSchedulerService.run",
);

const jobDefinition = scheduler.jobDefinition();
assert.strictEqual(jobDefinition.code, schedulerConfig.jobCode);
assert.strictEqual(jobDefinition.active, false);
assert.strictEqual(
  jobDefinition.jobDetail.startNode,
  "DefaultPromotionReconciliationSchedulerService.run",
);
assert.strictEqual(jobDefinition.jobDetail.body.enterpriseCode, "default");
assert.strictEqual(jobDefinition.event.executed, true);
assert.strictEqual(jobDefinition.event.targetModule, "promotion");

const initJob = cronJobData.defaultPromotionEvaluationReconciliationJob;
assert.strictEqual(initJob.code, schedulerConfig.jobCode);
assert.strictEqual(initJob.active, false);
assert.strictEqual(
  initJob.trigger.expression,
  schedulerConfig.triggerExpression,
);
assert.strictEqual(
  initJob.jobDetail.startNode,
  "DefaultPromotionReconciliationSchedulerService.run",
);
assert.strictEqual(
  cronJobHeader.cronjob.defaultPromotionReconciliationCronJob.options
    .schemaName,
  "cronJob",
);
assert.strictEqual(
  cronJobHeader.cronjob.defaultPromotionReconciliationCronJob.query.code,
  "$code",
);

let reconciledRequest;
global.SERVICE = {
  DefaultPromotionRepairService: {
    reconcile: async (request) => {
      reconciledRequest = request;
      return { status: "RECONCILED", scanned: 0, workflowStarted: 0 };
    },
  },
};

(async () => {
  const result = await scheduler.run({
    tenant: "default",
    definition: Object.assign({}, jobDefinition, {
      tenant: "default",
      jobDetail: Object.assign({}, jobDefinition.jobDetail, {
        body: Object.assign({}, jobDefinition.jobDetail.body, {
          enterpriseCode: "enterpriseA",
        }),
      }),
    }),
  });
  assert.strictEqual(result.status, "RECONCILED");
  assert.strictEqual(reconciledRequest.tenant, "default");
  assert.strictEqual(reconciledRequest.enterpriseCode, "enterpriseA");
  assert.strictEqual(reconciledRequest.authData.tokenType, "service");
  assert.strictEqual(reconciledRequest.authData.enterprise.code, "enterpriseA");
  assert.strictEqual(
    reconciledRequest.repairRequest.operationType,
    "RECONCILE_EVIDENCE",
  );
  assert(
    reconciledRequest.repairRequest.idempotencyKey.startsWith(
      "promotion-reconcile::promotionEvaluationReconciliationJob::enterpriseA::",
    ),
  );

  console.log("Promotion reconciliation scheduler contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
