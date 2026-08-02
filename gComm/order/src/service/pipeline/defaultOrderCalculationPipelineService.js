/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/pipeline/DefaultOrderCalculationPipelineService
 * @description Pipeline node service for order validation and aggregate order
 * calculation or reconciliation. It preserves historical checkout evidence and
 * provides extension points for explicit lifecycle recalculation operations.
 * @layer pipeline
 * @owner order
 * @override Project modules may replace individual nodes for amendments,
 * returns, refunds, adjustments, reconciliation, or customer-specific order
 * total policy while preserving owning-module authority boundaries.
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
      orderCode: request && request.orderCode,
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
  validateOrderContext: function (request, response, process) {
    this.next(request, response, process, "validateOrderContext");
  },
  validateEntries: function (request, response, process) {
    this.next(request, response, process, "validateEntries");
  },
  validateAllocations: function (request, response, process) {
    this.next(request, response, process, "validateAllocations");
  },
  validatePaymentEvidence: function (request, response, process) {
    this.next(request, response, process, "validatePaymentEvidence");
  },
  validateHistoricalEvidence: function (request, response, process) {
    this.next(request, response, process, "validateHistoricalEvidence");
  },
  calculateEntries: function (request, response, process) {
    this.next(request, response, process, "calculateEntries");
  },
  reconcileDeliveryCharges: function (request, response, process) {
    this.next(request, response, process, "reconcileDeliveryCharges");
  },
  reconcileOrderPromotions: function (request, response, process) {
    this.next(request, response, process, "reconcileOrderPromotions");
  },
  reconcileOrderTax: function (request, response, process) {
    this.next(request, response, process, "reconcileOrderTax");
  },
  reconcilePaymentEvidence: function (request, response, process) {
    this.next(request, response, process, "reconcilePaymentEvidence");
  },
  prepareOrderTotals: function (request, response, process) {
    this.next(request, response, process, "prepareOrderTotals");
  },
  handleSucessEnd: function (request, response, process) {
    process.resolve(response.success);
  },
  handleErrorEnd: function (request, response, process) {
    process.reject(response.error);
  },
};
