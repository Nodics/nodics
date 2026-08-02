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

const invoked = [];
const process = {
  nextSuccess: () => invoked.push("next"),
  resolve: (value) => invoked.push(["resolve", value]),
  reject: (error) => invoked.push(["reject", error]),
};
const response = {};
orderEntryCalculationService.reconcileEntryTax(
  { entryCode: "entry-1" },
  response,
  process,
);
orderEntryCalculationService.reconcileInventoryEvidence(
  { entryCode: "entry-1" },
  response,
  process,
);
assert(response.success.steps.includes("reconcileEntryTax"));
assert(response.success.steps.includes("reconcileInventoryEvidence"));
orderCalculationService.calculateEntries(
  { orderCode: "order-1" },
  response,
  process,
);
orderCalculationService.prepareOrderTotals(
  { orderCode: "order-1" },
  response,
  process,
);
assert(response.success.steps.includes("calculateEntries"));
assert(response.success.steps.includes("prepareOrderTotals"));

console.log("Order calculation pipeline contract validated");
