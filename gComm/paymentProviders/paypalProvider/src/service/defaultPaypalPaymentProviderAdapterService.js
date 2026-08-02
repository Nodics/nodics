/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module paypalProvider/service/DefaultPaypalPaymentProviderAdapterService @description Mocked PayPal REST-style adapter returning safe Payment evidence. @layer service @owner paypalProvider */
const evidence = require("../../../src/service/adapter/defaultPaymentProviderSafeEvidenceService");

module.exports = {
    providerCode: "paypalProvider",
    providerFamily: "PAYPAL",
    operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
    publicContractReference: "PayPal REST Payments API",
    authorize: async function (request) {
        return evidence.build(this, request, { operation: "AUTHORIZE", providerOperation: "v2.checkout.orders.authorize", providerStatus: "AUTHORIZED" });
    },
    capture: async function (request) {
        return evidence.build(this, request, { operation: "CAPTURE", providerOperation: "v2.payments.authorizations.capture", providerStatus: "COMPLETED" });
    },
    void: async function (request) {
        return evidence.build(this, request, { operation: "VOID", providerOperation: "v2.payments.authorizations.void", providerStatus: "VOIDED" });
    },
    refund: async function (request) {
        return evidence.build(this, request, { operation: "REFUND", providerOperation: "v2.payments.captures.refund", providerStatus: "COMPLETED" });
    },
    reconcile: async function (request) {
        return evidence.build(this, request, { operation: "RECONCILE", providerOperation: "v2.payments.captures.get", providerStatus: "matched", reconciliationCode: "PAYPAL_CAPTURE_MATCHED" });
    },
};
