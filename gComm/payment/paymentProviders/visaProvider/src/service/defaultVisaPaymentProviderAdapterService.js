/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module visaProvider/service/DefaultVisaPaymentProviderAdapterService @description Mocked Visa product/network adapter returning safe Payment evidence. @layer service @owner visaProvider */
const evidence = require("../../../paymentProviderCore/src/service/adapter/defaultPaymentProviderSafeEvidenceService");

module.exports = {
  providerCode: "visaProvider",
  providerFamily: "VISA",
  operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
  publicContractReference: "Visa Developer product APIs",
  /**
   * Executes the authorize contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  authorize: async function (request) {
    return evidence.build(this, request, {
      operation: "AUTHORIZE",
      providerOperation: "visa.product.authorize",
      providerStatus: "approved",
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
      providerOperation: "visa.product.capture",
      providerStatus: "settlement_pending",
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
      providerOperation: "visa.product.reverse",
      providerStatus: "reversed",
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
      providerOperation: "visa.product.credit",
      providerStatus: "credited",
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
      providerOperation: "visa.product.statusLookup",
      providerStatus: "matched",
      reconciliationCode: "VISA_PRODUCT_EVIDENCE_MATCHED",
    });
  },
};
