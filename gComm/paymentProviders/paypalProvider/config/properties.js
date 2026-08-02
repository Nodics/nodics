/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module paypalProvider/config/properties @description Contributes PayPal provider metadata without making PayPal the default provider. @layer configuration @owner paypalProvider */
module.exports = {
    payment: {
        paymentPolicy: {
            providers: {
                paypalProvider: {
                    providerCode: "paypalProvider",
                    providerType: "WALLET",
                    displayName: "PayPal provider",
                    methodCodes: ["WALLET", "CARD", "ADVANCE"],
                    operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
                    adapterService: "DefaultPaypalPaymentProviderAdapterService",
                    policyService: "DefaultPaymentProviderPolicyService",
                    connectorCode: "paypal",
                    configRef: "paymentProviders.paypalProvider",
                    status: "ACTIVE",
                },
            },
        },
    },
    paymentProviders: {
        paypalProvider: {
            mode: "MOCK_CONTRACT",
            secretReference: "secret://payment/paypal/client-secret",
            publicContractReference: "PayPal REST Payments API",
        },
    },
};
