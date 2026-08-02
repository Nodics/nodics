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
const commerceCalculationDelegateUtils = require("../../../../checkout/src/utils/commerceCalculationDelegateUtils");

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
  input: function (request) {
    return {
      entryCode: request && request.entryCode,
      cartCode: request && request.cartCode,
      entry: request && request.entry,
    };
  },
  delegate: async function (delegateKey, evidenceKey, request, response) {
    this.envelope(request, response).evidence[evidenceKey] =
      await commerceCalculationDelegateUtils.resolveDelegate(
        "cart",
        delegateKey,
        request,
        this.input(request),
      );
  },
  fail: function (request, response, process, error) {
    if (process && typeof process.error === "function")
      return process.error(request, response, error);
    throw error;
  },
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
  resolveBasePrice: async function (request, response, process) {
    try {
      await this.delegate("basePrice", "basePrice", request, response);
      this.next(request, response, process, "resolveBasePrice");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
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
  calculateEntryTax: async function (request, response, process) {
    try {
      await this.delegate("entryTax", "entryTax", request, response);
      this.next(request, response, process, "calculateEntryTax");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
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
