/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/data/init/data/defaultPaymentProviderData
 * @description Safe default Payment Provider records visible in Axis Payment Operations.
 * @layer data
 * @owner payment
 * @override Customer modules may provide later data contributions for enterprise-specific provider setup.
 */
module.exports = {
    defaultCardProvider: {
        code: 'defaultCardProvider',
        enterpriseCode: 'default',
        providerCode: 'defaultCardProvider',
        providerType: 'CARD_GATEWAY',
        displayName: 'Default card provider',
        methodCodes: ['CARD', 'ADVANCE'],
        paymentModes: ['CARD', 'ADVANCE'],
        operations: ['AUTHORIZE', 'CAPTURE', 'REFUND', 'VOID', 'RECONCILE'],
        adapterService: 'DefaultCardPaymentProviderAdapterService',
        policyService: 'DefaultPaymentProviderPolicyService',
        connectorCode: 'local-card',
        configRef: 'payment.paymentPolicy.providers.defaultCardProvider',
        configurationSource: 'MODULE_DEFAULT_SEED',
        businessEditable: true,
        status: 'ACTIVE',
        active: true,
    },
    defaultWalletProvider: {
        code: 'defaultWalletProvider',
        enterpriseCode: 'default',
        providerCode: 'defaultWalletProvider',
        providerType: 'WALLET',
        displayName: 'Default wallet provider',
        methodCodes: ['WALLET'],
        paymentModes: ['WALLET'],
        operations: ['AUTHORIZE', 'CAPTURE', 'REFUND', 'VOID', 'RECONCILE'],
        adapterService: 'DefaultCardPaymentProviderAdapterService',
        policyService: 'DefaultPaymentProviderPolicyService',
        connectorCode: 'local-wallet',
        configRef: 'payment.paymentPolicy.providers.defaultWalletProvider',
        configurationSource: 'MODULE_DEFAULT_SEED',
        businessEditable: true,
        status: 'ACTIVE',
        active: true,
    },
    defaultAdvanceProvider: {
        code: 'defaultAdvanceProvider',
        enterpriseCode: 'default',
        providerCode: 'defaultAdvanceProvider',
        providerType: 'CARD_GATEWAY',
        displayName: 'Default advance payment provider',
        methodCodes: ['ADVANCE'],
        paymentModes: ['ADVANCE'],
        operations: ['AUTHORIZE', 'CAPTURE', 'REFUND', 'VOID', 'RECONCILE'],
        adapterService: 'DefaultCardPaymentProviderAdapterService',
        policyService: 'DefaultPaymentProviderPolicyService',
        connectorCode: 'local-advance',
        configRef: 'payment.paymentPolicy.providers.defaultAdvanceProvider',
        configurationSource: 'MODULE_DEFAULT_SEED',
        businessEditable: true,
        status: 'ACTIVE',
        active: true,
    },
    deferredPaymentProvider: {
        code: 'deferredPaymentProvider',
        enterpriseCode: 'default',
        providerCode: 'deferredPaymentProvider',
        providerType: 'DEFERRED',
        displayName: 'Deferred payment provider',
        methodCodes: ['COD', 'BANK_TRANSFER'],
        paymentModes: ['COD', 'BANK_TRANSFER'],
        operations: ['DEFER', 'REFUND', 'VOID', 'RECONCILE'],
        adapterService: 'DefaultDeferredPaymentProviderAdapterService',
        policyService: 'DefaultPaymentProviderPolicyService',
        connectorCode: 'local-deferred',
        configRef: 'payment.paymentPolicy.providers.deferredPaymentProvider',
        configurationSource: 'MODULE_DEFAULT_SEED',
        businessEditable: true,
        status: 'ACTIVE',
        active: true,
    },
    manualPaymentProvider: {
        code: 'manualPaymentProvider',
        enterpriseCode: 'default',
        providerCode: 'manualPaymentProvider',
        providerType: 'MANUAL',
        displayName: 'Manual payment provider',
        methodCodes: ['ACCOUNT_CREDIT', 'OFFLINE', 'ADVANCE'],
        paymentModes: ['ACCOUNT_CREDIT', 'OFFLINE', 'ADVANCE'],
        operations: ['AUTHORIZE', 'CAPTURE', 'REFUND', 'VOID', 'RECONCILE'],
        adapterService: 'DefaultManualPaymentProviderAdapterService',
        policyService: 'DefaultPaymentProviderPolicyService',
        connectorCode: 'local-manual',
        configRef: 'payment.paymentPolicy.providers.manualPaymentProvider',
        configurationSource: 'MODULE_DEFAULT_SEED',
        businessEditable: true,
        status: 'ACTIVE',
        active: true,
    },
};
