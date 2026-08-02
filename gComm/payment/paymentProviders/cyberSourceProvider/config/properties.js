/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cyberSourceProvider/config/properties @description Contributes CyberSource provider metadata without making CyberSource the default provider. @layer configuration @owner cyberSourceProvider */
module.exports = {
    payment: {
        paymentPolicy: {
            providers: {
                cyberSourceProvider: {
                    providerCode: "cyberSourceProvider",
                    providerType: "CARD_GATEWAY",
                    displayName: "CyberSource provider",
                    methodCodes: ["CARD", "ADVANCE"],
                    operations: ["AUTHORIZE", "CAPTURE", "REFUND", "VOID", "RECONCILE"],
                    adapterService: "DefaultCyberSourcePaymentProviderAdapterService",
                    policyService: "DefaultPaymentProviderPolicyService",
                    connectorCode: "cybersource",
                    configRef: "paymentProviders.cyberSourceProvider",
                    status: "ACTIVE",
                },
            },
        },
    },
    paymentProviders: {
        cyberSourceProvider: {
            mode: "MOCK_CONTRACT",
            secretReference: "secret://payment/cybersource/key",
            publicContractReference: "CyberSource Payments API",
        },
    },
};
