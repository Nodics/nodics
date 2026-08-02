/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderCalculationPipelineContract
 * @description Protects Order calculation as validation, entry-level
 * calculation, and aggregate calculation pipelines while keeping Workflow
 * authority for checkout placement and reverse business processes.
 * @layer test
 * @owner order
 * @override Project modules may add, replace, or reorder pipeline nodes while
 * preserving historical evidence and owning-module authority boundaries.
 */
const assert = require("assert");

const properties = require("../config/properties");
const pipelines = require("../src/pipelines/pipelines");
const routers = require("../src/router/routers");
const orderService = require("../src/service/order/DefaultOrderService");
const orderCalculationService = require("../src/service/pipeline/defaultOrderCalculationPipelineService");
const orderEntryCalculationService = require("../src/service/pipeline/defaultOrderEntryCalculationPipelineService");

const calculation = properties.order.calculation;

assert.strictEqual(calculation.enabled, true);
assert.strictEqual(
  calculation.validationPipeline.name,
  "orderValidationPipeline",
);
assert.strictEqual(
  calculation.entryPipeline.name,
  "orderEntryCalculationPipeline",
);
assert.strictEqual(calculation.orderPipeline.name, "orderCalculationPipeline");
assert.deepStrictEqual(calculation.validationPipeline.steps, [
  "validateOrderContext",
  "validateEntries",
  "validateAllocations",
  "validatePaymentEvidence",
  "validateHistoricalEvidence",
]);
assert.deepStrictEqual(calculation.entryPipeline.steps, [
  "resolveOrderEntryContext",
  "reconcileEntryPriceEvidence",
  "reconcileEntryPromotions",
  "reconcileEntryTax",
  "reconcileInventoryEvidence",
  "prepareOrderEntryTotals",
]);
assert.deepStrictEqual(calculation.orderPipeline.steps, [
  "validateOrder",
  "calculateEntries",
  "reconcileDeliveryCharges",
  "reconcileOrderPromotions",
  "reconcileOrderTax",
  "reconcilePaymentEvidence",
  "prepareOrderTotals",
]);
assert.deepStrictEqual(calculation.authority, {
  product: "product",
  pricing: "pricing",
  promotion: "promotion",
  tax: "tax",
  inventory: "inventory",
  payment: "payment",
  fulfillment: "fulfillment",
});
assert.strictEqual(
  calculation.historicalEvidencePolicy.preserveCheckoutEvidence,
  true,
);
assert.strictEqual(
  calculation.historicalEvidencePolicy.recalculationRequiresLifecycleOperation,
  true,
);
assert.strictEqual(
  calculation.delegates.priceEvidence.serviceNames[0],
  "DefaultPriceResolutionService",
);
assert.strictEqual(
  calculation.delegates.priceEvidence.operations[0],
  "resolve",
);
assert.strictEqual(
  calculation.delegates.inventoryEvidence.ownerModule,
  "inventory",
);

assert(pipelines.orderValidationPipeline);
assert(pipelines.orderEntryCalculationPipeline);
assert(pipelines.orderCalculationPipeline);
assert.strictEqual(
  pipelines.orderCalculationPipeline.nodes.validateOrder.type,
  "process",
);
assert.strictEqual(
  pipelines.orderCalculationPipeline.nodes.validateOrder.handler,
  "orderValidationPipeline",
);
assert.strictEqual(
  pipelines.orderCalculationPipeline.nodes.calculateEntries.childPipeline,
  "orderEntryCalculationPipeline",
);
assert.strictEqual(
  pipelines.orderEntryCalculationPipeline.nodes.reconcileEntryPriceEvidence
    .handler,
  "DefaultOrderEntryCalculationPipelineService.reconcileEntryPriceEvidence",
);
assert.strictEqual(
  pipelines.orderEntryCalculationPipeline.nodes.reconcileEntryPromotions
    .handler,
  "DefaultOrderEntryCalculationPipelineService.reconcileEntryPromotions",
);
assert.strictEqual(
  pipelines.orderEntryCalculationPipeline.nodes.reconcileEntryTax.handler,
  "DefaultOrderEntryCalculationPipelineService.reconcileEntryTax",
);
assert.strictEqual(
  pipelines.orderEntryCalculationPipeline.nodes.reconcileInventoryEvidence
    .handler,
  "DefaultOrderEntryCalculationPipelineService.reconcileInventoryEvidence",
);
assert.strictEqual(
  pipelines.orderCalculationPipeline.nodes.reconcilePaymentEvidence.handler,
  "DefaultOrderCalculationPipelineService.reconcilePaymentEvidence",
);
assert.strictEqual(
  routers.order.orderOperations.calculateOrderByCode.key,
  "/code/:code/calculate",
);
assert.strictEqual(
  routers.order.orderOperations.calculateOrderByCode.method,
  "POST",
);
assert.strictEqual(
  routers.order.orderOperations.calculateOrderByCode.operation,
  "calculateOrderByCode",
);

assert.strictEqual(
  properties.order.checkoutPlacement.pipeline.name,
  "checkoutPlacementRunPipeline",
  "Checkout placement remains a Workflow-owned business process with a separate atomic placement-run pipeline",
);
assert.strictEqual(
  pipelines.checkoutPlacementRunPipeline.nodes.calculateEntries,
  undefined,
  "Checkout placement run pipeline must not hide cart/order calculation nodes",
);
assert.strictEqual(
  pipelines.checkoutPlacementRunPipeline.nodes.reconcilePaymentEvidence,
  undefined,
  "Payment calculation/reconciliation belongs in explicit calculation or Payment-owned nodes, not placement-run evidence",
);

global.CONFIG = {
  get: (key) => (key === "order" ? properties.order : undefined),
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.code = code;
      this.cause = cause;
    }
  },
};

const invoked = [];
const pipelineProcess = {
  nextSuccess: () => invoked.push("next"),
  resolve: (value) => invoked.push(["resolve", value]),
  reject: (error) => invoked.push(["reject", error]),
  error: (request, response, error) => {
    throw error;
  },
};

(async () => {
  const response = {};
  global.SERVICE = {};
  await orderEntryCalculationService.reconcileEntryTax(
    { entryCode: "entry-1" },
    response,
    pipelineProcess,
  );
  await orderEntryCalculationService.reconcileInventoryEvidence(
    { entryCode: "entry-1" },
    response,
    pipelineProcess,
  );
  assert(response.success.steps.includes("reconcileEntryTax"));
  assert(response.success.steps.includes("reconcileInventoryEvidence"));
  assert.strictEqual(response.success.evidence.taxEvidence.status, "DEFERRED");
  assert.strictEqual(
    response.success.evidence.inventoryEvidence.status,
    "DEFERRED",
  );

  const delegatedResponse = {};
  const delegatedCalls = [];
  global.SERVICE = {
    DefaultOrderEntryContextService: {
      resolve: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { entryCode: request.calculationInput.entryCode };
      },
    },
    DefaultPriceResolutionService: {
      resolve: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { priceEvidenceCode: "price-order-1" };
      },
    },
    DefaultPromotionEvaluationService: {
      reconcileEntry: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { promotionEvidenceCode: "promotion-order-1" };
      },
    },
    DefaultTaxCalculationService: {
      reconcileEntryTax: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { taxQuoteLineCode: "tax-order-1" };
      },
    },
    DefaultInventoryPromiseReadinessService: {
      reconcileEntryPromise: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { promiseEvidenceCode: "promise-order-1" };
      },
    },
  };
  await orderEntryCalculationService.resolveOrderEntryContext(
    {
      entryCode: "entry-8",
      orderCode: "order-8",
      lifecycleOperation: "ADJUSTMENT",
    },
    delegatedResponse,
    pipelineProcess,
  );
  await orderEntryCalculationService.reconcileEntryPriceEvidence(
    {
      entryCode: "entry-8",
      orderCode: "order-8",
      lifecycleOperation: "ADJUSTMENT",
    },
    delegatedResponse,
    pipelineProcess,
  );
  await orderEntryCalculationService.reconcileEntryPromotions(
    {
      entryCode: "entry-8",
      orderCode: "order-8",
      lifecycleOperation: "ADJUSTMENT",
    },
    delegatedResponse,
    pipelineProcess,
  );
  await orderEntryCalculationService.reconcileEntryTax(
    {
      entryCode: "entry-8",
      orderCode: "order-8",
      lifecycleOperation: "ADJUSTMENT",
    },
    delegatedResponse,
    pipelineProcess,
  );
  await orderEntryCalculationService.reconcileInventoryEvidence(
    {
      entryCode: "entry-8",
      orderCode: "order-8",
      lifecycleOperation: "ADJUSTMENT",
    },
    delegatedResponse,
    pipelineProcess,
  );
  assert.deepStrictEqual(
    delegatedCalls.map((delegate) => delegate.ownerModule),
    ["order", "pricing", "promotion", "tax", "inventory"],
  );
  assert.strictEqual(
    delegatedResponse.success.evidence.priceEvidence.status,
    "DELEGATED",
  );
  assert.strictEqual(
    delegatedResponse.success.evidence.inventoryEvidence.result
      .promiseEvidenceCode,
    "promise-order-1",
  );

  const startedPipelines = [];
  global.SERVICE = {
    DefaultPipelineService: {
      start: async (pipelineName, request) => {
        startedPipelines.push({
          pipelineName,
          entryCode: request.entryCode,
          orderCode: request.orderCode,
        });
        return {
          pipelineName,
          entryCode: request.entryCode,
          steps: ["resolveOrderEntryContext", "prepareOrderEntryTotals"],
        };
      },
    },
  };

  await orderCalculationService.calculateEntries(
    {
      tenant: "default",
      orderCode: "order-1",
      entCode: "default",
      lifecycleOperation: "ADJUSTMENT",
      orderEntries: [
        { entryCode: "entry-1", orderCode: "order-1" },
        { entryCode: "entry-2", orderCode: "order-1" },
      ],
    },
    response,
    pipelineProcess,
  );
  orderCalculationService.prepareOrderTotals(
    { orderCode: "order-1" },
    response,
    pipelineProcess,
  );
  assert(response.success.steps.includes("calculateEntries"));
  assert(response.success.steps.includes("prepareOrderTotals"));
  assert.deepStrictEqual(
    startedPipelines.map((item) => item.pipelineName),
    ["orderEntryCalculationPipeline", "orderEntryCalculationPipeline"],
  );
  assert.deepStrictEqual(
    response.success.evidence.calculatedEntries.map((entry) => entry.entryCode),
    ["entry-1", "entry-2"],
  );

  await assert.rejects(
    () =>
      orderService.calculateOrder({
        tenant: "default",
        authData: { entCode: "default" },
        model: { code: "order-9" },
      }),
    (error) =>
      error.code === "ERR_ORD_00000" &&
      error.message.includes("requires an explicit lifecycleOperation"),
  );

  global.SERVICE.DefaultPipelineService.start = async (
    pipelineName,
    request,
  ) => {
    assert.strictEqual(pipelineName, "orderCalculationPipeline");
    assert.strictEqual(request.orderCode, "order-9");
    assert.strictEqual(request.entCode, "default");
    assert.strictEqual(request.lifecycleOperation, "ADJUSTMENT");
    return {
      orderCode: request.orderCode,
      pipelineName,
      lifecycleOperation: request.lifecycleOperation,
    };
  };
  const calculated = await orderService.calculateOrder({
    tenant: "default",
    authData: { entCode: "default" },
    model: { code: "order-9", lifecycleOperation: "ADJUSTMENT" },
  });
  assert.strictEqual(calculated.orderCode, "order-9");
  assert.strictEqual(calculated.pipelineName, "orderCalculationPipeline");
  assert.strictEqual(calculated.lifecycleOperation, "ADJUSTMENT");

  console.log("Order calculation pipeline contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
