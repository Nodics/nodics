/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module stripeProvider/config/properties @description Contributes Stripe provider metadata without making Stripe the default provider. @layer configuration @owner stripeProvider */
module.exports = {
    payment: {
        paymentPolicy: {
            providers: {
                stripeProvider: {
                    providerCode: "stripeProvider",
                    providerType: "CARD_GATEWAY",
                    displayName: "Stripe provider",
                    methodCodes: ["CARD", "ADVANCE", "WALLET"],
                    operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
                    adapterService: "DefaultStripePaymentProviderAdapterService",
                    policyService: "DefaultPaymentProviderPolicyService",
                    connectorCode: "stripe",
                    configRef: "paymentProviders.stripeProvider",
                    status: "ACTIVE",
                },
            },
        },
    },
    paymentProviders: {
        stripeProvider: {
            mode: "MOCK_CONTRACT",
            secretReference: "secret://payment/stripe/api-key",
            publicContractReference: "Stripe PaymentIntents API",
        },
    },
};
