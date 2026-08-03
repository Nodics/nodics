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
const commerceCalculationDelegateUtils = require("../../../../checkoutCore/src/utils/commerceCalculationDelegateUtils");

module.exports = {
  /**
   * Initializes the aggregate order calculation node service.
   *
   * @returns {Promise<boolean>} Resolves when the service is ready.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Completes post-start initialization for order calculation nodes.
   *
   * @returns {Promise<boolean>} Resolves when post-initialization succeeds.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Reads order calculation configuration from the governed runtime registry.
   *
   * @returns {Object} Order calculation configuration.
   */
  config: function () {
    return (CONFIG.get("order") || {}).calculation || {};
  },
  /**
   * Creates a governed order calculation error.
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
   * Normalizes service responses and raw values into an array of order entries.
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
   * Ensures the aggregate order calculation response has a stable success envelope.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @returns {Object} Mutable success envelope.
   */
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
  /**
   * Records a completed order-calculation node and advances the Pipeline executor.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @param {string} step Completed step code.
   * @returns {void}
   */
  next: function (request, response, process, step) {
    this.envelope(request, response).steps.push(step);
    process.nextSuccess(request, response);
  },
  /**
   * Loads order entries from request payload or the Order Entry schema service.
   *
   * @param {Object} request Pipeline request context.
   * @returns {Promise<Array>} Order entries for aggregate calculation.
   */
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
  /**
   * Validates order-level request context before reconciliation begins.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateOrderContext: function (request, response, process) {
    this.next(request, response, process, "validateOrderContext");
  },
  /**
   * Validates that order entries are eligible for calculation or reconciliation.
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
   * Validates delivery and payment allocations attached to the order.
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
   * Validates payment evidence before order total reconciliation.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validatePaymentEvidence: function (request, response, process) {
    this.next(request, response, process, "validatePaymentEvidence");
  },
  /**
   * Validates preserved checkout evidence before order recalculation.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  validateHistoricalEvidence: function (request, response, process) {
    this.next(request, response, process, "validateHistoricalEvidence");
  },
  /**
   * Runs the configured order-entry calculation pipeline for each order entry.
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
  /**
   * Reconciles delivery charge evidence owned by Fulfillment or carrier integrations.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  reconcileDeliveryCharges: function (request, response, process) {
    this.next(request, response, process, "reconcileDeliveryCharges");
  },
  /**
   * Delegates order-level promotion evidence reconciliation to the promotion authority.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after promotion evidence is attached.
   */
  reconcileOrderPromotions: async function (request, response, process) {
    try {
      const envelope = this.envelope(request, response);
      envelope.evidence.orderPromotionEvidence =
        await commerceCalculationDelegateUtils.resolveDelegate(
          "order",
          "orderPromotionEvidence",
          request,
          {
            orderCode: request && request.orderCode,
            lifecycleOperation: request && request.lifecycleOperation,
            order: request && request.model,
            entries: envelope.evidence.entries || [],
            calculatedEntries: envelope.evidence.calculatedEntries || [],
          },
        );
      this.next(request, response, process, "reconcileOrderPromotions");
    } catch (error) {
      process.error(
        request,
        response,
        error.code ? error : this.error((error && error.message) || error),
      );
    }
  },
  /**
   * Reconciles aggregate order tax evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  reconcileOrderTax: function (request, response, process) {
    this.next(request, response, process, "reconcileOrderTax");
  },
  /**
   * Reconciles payment captures, authorizations, refunds, or split-payment evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  reconcilePaymentEvidence: function (request, response, process) {
    this.next(request, response, process, "reconcilePaymentEvidence");
  },
  /**
   * Prepares final order totals from preserved and recalculated evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  prepareOrderTotals: function (request, response, process) {
    this.next(request, response, process, "prepareOrderTotals");
  },
  /**
   * Resolves the aggregate order calculation pipeline with the success envelope.
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
   * Rejects the aggregate order calculation pipeline with the captured error.
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
