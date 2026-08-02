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
      orderCode: request && request.orderCode,
      lifecycleOperation: request && request.lifecycleOperation,
      entry: request && request.entry,
    };
  },
  delegate: async function (delegateKey, evidenceKey, request, response) {
    this.envelope(request, response).evidence[evidenceKey] =
      await commerceCalculationDelegateUtils.resolveDelegate(
        "order",
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
  reconcileEntryPriceEvidence: async function (request, response, process) {
    try {
      await this.delegate("priceEvidence", "priceEvidence", request, response);
      this.next(request, response, process, "reconcileEntryPriceEvidence");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
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
  reconcileEntryTax: async function (request, response, process) {
    try {
      await this.delegate("taxEvidence", "taxEvidence", request, response);
      this.next(request, response, process, "reconcileEntryTax");
    } catch (error) {
      this.fail(request, response, process, error);
    }
  },
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
  prepareOrderEntryTotals: function (request, response, process) {
    this.next(request, response, process, "prepareOrderEntryTotals");
  },
  handleSucessEnd: function (request, response, process) {
    process.resolve(response.success);
  },
  handleErrorEnd: function (request, response, process) {
    process.reject(response.error);
  },
};
