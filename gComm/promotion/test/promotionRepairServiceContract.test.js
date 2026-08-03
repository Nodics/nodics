/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/test/promotionRepairServiceContract
 * @description Protects service-token-only Promotion repair, retry, reconciliation, and route contracts.
 * @layer test
 * @owner promotion
 * @override Customer modules may replace repair execution while preserving idempotency, retry bounds, safe diagnostics, and immutable evidence.
 */
const assert = require("assert");

const properties = require("../config/properties").promotion;
const routers = require("../src/router/routers");
const repairService = require("../src/service/repair/defaultPromotionRepairService");
const scopeService = require("../src/service/foundation/defaultPromotionEnterpriseScopeService");
const validation = require("../src/service/foundation/defaultPromotionValidationService");
const controller = require("../src/controller/defaultPromotionRepairController");

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

const serviceAuth = {
  tokenType: "service",
  enterprise: { code: "enterpriseA" },
  principalId: "promotion",
};
const humanAuth = {
  tokenType: "access",
  enterprise: { code: "enterpriseA" },
  principalId: "admin",
};

let repairRuns = [];
let startedWorkflows = [];
let evaluatorCalls = [];

global.SERVICE = {
  DefaultPromotionEnterpriseScopeService: scopeService,
  DefaultPromotionValidationService: validation,
  DefaultPromotionRepairService: repairService,
  DefaultPromotionRepairRunService: {
    get: async (request) => ({
      result: repairRuns.filter((run) =>
        Object.keys(request.query || {}).every(
          (key) => run[key] === request.query[key],
        ),
      ),
    }),
    save: async (request) => {
      const model = Object.assign({}, request.model);
      repairRuns = repairRuns.filter(
        (run) => run.idempotencyKey !== model.idempotencyKey,
      );
      repairRuns.push(model);
      return { result: model };
    },
  },
  DefaultPromotionEvaluationRunService: {
    get: async (request) => {
      const query = request.query || {};
      const records = [
        {
          evaluationCode: "eval-1",
          enterpriseCode: "enterpriseA",
          sourceType: "CART",
          sourceCode: "cart-1",
          status: "FAILED",
          failureCode: "PROMOTION_RUNTIME_FAILED",
        },
        {
          evaluationCode: "eval-2",
          enterpriseCode: "enterpriseA",
          sourceType: "ORDER",
          sourceCode: "order-1",
          status: "FAILED",
          failureCode: "NON_REPAIRABLE",
        },
      ];
      return {
        result: records.filter((record) => {
          if (query.evaluationCode) {
            return record.evaluationCode === query.evaluationCode;
          }
          if (query.status && query.status.$in) {
            return query.status.$in.includes(record.status);
          }
          return true;
        }),
      };
    },
  },
  DefaultPromotionEvaluationService: {
    evaluateCart: async (request) => {
      evaluatorCalls.push({ method: "evaluateCart", request });
      return {
        evaluationRun: {
          evaluationCode: request.evaluationCode,
          status: "EVALUATED",
        },
        appliedPromotions: [],
      };
    },
  },
  DefaultPromotionLifecycleWorkflowService: {
    start: async (subject) => {
      startedWorkflows.push(subject);
      return Object.assign({ workflowCarrierCode: "carrier" }, subject);
    },
  },
};

assert.strictEqual(
  routers.promotion.promotionRepair.repairEvaluation.key,
  "/internal/promotions/repair",
);
assert.strictEqual(
  routers.promotion.promotionRepair.repairEvaluation.apiExposure,
  "moduleInternal",
);
assert.strictEqual(
  routers.promotion.promotionRepair.repairEvaluation.permissionConfig,
  "authSecurity.internalToken.routePermission",
);
assert.strictEqual(
  routers.promotion.promotionRepair.retryEvaluation.operation,
  "retry",
);
assert.strictEqual(
  routers.promotion.promotionRepair.reconcileEvaluations.operation,
  "reconcile",
);

validation.prepareRepairRun({
  authData: serviceAuth,
  model: {
    repairRunCode: "repair-1",
    idempotencyKey: "repair-1",
    operationType: "REPAIR_EVALUATION",
    status: "REQUESTED",
  },
});
assert.throws(
  () =>
    validation.prepareRepairRun({
      authData: serviceAuth,
      model: {
        repairRunCode: "bad",
        idempotencyKey: "bad",
        operationType: "APPROVE_CAMPAIGN",
        status: "REQUESTED",
      },
    }),
  (error) => error.code === "ERR_PROMOTION_00022",
);

(async () => {
  await assert.rejects(
    () =>
      repairService.repair({
        tenant: "default",
        authData: humanAuth,
        repairRequest: { evaluationCode: "eval-1" },
      }),
    (error) => error.code === "ERR_PROMOTION_00021",
  );

  const requested = await repairService.repair({
    tenant: "default",
    authData: serviceAuth,
    repairRequest: {
      evaluationCode: "eval-1",
      idempotencyKey: "repair-eval-1",
      workflowCarrierCode: "carrier-1",
    },
  });
  assert.strictEqual(requested.status, "REQUESTED");
  assert.strictEqual(requested.failureCode, "SOURCE_SNAPSHOT_REQUIRED");
  assert.strictEqual(requested.retryCount, 1);

  const repaired = await repairService.repair({
    tenant: "default",
    authData: serviceAuth,
    repairRequest: {
      evaluationCode: "eval-1",
      idempotencyKey: "repair-eval-2",
      sourceSnapshot: { cartCode: "cart-1", subtotalAmount: "100.00" },
    },
  });
  assert.strictEqual(repaired.status, "REPAIRED");
  assert.strictEqual(evaluatorCalls[0].method, "evaluateCart");
  assert.strictEqual(repaired.newEvaluationCode, "eval-1::retry::1");

  const notRepairable = await repairService.repair({
    tenant: "default",
    authData: serviceAuth,
    repairRequest: {
      evaluationCode: "eval-2",
      idempotencyKey: "repair-eval-3",
    },
  });
  assert.strictEqual(notRepairable.status, "NO_REPAIR_REQUIRED");

  repairRuns.push({
    repairRunCode: "existing",
    idempotencyKey: "retry-limit",
    status: "FAILED",
    retryCount: 3,
    enterpriseCode: "enterpriseA",
  });
  await assert.rejects(
    () =>
      repairService.repair({
        tenant: "default",
        authData: serviceAuth,
        repairRequest: {
          evaluationCode: "eval-1",
          idempotencyKey: "retry-limit",
        },
      }),
    /retry limit/,
  );

  const reconciled = await repairService.reconcile({
    tenant: "default",
    authData: serviceAuth,
    repairRequest: { idempotencyKey: "reconcile-1" },
  });
  assert.strictEqual(reconciled.scanned, 2);
  assert.strictEqual(reconciled.repairable, 1);
  assert.strictEqual(reconciled.workflowStarted, 1);
  assert.strictEqual(startedWorkflows[0].evaluationCode, "eval-1");

  const response = await controller.repair({
    tenant: "default",
    authData: serviceAuth,
    body: { evaluationCode: "eval-1", idempotencyKey: "controller-repair" },
  });
  assert.strictEqual(response.code, "SUC_PROMOTION_00001");
  assert.strictEqual(response.data.status, "REQUESTED");

  console.log("Promotion repair service contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
