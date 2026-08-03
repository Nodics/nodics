/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/service/repair/DefaultPromotionRepairService
 * @description Records bounded Promotion repair, retry, and reconciliation evidence without mutating immutable evaluation rows.
 * @layer service
 * @owner promotion
 * @override Customer modules may replace concrete repair execution while preserving service-token-only access, idempotency, safe diagnostics, and immutable evaluation evidence.
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
    return (CONFIG.get("promotion") || {}).reconciliation || {};
  },
  /**
   * Executes the workflow config contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  workflowConfig: function () {
    return (CONFIG.get("promotion") || {}).workflow || {};
  },
  /**
   * Executes the error contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  error: function (code, message) {
    return new CLASSES.NodicsError(message, null, code);
  },
  /**
   * Executes the items contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value.result !== undefined) {
      return Array.isArray(value.result) ? value.result : [value.result];
    }
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  /**
   * Executes the assert service identity contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertServiceIdentity: function (request) {
    if (
      !request ||
      !request.authData ||
      request.authData.tokenType !== "service"
    ) {
      throw this.error(
        "ERR_PROMOTION_00021",
        "Promotion repair requires service identity",
      );
    }
  },
  /**
   * Executes the assert safe request contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertSafeRequest: function (request) {
    if (
      /cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload/i.test(
        JSON.stringify(request || {}),
      )
    ) {
      throw this.error(
        "ERR_PROMOTION_00023",
        "Promotion repair request must not contain secrets or raw provider payloads",
      );
    }
  },
  /**
   * Executes the enterprise code contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  enterpriseCode: function (request) {
    return SERVICE.DefaultPromotionEnterpriseScopeService.resolveEnterpriseCode(
      request,
    );
  },
  /**
   * Executes the build code contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  buildCode: function (enterpriseCode, type, values) {
    return SERVICE.DefaultPromotionEnterpriseScopeService.buildCode(
      enterpriseCode,
      type,
      values,
    );
  },
  /**
   * Executes the operation contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  operation: function (repairRequest) {
    return (
      repairRequest.operationType ||
      repairRequest.lifecycleOperation ||
      "REPAIR_EVALUATION"
    );
  },
  /**
   * Executes the idempotency key contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  idempotencyKey: function (repairRequest) {
    return (
      repairRequest.idempotencyKey ||
      repairRequest.workflowCarrierCode ||
      repairRequest.carrierCode ||
      [
        this.operation(repairRequest),
        repairRequest.evaluationCode ||
          repairRequest.sourceCode ||
          "promotion-repair",
      ]
        .filter(Boolean)
        .join("::")
    );
  },
  /**
   * Executes the existing run contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  existingRun: async function (request, idempotencyKey) {
    if (
      !SERVICE.DefaultPromotionRepairRunService ||
      typeof SERVICE.DefaultPromotionRepairRunService.get !== "function"
    ) {
      return undefined;
    }
    const runs = this.items(
      await SERVICE.DefaultPromotionRepairRunService.get({
        tenant: request.tenant,
        authData: request.authData,
        query: { idempotencyKey: idempotencyKey },
        searchOptions: { limit: 2 },
      }),
    );
    if (runs.length > 1) {
      throw this.error(
        "ERR_PROMOTION_00023",
        "Promotion repair resolved duplicate idempotency records",
      );
    }
    return runs[0];
  },
  /**
   * Executes the persist run contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  persistRun: async function (request, run) {
    if (
      !SERVICE.DefaultPromotionRepairRunService ||
      typeof SERVICE.DefaultPromotionRepairRunService.save !== "function"
    ) {
      return run;
    }
    const response = await SERVICE.DefaultPromotionRepairRunService.save({
      tenant: request.tenant,
      authData: request.authData,
      model: run,
    });
    return this.items(response)[0] || response.result || run;
  },
  /**
   * Executes the evaluation contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  evaluation: async function (request, evaluationCode) {
    if (
      !evaluationCode ||
      !SERVICE.DefaultPromotionEvaluationRunService ||
      typeof SERVICE.DefaultPromotionEvaluationRunService.get !== "function"
    ) {
      return undefined;
    }
    return this.items(
      await SERVICE.DefaultPromotionEvaluationRunService.get({
        tenant: request.tenant,
        authData: request.authData,
        query: { evaluationCode: evaluationCode },
        searchOptions: { limit: 1 },
      }),
    )[0];
  },
  /**
   * Executes the execute evaluator contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  executeEvaluator: async function (request, repairRequest, retryCount) {
    if (
      !repairRequest.sourceSnapshot ||
      !SERVICE.DefaultPromotionEvaluationService
    ) {
      return {
        status: "REQUESTED",
        retryCount: retryCount,
        failureCode: "SOURCE_SNAPSHOT_REQUIRED",
        failureMessage:
          "Repair was recorded, but no source snapshot was supplied for re-evaluation.",
      };
    }
    const evaluator = SERVICE.DefaultPromotionEvaluationService;
    const sourceType = repairRequest.sourceType || "CART";
    const targetType = repairRequest.targetType || sourceType;
    const method =
      sourceType === "ORDER"
        ? targetType === "ENTRY"
          ? "reconcileEntry"
          : "reconcileOrder"
        : targetType === "ENTRY"
          ? "evaluateEntry"
          : "evaluateCart";
    if (typeof evaluator[method] !== "function") {
      throw this.error(
        "ERR_PROMOTION_00023",
        "Promotion evaluator repair method is unavailable",
      );
    }
    const result = await evaluator[method](
      Object.assign({}, request, {
        calculationInput: repairRequest.sourceSnapshot,
        idempotencyKey: repairRequest.idempotencyKey,
        evaluationCode: repairRequest.newEvaluationCode,
      }),
    );
    return {
      status: "REPAIRED",
      retryCount: retryCount,
      newEvaluationCode:
        (result.evaluationRun && result.evaluationRun.evaluationCode) ||
        repairRequest.newEvaluationCode,
      completedAt: new Date(),
    };
  },
  /**
   * Executes the repair contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  repair: async function (request) {
    this.assertServiceIdentity(request);
    this.assertSafeRequest(request);
    const repairRequest = request.repairRequest || request.body || {};
    const operationType = this.operation(repairRequest);
    const policy = this.config();
    if (policy.enabled === false) {
      throw this.error("ERR_PROMOTION_00023", "Promotion repair is disabled");
    }
    if (
      !(this.workflowConfig().repairOperations || []).includes(operationType)
    ) {
      throw this.error(
        "ERR_PROMOTION_00022",
        "Promotion repair operation type is invalid",
      );
    }
    const enterpriseCode = this.enterpriseCode(request);
    const idempotencyKey = this.idempotencyKey(repairRequest);
    const existing = await this.existingRun(request, idempotencyKey);
    const terminal = policy.terminalSuccessStatuses || [
      "REPAIRED",
      "RECONCILED",
      "NO_REPAIR_REQUIRED",
    ];
    if (existing && terminal.includes(existing.status)) {
      return Object.assign({ idempotent: true }, existing);
    }
    const retryStatuses = policy.retryStatuses || [
      "REQUESTED",
      "FAILED",
      "PARTIAL",
    ];
    if (existing && !retryStatuses.includes(existing.status)) {
      throw this.error(
        "ERR_PROMOTION_00023",
        "Promotion repair cannot retry run in status " + existing.status,
      );
    }
    const retryCount = Number((existing && existing.retryCount) || 0) + 1;
    if (retryCount > Number(policy.maximumRetries || 3)) {
      throw this.error(
        "ERR_PROMOTION_00023",
        "Promotion repair retry limit exceeded",
      );
    }
    const evaluation = await this.evaluation(
      request,
      repairRequest.evaluationCode,
    );
    const repairRunCode =
      (existing && existing.repairRunCode) ||
      this.buildCode(enterpriseCode, "promotionRepairRun", [idempotencyKey]);
    if (
      evaluation &&
      evaluation.failureCode &&
      !(policy.repairableFailureCodes || []).includes(evaluation.failureCode)
    ) {
      return this.persistRun(
        request,
        Object.assign({}, existing || {}, {
          code: (existing && existing.code) || repairRunCode,
          active: true,
          enterpriseCode: enterpriseCode,
          repairRunCode: repairRunCode,
          idempotencyKey: idempotencyKey,
          operationType: operationType,
          evaluationCode: repairRequest.evaluationCode,
          sourceType: repairRequest.sourceType || evaluation.sourceType,
          sourceCode: repairRequest.sourceCode || evaluation.sourceCode,
          workflowCarrierCode:
            repairRequest.workflowCarrierCode || repairRequest.carrierCode,
          status: "NO_REPAIR_REQUIRED",
          retryCount: retryCount,
          failureCode: evaluation.failureCode,
          requestedAt: (existing && existing.requestedAt) || new Date(),
          completedAt: new Date(),
        }),
      );
    }
    const outcome = await this.executeEvaluator(
      request,
      Object.assign(
        {
          sourceType: evaluation && evaluation.sourceType,
          sourceCode: evaluation && evaluation.sourceCode,
        },
        repairRequest,
        {
          idempotencyKey: idempotencyKey,
          newEvaluationCode:
            repairRequest.newEvaluationCode ||
            [repairRequest.evaluationCode || repairRunCode, "retry", retryCount]
              .filter(Boolean)
              .join("::"),
        },
      ),
      retryCount,
    );
    return this.persistRun(
      request,
      Object.assign({}, existing || {}, {
        code: (existing && existing.code) || repairRunCode,
        active: true,
        enterpriseCode: enterpriseCode,
        repairRunCode: repairRunCode,
        idempotencyKey: idempotencyKey,
        operationType: operationType,
        evaluationCode: repairRequest.evaluationCode,
        sourceType:
          repairRequest.sourceType || (evaluation && evaluation.sourceType),
        sourceCode:
          repairRequest.sourceCode || (evaluation && evaluation.sourceCode),
        workflowCarrierCode:
          repairRequest.workflowCarrierCode || repairRequest.carrierCode,
        status: outcome.status,
        retryCount: outcome.retryCount,
        newEvaluationCode: outcome.newEvaluationCode,
        failureCode: outcome.failureCode,
        failureMessage: outcome.failureMessage,
        requestedAt: (existing && existing.requestedAt) || new Date(),
        completedAt: outcome.completedAt,
      }),
    );
  },
  /**
   * Executes the retry contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  retry: async function (request) {
    return this.repair(
      Object.assign({}, request, {
        repairRequest: Object.assign(
          {},
          request.repairRequest || request.body || {},
          { operationType: "RETRY_EVALUATION" },
        ),
      }),
    );
  },
  /**
   * Executes the reconcile contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  reconcile: async function (request) {
    this.assertServiceIdentity(request);
    this.assertSafeRequest(request);
    const policy = this.config();
    if (policy.enabled === false) {
      throw this.error(
        "ERR_PROMOTION_00023",
        "Promotion reconciliation is disabled",
      );
    }
    const enterpriseCode = this.enterpriseCode(request);
    const limit = Number(policy.maximumAggregateRecords || 1000);
    const repairable = policy.repairableFailureCodes || [];
    const response =
      SERVICE.DefaultPromotionEvaluationRunService &&
      typeof SERVICE.DefaultPromotionEvaluationRunService.get === "function"
        ? await SERVICE.DefaultPromotionEvaluationRunService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
              enterpriseCode: enterpriseCode,
              status: { $in: ["FAILED", "REJECTED"] },
            },
            searchOptions: { limit: limit },
          })
        : { result: [] };
    const evaluations = this.items(response).filter(
      (item) => !item.failureCode || repairable.includes(item.failureCode),
    );
    const started = [];
    for (const evaluation of evaluations) {
      if (
        SERVICE.DefaultPromotionLifecycleWorkflowService &&
        typeof SERVICE.DefaultPromotionLifecycleWorkflowService.start ===
          "function"
      ) {
        started.push(
          await SERVICE.DefaultPromotionLifecycleWorkflowService.start(
            {
              lifecycleOperation: "REPAIR_EVALUATION",
              enterpriseCode: enterpriseCode,
              evaluationCode: evaluation.evaluationCode,
              sourceType: evaluation.sourceType,
              sourceCode: evaluation.sourceCode,
            },
            request,
          ),
        );
      }
    }
    return {
      status: "RECONCILED",
      scanned: this.items(response).length,
      repairable: evaluations.length,
      workflowStarted: started.length,
      repairableFailureCodes: repairable,
    };
  },
};
