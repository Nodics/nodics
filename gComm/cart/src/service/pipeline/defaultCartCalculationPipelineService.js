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
const commerceCalculationDelegateUtils = require("../../../../checkout/src/utils/commerceCalculationDelegateUtils");

module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  config: function () {
    return (CONFIG.get("cart") || {}).calculation || {};
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
  loadEntries: async function (request) {
    if (request.cartEntries) return this.items(request.cartEntries);
    const modelEntries = request.model && request.model.cartEntries;
    if (modelEntries) return this.items(modelEntries);
    if (!request.cartCode) return [];
    const service = SERVICE.DefaultCartEntryService;
    if (!service || typeof service.get !== "function") return [];
    const query = {
      cartCode: request.cartCode,
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
  calculateEntries: async function (request, response, process) {
    try {
      const entries = await this.loadEntries(request);
      const entryPipeline =
        (this.config().entryPipeline || {}).name ||
        "cartEntryCalculationPipeline";
      const calculatedEntries = [];
      if (
        !SERVICE.DefaultPipelineService ||
        typeof SERVICE.DefaultPipelineService.start !== "function"
      ) {
        throw this.error("Cart calculation requires the Pipeline service");
      }
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
  calculateDeliveryCharges: function (request, response, process) {
    this.next(request, response, process, "calculateDeliveryCharges");
  },
  evaluateCartPromotions: async function (request, response, process) {
    try {
      const envelope = this.envelope(request, response);
      envelope.evidence.cartPromotions =
        await commerceCalculationDelegateUtils.resolveDelegate(
          "cart",
          "cartPromotions",
          request,
          {
            cartCode: request && request.cartCode,
            cart: request && request.model,
            entries: envelope.evidence.entries || [],
            calculatedEntries: envelope.evidence.calculatedEntries || [],
          },
        );
      this.next(request, response, process, "evaluateCartPromotions");
    } catch (error) {
      process.error(
        request,
        response,
        error.code ? error : this.error((error && error.message) || error),
      );
    }
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
