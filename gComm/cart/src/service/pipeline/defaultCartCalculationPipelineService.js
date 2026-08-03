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
  /**
   * Initializes the cart calculation pipeline node service.
   *
   * @returns {Promise<boolean>} Resolves when the node service is ready.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Completes post-start initialization for the cart calculation pipeline nodes.
   *
   * @returns {Promise<boolean>} Resolves when post-initialization succeeds.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Reads cart calculation configuration from the governed runtime registry.
   *
   * @returns {Object} Cart calculation configuration.
   */
  config: function () {
    return (CONFIG.get("cart") || {}).calculation || {};
  },
  /**
   * Creates a governed cart calculation error.
   *
   * @param {string} message Business-safe error message.
   * @returns {Error} Nodics error when available, otherwise a standard error.
   */
  error: function (message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError) {
      return new CLASSES.NodicsError(message, null, "ERR_ORD_00000");
    }
    const error = new Error(message);
    error.code = "ERR_ORD_00000";
    return error;
  },
  /**
   * Normalizes service responses and raw values into an array of cart entries.
   *
   * @param {*} value Raw service result, result envelope, item list, or single item.
   * @returns {Array} Normalized item array.
   */
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  /**
   * Ensures the aggregate cart calculation response has a stable success envelope.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @returns {Object} Mutable success envelope.
   */
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
  /**
   * Records that a cart calculation node completed.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {string} step Completed step code.
   * @returns {void}
   */
  mark: function (request, response, step) {
    this.envelope(request, response).steps.push(step);
  },
  /**
   * Marks the current node and advances the governed Pipeline executor.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @param {string} step Completed step code.
   * @returns {void}
   */
  next: function (request, response, process, step) {
    this.mark(request, response, step);
    process.nextSuccess(request, response);
  },
  /**
   * Loads cart entries from request payload or the Cart Entry schema service.
   *
   * @param {Object} request Pipeline request context.
   * @returns {Promise<Array>} Cart entries for aggregate calculation.
   */
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
  /**
   * Validates cart-level request context before entry calculations begin.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateCartContext: function (request, response, process) {
    this.next(request, response, process, "validateCartContext");
  },
  /**
   * Validates that cart entries are eligible for calculation.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateEntries: function (request, response, process) {
    this.next(request, response, process, "validateEntries");
  },
  /**
   * Validates delivery and payment allocations before monetary calculation.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateAllocations: function (request, response, process) {
    this.next(request, response, process, "validateAllocations");
  },
  /**
   * Validates inventory readiness through the configured cart calculation node.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateInventoryReadiness: function (request, response, process) {
    this.next(request, response, process, "validateInventoryReadiness");
  },
  /**
   * Validates price, tax, promotion, and payment evidence availability.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateMoneyEvidence: function (request, response, process) {
    this.next(request, response, process, "validateMoneyEvidence");
  },
  /**
   * Runs the configured cart-entry calculation pipeline for each cart entry.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after entry evidence is attached.
   */
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
  /**
   * Calculates or reconciles cart delivery charges.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  calculateDeliveryCharges: function (request, response, process) {
    this.next(request, response, process, "calculateDeliveryCharges");
  },
  /**
   * Delegates cart-level promotion evaluation to the configured promotion authority.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after promotion evidence is attached.
   */
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
  /**
   * Calculates aggregate cart tax after entry and promotion evidence is available.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  calculateCartTax: function (request, response, process) {
    this.next(request, response, process, "calculateCartTax");
  },
  /**
   * Calculates or validates the cart payment plan.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  calculatePaymentPlan: function (request, response, process) {
    this.next(request, response, process, "calculatePaymentPlan");
  },
  /**
   * Prepares final cart totals from entry, delivery, promotion, tax, and payment evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  prepareCartTotals: function (request, response, process) {
    this.next(request, response, process, "prepareCartTotals");
  },
  /**
   * Resolves the aggregate cart calculation pipeline with the success envelope.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  handleSucessEnd: function (request, response, process) {
    process.resolve(response.success);
  },
  /**
   * Rejects the aggregate cart calculation pipeline with the captured error.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  handleErrorEnd: function (request, response, process) {
    process.reject(response.error);
  },
};
