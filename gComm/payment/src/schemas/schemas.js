/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module payment/src/schemas/schemas @description Payment provider and transaction evidence schemas. @layer schema @owner payment */
const governed = function (definition, indexes) {
    return {
        super: 'base',
        model: true,
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        search: { enabled: false },
        event: { enabled: false },
        definition: definition,
        indexes: indexes || {},
    };
};

const common = function () {
    return {
        enterpriseCode: {
            type: 'string',
            required: true,
            description: 'Authenticated enterprise owner of the payment record',
            searchOptions: { enabled: true },
        },
        status: {
            type: 'string',
            required: true,
            default: 'ACTIVE',
            description: 'Governed lifecycle status',
            searchOptions: { enabled: true },
        },
    };
};

module.exports = {
    payment: {
        paymentProvider: governed(Object.assign(common(), {
            providerCode: { type: 'string', required: true, description: 'Safe provider identity. Never store secrets here.', searchOptions: { enabled: true } },
            providerType: { type: 'string', required: true, description: 'Provider type such as CARD_GATEWAY, WALLET, MANUAL, DEFERRED, or PROJECT_PROVIDER', searchOptions: { enabled: true } },
            displayName: { type: 'string', required: true },
            paymentModes: { type: 'array', required: true, description: 'Payment modes supported by this provider' },
            operations: { type: 'array', required: true, description: 'Operations supported by this provider such as AUTHORIZE, CAPTURE, REFUND, VOID, or DEFER' },
            connectorCode: { type: 'string', required: false, description: 'Safe configured connector identity. Credentials remain in secret stores.' },
            configRef: { type: 'string', required: false, description: 'Safe configuration reference, not raw credentials' },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                providerCode: { enabled: true, name: 'providerCode' },
            },
            individual: {
                providerCode: { enabled: true, name: 'providerCode', options: { unique: true } },
                providerType: { enabled: true, name: 'providerType' },
                status: { enabled: true, name: 'status' },
            },
        }),
        paymentTransaction: governed(Object.assign(common(), {
            transactionCode: { type: 'string', required: true, description: 'Stable payment transaction identity', searchOptions: { enabled: true } },
            idempotencyKey: { type: 'string', required: true, description: 'Idempotency key preventing duplicate payment actions', searchOptions: { enabled: true } },
            providerCode: { type: 'string', required: true, description: 'Payment provider selected for this transaction', searchOptions: { enabled: true } },
            paymentModeCode: { type: 'string', required: true, description: 'Payment mode such as CARD, COD, WALLET, ADVANCE, or OFFLINE', searchOptions: { enabled: true } },
            paymentGroupCode: { type: 'string', required: true, description: 'Checkout/order payment group this transaction belongs to', searchOptions: { enabled: true } },
            cartCode: { type: 'string', required: false, description: 'Source cart code when available', searchOptions: { enabled: true } },
            orderCode: { type: 'string', required: false, description: 'Order code when the transaction is attached to an order', searchOptions: { enabled: true } },
            operation: { type: 'string', required: true, description: 'Payment operation such as AUTHORIZE, CAPTURE, REFUND, VOID, or DEFER', searchOptions: { enabled: true } },
            amount: { type: 'string', required: true, description: 'Exact non-negative decimal-string amount' },
            currencyCode: { type: 'string', required: true, description: 'Currency code for this payment transaction', searchOptions: { enabled: true } },
            providerTransactionRef: { type: 'string', required: false, description: 'Safe provider transaction reference, not raw provider payload' },
            paymentEvidenceCode: { type: 'string', required: false, description: 'Optional stable evidence code exposed to Cart/Order' },
            recoveryAction: { type: 'string', required: false, description: 'Payment-owned recovery action such as RETRY_REFUND or RECONCILE_PROVIDER_REFUND', searchOptions: { enabled: true } },
            recoveryStatus: { type: 'string', required: false, description: 'Payment-owned recovery lifecycle state such as RETRYING or RECOVERED', searchOptions: { enabled: true } },
            retryCount: { type: 'number', required: false, description: 'Bounded number of Payment-owned retry attempts for recoverable provider operations' },
            failureCode: { type: 'string', required: false, description: 'Safe failure code' },
            failureMessage: { type: 'string', required: false, description: 'Safe failure message. Do not store secrets, credentials, PAN, CVV, or raw gateway payloads.' },
            requestedAt: { type: 'date', required: false },
            completedAt: { type: 'date', required: false },
        }), {
            common: {
                enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                orderCode: { enabled: true, name: 'orderCode' },
                paymentGroupCode: { enabled: true, name: 'paymentGroupCode' },
            },
            individual: {
                transactionCode: { enabled: true, name: 'transactionCode', options: { unique: true } },
                idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } },
                providerCode: { enabled: true, name: 'providerCode' },
                operation: { enabled: true, name: 'operation' },
                status: { enabled: true, name: 'status' },
                recoveryAction: { enabled: true, name: 'recoveryAction' },
                recoveryStatus: { enabled: true, name: 'recoveryStatus' },
            },
        }),
    },
};
