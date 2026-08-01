/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/test/orderEntryFoundationContract
 * @description Protects the order line-entry schema foundation, immutable evidence fields, parent-code relationship, and later-layer extension boundary.
 * @layer test
 * @owner order
 * @override Project modules may extend orderEntry with customer evidence fields or stricter policies while preserving order-owned parent identity and exact persisted values.
 */
const assert = require('assert');
const properties = require('../config/properties');

global.ENUMS = {
    ReasonType: {
        ORDERSTATUS: { key: 'ORDERSTATUS' },
        PAYMENT: { key: 'PAYMENT' },
        SHIPMENT: { key: 'SHIPMENT' },
    },
};

const cartSchemas = require('../../cart/src/schemas/schemas');
const policy = require('../../cart/src/utils/checkoutEntryPolicy');
const orderSchemas = require('../src/schemas/schemas');
const orderEntryPolicyService = require('../src/service/entry/defaultOrderEntryPolicyService');
const order = orderSchemas.order.order;
const orderEntry = orderSchemas.order.orderEntry;
const abstractEntry = cartSchemas.default.abstractCartEntry;

assert.strictEqual(properties.checkoutEntry, undefined);
assert(properties.order.checkoutEntry.policy.immutableFields.includes('orderCode'));
assert(properties.order.checkoutEntry.policy.immutableFields.includes('totalPrice'));

assert.strictEqual(orderEntry.super, 'abstractCartEntry');
assert.strictEqual(abstractEntry.model, false);
assert.strictEqual(orderEntry.model, true);
assert.strictEqual(orderEntry.service.enabled, true);
assert.strictEqual(
    orderEntry.router.enabled,
    false,
    'Order entries must be exposed through Workbench and owner services, not a casual public generated router',
);
assert.strictEqual(orderEntry.definition.orderCode.required, true);
assert.strictEqual(orderEntry.definition.cartCode.required, false);
assert.strictEqual(orderEntry.definition.allocationCode.required, false);
assert.strictEqual(orderEntry.definition.reservationCode.required, false);
assert.strictEqual(orderEntry.refSchema.orderCode.type, 'one');
assert.strictEqual(orderEntry.refSchema.orderCode.schemaName, 'order');
assert.strictEqual(orderEntry.refSchema.orderCode.onTargetDelete, 'RESTRICT');
assert.strictEqual(
    order.definition.entries,
    undefined,
    'Order parent must not carry a mutable entries array; entries reference orderCode instead',
);
['quantity', 'unitPrice', 'totalPrice', 'taxTotal', 'discountTotal'].forEach((field) => {
    assert.strictEqual(
        abstractEntry.definition[field].type,
        'string',
        field + ' must preserve exact decimal-string evidence',
    );
});
assert.strictEqual(orderEntry.indexes.common.orderCode.enabled, true);
assert.strictEqual(orderEntry.indexes.individual.entryCode.options.unique, true);

const projectExtension = Object.assign({}, orderEntry.definition, {
    fulfillmentNote: {
        type: 'string',
        required: false,
        description: 'Project-owned order-entry evidence',
    },
});
assert(projectExtension.fulfillmentNote);
assert.strictEqual(
    orderEntry.definition.fulfillmentNote,
    undefined,
    'Customer extensions must be layered, not copied into OOTB orderEntry source',
);

const cartEntryPayload = {
    entCode: 'default',
    cartCode: 'cart-1',
    entryCode: 'entry-1',
    lineNumber: 1,
    catalogCode: 'defaultProductCatalog',
    itemType: 'PRODUCT',
    itemCode: 'sku-1',
    quantity: '2',
    unitCode: 'piece',
    currencyCode: 'USD',
    unitPrice: '10.00',
    totalPrice: '20.00',
    taxTotal: '0',
    discountTotal: '0',
    priceEvidenceCode: 'price-1',
    status: 'ACTIVE',
};
const convertedEntry = policy.buildOrderEntryFromCartEntry(cartEntryPayload, { orderCode: 'order-1' }, {});
assert.strictEqual(convertedEntry.orderCode, 'order-1');
assert.strictEqual(convertedEntry.cartCode, 'cart-1');
assert.strictEqual(convertedEntry.status, 'ORDERED');
assert.strictEqual(convertedEntry.totalPrice, '20.00');
assert.strictEqual(
    policy.validateEntry(convertedEntry, { statuses: ['ORDERED'] }, { parentField: 'orderCode' }).valid,
    true,
);
assert.deepStrictEqual(
    policy.validateUpdate(convertedEntry, { totalPrice: '19.99' }, {
        immutableFields: ['totalPrice'],
        statuses: ['ORDERED', 'ALLOCATED'],
        allowedTransitions: { ORDERED: ['ALLOCATED'] },
    }),
    ['totalPrice is immutable'],
    'Order Entry evidence must remain immutable after cart conversion',
);

global.CONFIG = {
    get: (key) => key === 'order' ? properties.order : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) {
            super(String(message));
            this.code = code;
            this.cause = cause;
        }
    },
};
const serviceConvertedEntry = orderEntryPolicyService.buildFromCartEntry(cartEntryPayload, { orderCode: 'order-2' });
assert.strictEqual(serviceConvertedEntry.orderCode, 'order-2');
assert.strictEqual(serviceConvertedEntry.status, 'ORDERED');
assert.throws(
    () => orderEntryPolicyService.validateUpdate(serviceConvertedEntry, { totalPrice: '10.00' }),
    /totalPrice is immutable/,
);

console.log('Order entry foundation contract validated');
