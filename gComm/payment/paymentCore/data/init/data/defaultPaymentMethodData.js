/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/data/init/data/defaultPaymentMethodData
 * @description Governed default Payment Method records visible in Axis Payment Operations.
 * @layer data
 * @owner payment
 * @override Customer modules may provide later data contributions for enterprise-specific method availability.
 */
module.exports = {
    card: {
        code: 'defaultPaymentMethodCard',
        enterpriseCode: 'default',
        methodCode: 'CARD',
        displayName: 'Card payment',
        defaultOperation: 'AUTHORIZE',
        providerRequired: true,
        gatewayRequired: true,
        defaultProviderCode: 'defaultCardProvider',
        allowedProviderTypes: ['CARD_GATEWAY'],
        status: 'ACTIVE',
        active: true,
    },
    wallet: {
        code: 'defaultPaymentMethodWallet',
        enterpriseCode: 'default',
        methodCode: 'WALLET',
        displayName: 'Wallet payment',
        defaultOperation: 'AUTHORIZE',
        providerRequired: true,
        gatewayRequired: true,
        defaultProviderCode: 'defaultWalletProvider',
        allowedProviderTypes: ['WALLET'],
        status: 'ACTIVE',
        active: true,
    },
    advance: {
        code: 'defaultPaymentMethodAdvance',
        enterpriseCode: 'default',
        methodCode: 'ADVANCE',
        displayName: 'Advance payment',
        defaultOperation: 'AUTHORIZE',
        providerRequired: true,
        gatewayRequired: true,
        defaultProviderCode: 'defaultAdvanceProvider',
        allowedProviderTypes: ['CARD_GATEWAY', 'WALLET', 'MANUAL'],
        status: 'ACTIVE',
        active: true,
    },
    cod: {
        code: 'defaultPaymentMethodCod',
        enterpriseCode: 'default',
        methodCode: 'COD',
        displayName: 'Cash on delivery',
        defaultOperation: 'DEFER',
        providerRequired: true,
        gatewayRequired: false,
        defaultProviderCode: 'deferredPaymentProvider',
        allowedProviderTypes: ['DEFERRED'],
        status: 'ACTIVE',
        active: true,
    },
    bankTransfer: {
        code: 'defaultPaymentMethodBankTransfer',
        enterpriseCode: 'default',
        methodCode: 'BANK_TRANSFER',
        displayName: 'Bank transfer',
        defaultOperation: 'DEFER',
        providerRequired: true,
        gatewayRequired: false,
        defaultProviderCode: 'deferredPaymentProvider',
        allowedProviderTypes: ['DEFERRED', 'MANUAL'],
        status: 'ACTIVE',
        active: true,
    },
    accountCredit: {
        code: 'defaultPaymentMethodAccountCredit',
        enterpriseCode: 'default',
        methodCode: 'ACCOUNT_CREDIT',
        displayName: 'Account credit',
        defaultOperation: 'AUTHORIZE',
        providerRequired: true,
        gatewayRequired: false,
        defaultProviderCode: 'manualPaymentProvider',
        allowedProviderTypes: ['MANUAL'],
        status: 'ACTIVE',
        active: true,
    },
    offline: {
        code: 'defaultPaymentMethodOffline',
        enterpriseCode: 'default',
        methodCode: 'OFFLINE',
        displayName: 'Offline payment',
        defaultOperation: 'AUTHORIZE',
        providerRequired: true,
        gatewayRequired: false,
        defaultProviderCode: 'manualPaymentProvider',
        allowedProviderTypes: ['MANUAL'],
        status: 'ACTIVE',
        active: true,
    },
};
