/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module paypalProvider/service/DefaultPaypalPaymentProviderAdapterService @description Mocked PayPal REST-style adapter returning safe Payment evidence. @layer service @owner paypalProvider */
const evidence = require("../../../paymentProviderCore/src/service/adapter/defaultPaymentProviderSafeEvidenceService");

module.exports = {
  providerCode: "paypalProvider",
  providerFamily: "PAYPAL",
  operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
  publicContractReference: "PayPal REST Payments API",
  /**
   * Executes the authorize contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  authorize: async function (request) {
    return evidence.build(this, request, {
      operation: "AUTHORIZE",
      providerOperation: "v2.checkout.orders.authorize",
      providerStatus: "AUTHORIZED",
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
      providerOperation: "v2.payments.authorizations.capture",
      providerStatus: "COMPLETED",
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
      providerOperation: "v2.payments.authorizations.void",
      providerStatus: "VOIDED",
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
      providerOperation: "v2.payments.captures.refund",
      providerStatus: "COMPLETED",
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
      providerOperation: "v2.payments.captures.get",
      providerStatus: "matched",
      reconciliationCode: "PAYPAL_CAPTURE_MATCHED",
    });
  },
};
