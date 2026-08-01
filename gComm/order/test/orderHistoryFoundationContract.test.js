/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/test/orderHistoryFoundationContract
 * @description Protects the order-owned lifecycle history foundation, parent-code relationship, BackOffice navigation, and adjacent-authority boundary.
 * @layer test
 * @owner order
 * @override Project modules may extend orderHistoryEntry with additional evidence fields while preserving the parent order relationship and support timeline contract.
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

const schemas = require('../src/schemas/schemas');
const history = schemas.order.orderHistoryEntry;
const navigation = properties.backofficeCapabilities.order.navigation;
const byId = Object.fromEntries(navigation.map((item) => [item.id, item]));

assert.strictEqual(history.model, true);
assert.strictEqual(history.service.enabled, true);
assert.strictEqual(
    history.router.enabled,
    false,
    'Order History must be exposed through Workbench and owner services, not a casual generated public router',
);
assert.strictEqual(history.refSchema.orderCode.type, 'one');
assert.strictEqual(history.refSchema.orderCode.schemaName, 'order');
assert.strictEqual(history.refSchema.orderCode.onTargetDelete, 'RESTRICT');
[
    'entCode',
    'orderCode',
    'historyCode',
    'eventType',
    'statusFrom',
    'statusTo',
    'reasonCode',
    'actorType',
    'actorCode',
    'sourceModule',
    'sourceOperation',
    'evidenceCode',
    'message',
].forEach((field) => assert(history.definition[field], 'orderHistoryEntry.' + field + ' must exist'));
assert.strictEqual(history.definition.message.description.includes('Do not store secrets'), true);
assert.strictEqual(history.indexes.common.orderCode.enabled, true);
assert.strictEqual(history.indexes.individual.historyCode.options.unique, true);
assert.strictEqual(byId['order-history'].workbenchTarget.schemaName, 'orderHistoryEntry');
assert.strictEqual(byId.orders.detailPanels.some((panel) => panel.id === 'order-history'), true);

console.log('Order history foundation contract validated');
