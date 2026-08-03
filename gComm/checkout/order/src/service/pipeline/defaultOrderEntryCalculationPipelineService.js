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
const commerceCalculationDelegateUtils = require("../../../../checkoutCore/src/utils/commerceCalculationDelegateUtils");

module.exports = {
  /**
   * Initializes the order-entry calculation node service.
   *
   * @returns {Promise<boolean>} Resolves when the service is ready.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Completes post-start initialization for order-entry calculation nodes.
   *
   * @returns {Promise<boolean>} Resolves when post-initialization succeeds.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Ensures the order-entry calculation response has a stable success envelope.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @returns {Object} Mutable success envelope.
   */
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
  /**
   * Records a completed order-entry node and advances the Pipeline executor.
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
   * Builds the governed delegate input for one order entry.
   *
   * @param {Object} request Pipeline request context.
   * @returns {Object} Delegate input containing order lifecycle and entry identity.
   */
  input: function (request) {
    return {
      entryCode: request && request.entryCode,
      orderCode: request && request.orderCode,
      lifecycleOperation: request && request.lifecycleOperation,
      entry: request && request.entry,
    };
  },
  /**
   * Resolves a configured order delegate and stores its evidence.
   *
   * @param {string} delegateKey Delegate configuration key.
   * @param {string} evidenceKey Response evidence key.
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @returns {Promise<void>} Resolves after delegate evidence is stored.
   */
  delegate: async function (delegateKey, evidenceKey, request, response) {
    this.envelope(request, response).evidence[evidenceKey] =
      await commerceCalculationDelegateUtils.resolveDelegate(
        "order",
        delegateKey,
        request,
        this.input(request),
      );
  },
  /**
   * Sends an error to the Pipeline executor or throws when no executor is present.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @param {Error} error Failure to propagate.
   * @returns {void}
   */
  fail: function (request, response, process, error) {
    if (process && typeof process.error === "function")
      return process.error(request, response, error);
    throw error;
  },
  /**
   * Resolves order-entry context for lifecycle-aware reconciliation.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after context evidence is attached.
   */
  resolveOrderEntryContext: async function (request, response, process) {
    try {
      await this.delegate(
        "orderEntryContext",
        "orderEntryContext",
        request,
        response,
      );
      this.next(request, response, process, "resolveOrderEntryContext");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Reconciles preserved or recalculated entry price evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after price evidence is attached.
   */
  reconcileEntryPriceEvidence: async function (request, response, process) {
    try {
      await this.delegate("priceEvidence", "priceEvidence", request, response);
      this.next(request, response, process, "reconcileEntryPriceEvidence");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Reconciles entry-level promotion evidence for the order lifecycle event.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after promotion evidence is attached.
   */
  reconcileEntryPromotions: async function (request, response, process) {
    try {
      await this.delegate(
        "promotionEvidence",
        "promotionEvidence",
        request,
        response,
      );
      this.next(request, response, process, "reconcileEntryPromotions");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Reconciles entry-level tax evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after tax evidence is attached.
   */
  reconcileEntryTax: async function (request, response, process) {
    try {
      await this.delegate("taxEvidence", "taxEvidence", request, response);
      this.next(request, response, process, "reconcileEntryTax");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Reconciles inventory evidence for fulfillment and amendment decisions.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after inventory evidence is attached.
   */
  reconcileInventoryEvidence: async function (request, response, process) {
    try {
      await this.delegate(
        "inventoryEvidence",
        "inventoryEvidence",
        request,
        response,
      );
      this.next(request, response, process, "reconcileInventoryEvidence");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Prepares final order-entry totals from reconciled evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  prepareOrderEntryTotals: function (request, response, process) {
    this.next(request, response, process, "prepareOrderEntryTotals");
  },
  /**
   * Resolves the order-entry calculation pipeline with the success envelope.
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
   * Rejects the order-entry calculation pipeline with the captured error.
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
