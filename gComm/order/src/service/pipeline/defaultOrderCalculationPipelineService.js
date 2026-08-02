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
  config: function () {
    return (CONFIG.get("order") || {}).calculation || {};
  },
  error: function (message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError) {
      return new CLASSES.NodicsError(message, null, "ERR_ORD_00000");
    }
    const error = new Error(message);
    error.code = "ERR_ORD_00000";
    return error;
  },
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.items)) return value.items;
    return [value];
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
  loadEntries: async function (request) {
    if (request.orderEntries) return this.items(request.orderEntries);
    const modelEntries = request.model && request.model.orderEntries;
    if (modelEntries) return this.items(modelEntries);
    if (!request.orderCode) return [];
    const service = SERVICE.DefaultOrderEntryService;
    if (!service || typeof service.get !== "function") return [];
    const query = {
      orderCode: request.orderCode,
    };
    if (request.entCode) query.entCode = request.entCode;
    const response = await service.get({
      tenant: request.tenant,
      authData: request.authData,
      query: query,
      searchOptions: {
        limit: Number(this.config().maximumAggregateRecords || 1000),
      },
    });
    return this.items(response);
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
  calculateEntries: async function (request, response, process) {
    try {
      const entries = await this.loadEntries(request);
      const entryPipeline =
        (this.config().entryPipeline || {}).name ||
        "orderEntryCalculationPipeline";
      if (
        !SERVICE.DefaultPipelineService ||
        typeof SERVICE.DefaultPipelineService.start !== "function"
      ) {
        throw this.error("Order calculation requires the Pipeline service");
      }
      const calculatedEntries = [];
      for (const entry of entries) {
        const result = await SERVICE.DefaultPipelineService.start(
          entryPipeline,
          Object.assign({}, request, {
            entry: entry,
            entryCode: entry && entry.entryCode,
          }),
          {},
        );
        calculatedEntries.push(result);
      }
      const envelope = this.envelope(request, response);
      envelope.evidence.entries = entries;
      envelope.evidence.calculatedEntries = calculatedEntries;
      envelope.evidence.entryPipelineName = entryPipeline;
      this.next(request, response, process, "calculateEntries");
    } catch (error) {
      process.error(
        request,
        response,
        error.code ? error : this.error((error && error.message) || error),
      );
    }
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
