/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module stripeProvider/service/DefaultStripePaymentProviderAdapterService
 * @description Mocked Stripe PaymentIntent-style adapter returning safe Payment evidence.
 * @layer service
 * @owner stripeProvider
 * @override Customer modules may replace transport while preserving Payment-owned normalized evidence.
 */
const evidence = require("../../../src/service/adapter/defaultPaymentProviderSafeEvidenceService");

module.exports = {
  providerCode: "stripeProvider",
  providerFamily: "STRIPE",
  operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
  publicContractReference: "Stripe PaymentIntents API",
  /**
   * Executes the authorize contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  authorize: async function (request) {
    return evidence.build(this, request, {
      operation: "AUTHORIZE",
      providerOperation: "payment_intents.create",
      providerStatus: "requires_capture",
    });
  },
  /**
   * Executes the capture contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  capture: async function (request) {
    return evidence.build(this, request, {
      operation: "CAPTURE",
      providerOperation: "payment_intents.capture",
      providerStatus: "succeeded",
    });
  },
  /**
   * Executes the void contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  void: async function (request) {
    return evidence.build(this, request, {
      operation: "VOID",
      providerOperation: "payment_intents.cancel",
      providerStatus: "canceled",
    });
  },
  /**
   * Executes the refund contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  refund: async function (request) {
    return evidence.build(this, request, {
      operation: "REFUND",
      providerOperation: "refunds.create",
      providerStatus: "succeeded",
    });
  },
  /**
   * Executes the reconcile contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  reconcile: async function (request) {
    return evidence.build(this, request, {
      operation: "RECONCILE",
      providerOperation: "payment_intents.retrieve",
      providerStatus: "matched",
      reconciliationCode: "STRIPE_PAYMENT_INTENT_MATCHED",
    });
  },
};
