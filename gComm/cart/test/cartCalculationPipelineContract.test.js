/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/test/cartCalculationPipelineContract
 * @description Protects Cart calculation as validation, entry-level
 * calculation, and aggregate calculation pipelines instead of one monolithic
 * service.
 * @layer test
 * @owner cart
 * @override Project modules may add, replace, or reorder pipeline nodes while
 * preserving child entry calculation and owning-module authority boundaries.
 */
const assert = require("assert");

const properties = require("../config/properties");
const pipelines = require("../src/pipelines/pipelines");
const routers = require("../src/router/routers");
const cartService = require("../src/service/cart/DefaultCartService");
const cartCalculationService = require("../src/service/pipeline/defaultCartCalculationPipelineService");
const cartEntryCalculationService = require("../src/service/pipeline/defaultCartEntryCalculationPipelineService");

const calculation = properties.cart.calculation;

assert.strictEqual(calculation.enabled, true);
assert.strictEqual(
  calculation.validationPipeline.name,
  "cartValidationPipeline",
);
assert.strictEqual(
  calculation.entryPipeline.name,
  "cartEntryCalculationPipeline",
);
assert.strictEqual(calculation.cartPipeline.name, "cartCalculationPipeline");
assert.deepStrictEqual(calculation.validationPipeline.steps, [
  "validateCartContext",
  "validateEntries",
  "validateAllocations",
  "validateInventoryReadiness",
  "validateMoneyEvidence",
]);
assert.deepStrictEqual(calculation.entryPipeline.steps, [
  "resolveProductContext",
  "resolveBasePrice",
  "evaluateEntryPromotions",
  "calculateEntryTax",
  "verifyInventoryPromise",
  "prepareEntryTotals",
]);
assert.deepStrictEqual(calculation.cartPipeline.steps, [
  "validateCart",
  "calculateEntries",
  "calculateDeliveryCharges",
  "evaluateCartPromotions",
  "calculateCartTax",
  "calculatePaymentPlan",
  "prepareCartTotals",
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
  calculation.delegates.basePrice.serviceNames[0],
  "DefaultPriceResolutionService",
);
assert.strictEqual(calculation.delegates.basePrice.operations[0], "resolve");
assert.strictEqual(
  calculation.delegates.inventoryPromise.ownerModule,
  "inventory",
);
assert.strictEqual(
  calculation.delegates.cartPromotions.operations[0],
  "evaluateCart",
);

assert(pipelines.cartValidationPipeline);
assert(pipelines.cartEntryCalculationPipeline);
assert(pipelines.cartCalculationPipeline);
assert.strictEqual(
  pipelines.cartCalculationPipeline.nodes.validateCart.type,
  "process",
);
assert.strictEqual(
  pipelines.cartCalculationPipeline.nodes.validateCart.handler,
  "cartValidationPipeline",
);
assert.strictEqual(
  pipelines.cartCalculationPipeline.nodes.calculateEntries.childPipeline,
  "cartEntryCalculationPipeline",
);
assert.strictEqual(
  pipelines.cartEntryCalculationPipeline.nodes.resolveBasePrice.handler,
  "DefaultCartEntryCalculationPipelineService.resolveBasePrice",
);
assert.strictEqual(
  pipelines.cartEntryCalculationPipeline.nodes.evaluateEntryPromotions.handler,
  "DefaultCartEntryCalculationPipelineService.evaluateEntryPromotions",
);
assert.strictEqual(
  pipelines.cartEntryCalculationPipeline.nodes.calculateEntryTax.handler,
  "DefaultCartEntryCalculationPipelineService.calculateEntryTax",
);
assert.strictEqual(
  pipelines.cartEntryCalculationPipeline.nodes.verifyInventoryPromise.handler,
  "DefaultCartEntryCalculationPipelineService.verifyInventoryPromise",
);
assert.strictEqual(
  pipelines.cartCalculationPipeline.nodes.evaluateCartPromotions.handler,
  "DefaultCartCalculationPipelineService.evaluateCartPromotions",
);
assert.strictEqual(
  pipelines.cartCalculationPipeline.nodes.calculatePaymentPlan.handler,
  "DefaultCartCalculationPipelineService.calculatePaymentPlan",
);
assert.strictEqual(
  routers.cart.cartOperations.calculateCartByCode.key,
  "/code/:code/calculate",
);
assert.strictEqual(
  routers.cart.cartOperations.calculateCartByCode.method,
  "POST",
);
assert.strictEqual(
  routers.cart.cartOperations.calculateCartByCode.operation,
  "calculateCartByCode",
);

global.CONFIG = {
  get: (key) => (key === "cart" ? properties.cart : undefined),
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
  await cartEntryCalculationService.resolveBasePrice(
    { entryCode: "entry-1" },
    response,
    pipelineProcess,
  );
  await cartEntryCalculationService.calculateEntryTax(
    { entryCode: "entry-1" },
    response,
    pipelineProcess,
  );
  assert(response.success.steps.includes("resolveBasePrice"));
  assert(response.success.steps.includes("calculateEntryTax"));
  assert.strictEqual(response.success.evidence.basePrice.status, "DEFERRED");
  assert.strictEqual(response.success.evidence.entryTax.status, "DEFERRED");

  const delegatedResponse = {};
  const delegatedCalls = [];
  global.SERVICE = {
    DefaultProductCalculationContextService: {
      resolveEntryContext: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { itemCode: request.calculationInput.entry.itemCode };
      },
    },
    DefaultPriceResolutionService: {
      resolve: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { priceEvidenceCode: "price-1", unitPrice: "10.00" };
      },
    },
    DefaultPromotionEvaluationService: {
      evaluateEntry: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { discountTotal: "1.00" };
      },
    },
    DefaultTaxCalculationService: {
      calculateEntryTax: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { taxTotal: "0.90", taxIncluded: false };
      },
    },
    DefaultInventoryPromiseReadinessService: {
      verifyEntryPromise: async (request) => {
        delegatedCalls.push(request.calculationDelegate);
        return { promiseState: "AVAILABLE" };
      },
    },
  };
  await cartEntryCalculationService.resolveProductContext(
    { entryCode: "entry-7", entry: { itemCode: "sku-1" } },
    delegatedResponse,
    pipelineProcess,
  );
  await cartEntryCalculationService.resolveBasePrice(
    { entryCode: "entry-7", entry: { itemCode: "sku-1" } },
    delegatedResponse,
    pipelineProcess,
  );
  await cartEntryCalculationService.evaluateEntryPromotions(
    { entryCode: "entry-7", entry: { itemCode: "sku-1" } },
    delegatedResponse,
    pipelineProcess,
  );
  await cartEntryCalculationService.calculateEntryTax(
    { entryCode: "entry-7", entry: { itemCode: "sku-1" } },
    delegatedResponse,
    pipelineProcess,
  );
  await cartEntryCalculationService.verifyInventoryPromise(
    { entryCode: "entry-7", entry: { itemCode: "sku-1" } },
    delegatedResponse,
    pipelineProcess,
  );
  assert.deepStrictEqual(
    delegatedCalls.map((delegate) => delegate.ownerModule),
    ["product", "pricing", "promotion", "tax", "inventory"],
  );
  assert.strictEqual(
    delegatedResponse.success.evidence.basePrice.status,
    "DELEGATED",
  );
  assert.strictEqual(
    delegatedResponse.success.evidence.inventoryPromise.result.promiseState,
    "AVAILABLE",
  );

  const startedPipelines = [];
  global.SERVICE = {
    DefaultPipelineService: {
      start: async (pipelineName, request) => {
        startedPipelines.push({
          pipelineName,
          entryCode: request.entryCode,
          cartCode: request.cartCode,
        });
        return {
          pipelineName,
          entryCode: request.entryCode,
          steps: ["resolveProductContext", "prepareEntryTotals"],
        };
      },
    },
    DefaultPromotionEvaluationService: {
      evaluateCart: async (request) => ({
        sourceCode: request.calculationInput.cartCode,
        discountTotal: "3.00",
      }),
    },
  };

  await cartCalculationService.calculateEntries(
    {
      tenant: "default",
      cartCode: "cart-1",
      entCode: "default",
      cartEntries: [
        { entryCode: "entry-1", cartCode: "cart-1" },
        { entryCode: "entry-2", cartCode: "cart-1" },
      ],
    },
    response,
    pipelineProcess,
  );
  await cartCalculationService.evaluateCartPromotions(
    { cartCode: "cart-1", model: { code: "cart-1" } },
    response,
    pipelineProcess,
  );
  cartCalculationService.prepareCartTotals(
    { cartCode: "cart-1" },
    response,
    pipelineProcess,
  );
  assert(response.success.steps.includes("calculateEntries"));
  assert(response.success.steps.includes("prepareCartTotals"));
  assert.deepStrictEqual(
    startedPipelines.map((item) => item.pipelineName),
    ["cartEntryCalculationPipeline", "cartEntryCalculationPipeline"],
  );
  assert.deepStrictEqual(
    response.success.evidence.calculatedEntries.map((entry) => entry.entryCode),
    ["entry-1", "entry-2"],
  );
  assert.strictEqual(
    response.success.evidence.cartPromotions.result.discountTotal,
    "3.00",
  );

  global.SERVICE.DefaultPipelineService.start = async (
    pipelineName,
    request,
  ) => {
    assert.strictEqual(pipelineName, "cartCalculationPipeline");
    assert.strictEqual(request.cartCode, "cart-9");
    assert.strictEqual(request.entCode, "default");
    return {
      cartCode: request.cartCode,
      pipelineName,
    };
  };
  const calculated = await cartService.calculateCart({
    tenant: "default",
    authData: { entCode: "default" },
    model: { code: "cart-9" },
  });
  assert.strictEqual(calculated.cartCode, "cart-9");
  assert.strictEqual(calculated.pipelineName, "cartCalculationPipeline");

  console.log("Cart calculation pipeline contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
