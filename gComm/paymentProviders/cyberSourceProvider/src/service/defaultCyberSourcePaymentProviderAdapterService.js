/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cyberSourceProvider/service/DefaultCyberSourcePaymentProviderAdapterService @description Mocked CyberSource payment adapter returning safe Payment evidence. @layer service @owner cyberSourceProvider */
const evidence = require("../../../src/service/adapter/defaultPaymentProviderSafeEvidenceService");

module.exports = {
    providerCode: "cyberSourceProvider",
    providerFamily: "CYBERSOURCE",
    operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
    publicContractReference: "CyberSource Payments API",
    authorize: async function (request) {
        return evidence.build(this, request, { operation: "AUTHORIZE", providerOperation: "payments.authorize", providerStatus: "AUTHORIZED" });
    },
    capture: async function (request) {
        return evidence.build(this, request, { operation: "CAPTURE", providerOperation: "payments.capture", providerStatus: "CAPTURED" });
    },
    void: async function (request) {
        return evidence.build(this, request, { operation: "VOID", providerOperation: "payments.authorizationReversal", providerStatus: "REVERSED" });
    },
    refund: async function (request) {
        return evidence.build(this, request, { operation: "REFUND", providerOperation: "refunds.create", providerStatus: "REFUNDED" });
    },
    reconcile: async function (request) {
        return evidence.build(this, request, { operation: "RECONCILE", providerOperation: "transactionDetails.search", providerStatus: "matched", reconciliationCode: "CYBERSOURCE_TRANSACTION_MATCHED" });
    },
};
