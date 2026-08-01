/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/test/cartEntryFoundationContract
 * @description Protects the cart line-entry schema foundation, exact value storage, parent-code relationship, and later-layer extension boundary.
 * @layer test
 * @owner cart
 * @override Project modules may extend cartEntry with customer fields or stricter policies while preserving cart-owned parent identity and exact quantity/money fields.
 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas');

const abstractEntry = schemas.default.abstractCartEntry;
const cart = schemas.cart.cart;
const cartEntry = schemas.cart.cartEntry;

assert.strictEqual(abstractEntry.model, false);
assert.strictEqual(abstractEntry.service.enabled, false);
assert.strictEqual(abstractEntry.router.enabled, false);
assert.strictEqual(cartEntry.super, 'abstractCartEntry');
assert.strictEqual(cartEntry.model, true);
assert.strictEqual(cartEntry.service.enabled, true);
assert.strictEqual(
    cartEntry.router.enabled,
    false,
    'Cart entries must be exposed through Workbench and owner services, not a casual public generated router',
);

[
    'entryCode',
    'lineNumber',
    'catalogCode',
    'itemType',
    'itemCode',
    'quantity',
    'unitCode',
    'currencyCode',
    'unitPrice',
    'totalPrice',
    'taxTotal',
    'discountTotal',
    'priceEvidenceCode',
    'status',
].forEach((field) => {
    assert(abstractEntry.definition[field], 'abstractCartEntry.' + field + ' must exist');
});
assert.strictEqual(abstractEntry.definition.quantity.type, 'string');
assert.strictEqual(abstractEntry.definition.unitPrice.type, 'string');
assert.strictEqual(abstractEntry.definition.totalPrice.type, 'string');
assert.strictEqual(
    abstractEntry.definition.quantity.description.includes('never use floating point'),
    true,
);
assert.strictEqual(cartEntry.definition.cartCode.required, true);
assert.strictEqual(cartEntry.refSchema.cartCode.type, 'one');
assert.strictEqual(cartEntry.refSchema.cartCode.schemaName, 'cart');
assert.strictEqual(cartEntry.refSchema.cartCode.onTargetDelete, 'RESTRICT');
assert.strictEqual(
    cart.definition.entries,
    undefined,
    'Cart parent must not carry a mutable entries array; entries reference cartCode instead',
);
assert.strictEqual(cartEntry.indexes.common.cartCode.enabled, true);
assert.strictEqual(cartEntry.indexes.individual.entryCode.options.unique, true);

const projectExtension = Object.assign({}, cartEntry.definition, {
    giftWrapInstruction: {
        type: 'string',
        required: false,
        description: 'Project-owned cart-entry customization',
    },
});
assert(projectExtension.giftWrapInstruction);
assert.strictEqual(
    cartEntry.definition.giftWrapInstruction,
    undefined,
    'Customer extensions must be layered, not copied into OOTB cartEntry source',
);

console.log('Cart entry foundation contract validated');
