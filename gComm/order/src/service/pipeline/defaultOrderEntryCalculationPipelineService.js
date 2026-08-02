/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/pipeline/DefaultOrderEntryCalculationPipelineService
 * @description Pipeline node service for one order-entry calculation or
 * evidence reconciliation task. Order entry calculation is separate from
 * aggregate order calculation and must not hide Payment, Inventory,
 * Fulfillment, Promotion, Pricing, or Tax authority inside Order.
 * @layer pipeline
 * @owner order
 * @override Project modules may replace individual nodes for customer-specific
 * amendments, returns, refund allocation, tax display, or reconciliation rules.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  envelope: function (request, response) {
    response.success = response.success || {
      entryCode: request && request.entryCode,
      steps: [],
      evidence: {},
    };
    response.success.steps = response.success.steps || [];
    response.success.evidence = response.success.evidence || {};
    return response.success;
  },
  next: function (request, response, process, step) {
    this.envelope(request, response).steps.push(step);
    process.nextSuccess(request, response);
  },
  resolveOrderEntryContext: function (request, response, process) {
    this.next(request, response, process, "resolveOrderEntryContext");
  },
  reconcileEntryPriceEvidence: function (request, response, process) {
    this.next(request, response, process, "reconcileEntryPriceEvidence");
  },
  reconcileEntryPromotions: function (request, response, process) {
    this.next(request, response, process, "reconcileEntryPromotions");
  },
  reconcileEntryTax: function (request, response, process) {
    this.next(request, response, process, "reconcileEntryTax");
  },
  reconcileInventoryEvidence: function (request, response, process) {
    this.next(request, response, process, "reconcileInventoryEvidence");
  },
  prepareOrderEntryTotals: function (request, response, process) {
    this.next(request, response, process, "prepareOrderEntryTotals");
  },
  handleSucessEnd: function (request, response, process) {
    process.resolve(response.success);
  },
  handleErrorEnd: function (request, response, process) {
    process.reject(response.error);
  },
};
