/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/service/pipeline/DefaultCartCalculationPipelineService
 * @description Pipeline node service for cart validation and aggregate cart
 * calculation orchestration. It establishes the extension contract; owning
 * modules perform price, promotion, tax, inventory, payment, and fulfillment
 * authority work through replaceable node handlers.
 * @layer pipeline
 * @owner cart
 * @override Project modules may replace individual calculation nodes or layer
 * pipeline definitions to add customer-specific validation, rounding, pricing,
 * promotion, tax, inventory, delivery-charge, or payment-plan behavior.
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
      cartCode: request && request.cartCode,
      steps: [],
      evidence: {},
    };
    response.success.steps = response.success.steps || [];
    response.success.evidence = response.success.evidence || {};
    return response.success;
  },
  mark: function (request, response, step) {
    this.envelope(request, response).steps.push(step);
  },
  next: function (request, response, process, step) {
    this.mark(request, response, step);
    process.nextSuccess(request, response);
  },
  validateCartContext: function (request, response, process) {
    this.next(request, response, process, "validateCartContext");
  },
  validateEntries: function (request, response, process) {
    this.next(request, response, process, "validateEntries");
  },
  validateAllocations: function (request, response, process) {
    this.next(request, response, process, "validateAllocations");
  },
  validateInventoryReadiness: function (request, response, process) {
    this.next(request, response, process, "validateInventoryReadiness");
  },
  validateMoneyEvidence: function (request, response, process) {
    this.next(request, response, process, "validateMoneyEvidence");
  },
  calculateEntries: function (request, response, process) {
    this.next(request, response, process, "calculateEntries");
  },
  calculateDeliveryCharges: function (request, response, process) {
    this.next(request, response, process, "calculateDeliveryCharges");
  },
  evaluateCartPromotions: function (request, response, process) {
    this.next(request, response, process, "evaluateCartPromotions");
  },
  calculateCartTax: function (request, response, process) {
    this.next(request, response, process, "calculateCartTax");
  },
  calculatePaymentPlan: function (request, response, process) {
    this.next(request, response, process, "calculatePaymentPlan");
  },
  prepareCartTotals: function (request, response, process) {
    this.next(request, response, process, "prepareCartTotals");
  },
  handleSucessEnd: function (request, response, process) {
    process.resolve(response.success);
  },
  handleErrorEnd: function (request, response, process) {
    process.reject(response.error);
  },
};
