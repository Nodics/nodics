/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/service/scheduler/DefaultPromotionReconciliationSchedulerService
 * @description Builds and executes CronJob-owned Promotion reconciliation triggers without making Promotion a scheduler authority.
 * @layer service
 * @owner promotion
 * @override Customer modules may replace schedule creation, enterprise scoping, or trigger fan-out while preserving service identity and bounded reconciliation.
 */
module.exports = {
  /**
   * Executes the init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the post init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the config contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  config: function () {
    return (
      ((CONFIG.get("promotion") || {}).reconciliation || {}).scheduler || {}
    );
  },
  /**
   * Executes the service auth data contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  serviceAuthData: function (enterpriseCode) {
    return {
      tokenType: "service",
      principalId: "promotionScheduler",
      enterpriseCode: enterpriseCode,
      enterprise: enterpriseCode ? { code: enterpriseCode } : undefined,
    };
  },
  /**
   * Executes the job definition contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  jobDefinition: function (overrides) {
    const scheduler = Object.assign({}, this.config(), overrides || {});
    return {
      code: scheduler.jobCode || "promotionEvaluationReconciliationJob",
      description:
        "Runs Promotion-owned failed evaluation reconciliation through CronJob-owned scheduling.",
      runOnNode: scheduler.runOnNode || "node0",
      active: scheduler.activeByDefault === true,
      logResult: scheduler.logResult !== false,
      jobDetail: {
        startNode:
          scheduler.handler ||
          "DefaultPromotionReconciliationSchedulerService.run",
        body: {
          enterpriseCode: scheduler.enterpriseCode || "default",
          operationType: "RECONCILE_EVIDENCE",
        },
      },
      trigger: {
        expression: scheduler.triggerExpression || "0 */15 * * * *",
      },
      event: {
        executed: scheduler.executedEvent !== false,
        completed: scheduler.completedEvent === true,
        targetModule: scheduler.eventTargetModule || "promotion",
        eventType: scheduler.eventType || "ASYNC",
      },
      priority: Number(scheduler.priority || 750),
      status: "NEW",
      state: "NEW",
    };
  },
  /**
   * Executes the run contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  run: async function (request) {
    const definition = (request || {}).definition || {};
    const body = (definition.jobDetail || {}).body || {};
    const enterpriseCode =
      body.enterpriseCode ||
      definition.enterpriseCode ||
      ((request || {}).enterprise || {}).code;
    const tenant = definition.tenant || (request || {}).tenant || "default";
    if (
      !SERVICE.DefaultPromotionRepairService ||
      typeof SERVICE.DefaultPromotionRepairService.reconcile !== "function"
    ) {
      throw new CLASSES.NodicsError(
        "Promotion repair service is not available for scheduled reconciliation",
        null,
        "ERR_PROMOTION_00023",
      );
    }
    return SERVICE.DefaultPromotionRepairService.reconcile({
      tenant: tenant,
      enterpriseCode: enterpriseCode,
      authData: this.serviceAuthData(enterpriseCode),
      repairRequest: Object.assign({}, body, {
        idempotencyKey:
          body.idempotencyKey ||
          [
            "promotion-reconcile",
            definition.code || this.config().jobCode,
            enterpriseCode || "enterprise",
            new Date().toISOString().slice(0, 16),
          ].join("::"),
      }),
    });
  },
};
