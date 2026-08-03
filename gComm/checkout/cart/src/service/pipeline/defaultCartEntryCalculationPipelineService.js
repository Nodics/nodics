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
const commerceCalculationDelegateUtils = require("../../../../checkoutCore/src/utils/commerceCalculationDelegateUtils");

module.exports = {
  /**
   * Initializes the cart-entry calculation node service.
   *
   * @returns {Promise<boolean>} Resolves when the service is ready.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Completes post-start initialization for cart-entry calculation nodes.
   *
   * @returns {Promise<boolean>} Resolves when post-initialization succeeds.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Ensures the cart-entry calculation response has a stable success envelope.
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
   * Records a completed entry-calculation node and advances the Pipeline executor.
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
   * Builds the governed delegate input for one cart entry.
   *
   * @param {Object} request Pipeline request context.
   * @returns {Object} Delegate input containing cart and entry identity.
   */
  input: function (request) {
    return {
      entryCode: request && request.entryCode,
      cartCode: request && request.cartCode,
      entry: request && request.entry,
    };
  },
  /**
   * Resolves a configured checkout delegate and stores its evidence.
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
        "cart",
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
   * Resolves product context for the cart entry.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after product evidence is attached.
   */
  resolveProductContext: async function (request, response, process) {
    try {
      await this.delegate(
        "productContext",
        "productContext",
        request,
        response,
      );
      this.next(request, response, process, "resolveProductContext");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Resolves the governed base price for the cart entry.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after price evidence is attached.
   */
  resolveBasePrice: async function (request, response, process) {
    try {
      await this.delegate("basePrice", "basePrice", request, response);
      this.next(request, response, process, "resolveBasePrice");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Evaluates entry-level promotions through the configured promotion authority.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after promotion evidence is attached.
   */
  evaluateEntryPromotions: async function (request, response, process) {
    try {
      await this.delegate(
        "entryPromotions",
        "entryPromotions",
        request,
        response,
      );
      this.next(request, response, process, "evaluateEntryPromotions");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Calculates entry-level tax evidence through the configured tax authority.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after tax evidence is attached.
   */
  calculateEntryTax: async function (request, response, process) {
    try {
      await this.delegate("entryTax", "entryTax", request, response);
      this.next(request, response, process, "calculateEntryTax");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Verifies the inventory promise for this cart entry.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {Promise<void>} Resolves after inventory evidence is attached.
   */
  verifyInventoryPromise: async function (request, response, process) {
    try {
      await this.delegate(
        "inventoryPromise",
        "inventoryPromise",
        request,
        response,
      );
      this.next(request, response, process, "verifyInventoryPromise");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
  /**
   * Prepares cart-entry totals from resolved price, promotion, tax, and inventory evidence.
   *
   * @param {Object} request Pipeline request context.
   * @param {Object} response Pipeline response context.
   * @param {Object} process Pipeline process controls.
   * @returns {void}
   */
  prepareEntryTotals: function (request, response, process) {
    this.next(request, response, process, "prepareEntryTotals");
  },
  /**
   * Resolves the cart-entry calculation pipeline with the success envelope.
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
   * Rejects the cart-entry calculation pipeline with the captured error.
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
