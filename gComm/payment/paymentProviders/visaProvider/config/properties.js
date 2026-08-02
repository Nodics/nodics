/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module visaProvider/config/properties @description Contributes Visa provider metadata without making Visa the default provider. @layer configuration @owner visaProvider */
module.exports = {
    payment: {
        paymentPolicy: {
            providers: {
                visaProvider: {
                    providerCode: "visaProvider",
                    providerType: "CARD_NETWORK",
                    displayName: "Visa provider",
                    methodCodes: ["CARD", "ADVANCE"],
                    operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
                    adapterService: "DefaultVisaPaymentProviderAdapterService",
                    policyService: "DefaultPaymentProviderPolicyService",
                    connectorCode: "visa",
                    configRef: "paymentProviders.visaProvider",
                    status: "ACTIVE",
                },
            },
        },
    },
    paymentProviders: {
        visaProvider: {
            mode: "MOCK_CONTRACT",
            secretReference: "secret://payment/visa/credential",
            publicContractReference: "Visa Developer product APIs",
            productSpecific: true,
        },
    },
};
