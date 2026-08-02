/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/service/pipeline/DefaultCartEntryCalculationPipelineService
 * @description Pipeline node service for one cart-entry calculation task.
 * Entry calculation remains separate from aggregate cart calculation so
 * customer modules can customize product, pricing, promotion, tax, inventory,
 * and rounding behavior at the correct layer.
 * @layer pipeline
 * @owner cart
 * @override Project modules may replace individual nodes while keeping Pricing,
 * Promotion, Tax, and Inventory authority in their owning modules.
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
  resolveProductContext: function (request, response, process) {
    this.next(request, response, process, "resolveProductContext");
  },
  resolveBasePrice: function (request, response, process) {
    this.next(request, response, process, "resolveBasePrice");
  },
  evaluateEntryPromotions: function (request, response, process) {
    this.next(request, response, process, "evaluateEntryPromotions");
  },
  calculateEntryTax: function (request, response, process) {
    this.next(request, response, process, "calculateEntryTax");
  },
  verifyInventoryPromise: function (request, response, process) {
    this.next(request, response, process, "verifyInventoryPromise");
  },
  prepareEntryTotals: function (request, response, process) {
    this.next(request, response, process, "prepareEntryTotals");
  },
  handleSucessEnd: function (request, response, process) {
    process.resolve(response.success);
  },
  handleErrorEnd: function (request, response, process) {
    process.reject(response.error);
  },
};
