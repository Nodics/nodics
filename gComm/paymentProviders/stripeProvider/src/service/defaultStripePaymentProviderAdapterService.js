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
    authorize: async function (request) {
        return evidence.build(this, request, { operation: "AUTHORIZE", providerOperation: "payment_intents.create", providerStatus: "requires_capture" });
    },
    capture: async function (request) {
        return evidence.build(this, request, { operation: "CAPTURE", providerOperation: "payment_intents.capture", providerStatus: "succeeded" });
    },
    void: async function (request) {
        return evidence.build(this, request, { operation: "VOID", providerOperation: "payment_intents.cancel", providerStatus: "canceled" });
    },
    refund: async function (request) {
        return evidence.build(this, request, { operation: "REFUND", providerOperation: "refunds.create", providerStatus: "succeeded" });
    },
    reconcile: async function (request) {
        return evidence.build(this, request, { operation: "RECONCILE", providerOperation: "payment_intents.retrieve", providerStatus: "matched", reconciliationCode: "STRIPE_PAYMENT_INTENT_MATCHED" });
    },
};
