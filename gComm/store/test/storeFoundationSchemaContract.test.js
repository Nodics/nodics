/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates Store schema ownership, private generated boundaries, indexes, and persistence interceptors. */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').store;
const interceptors = require('../src/interceptors/interceptors');

assert.strictEqual(schemas.store.super, 'base');
assert.strictEqual(schemas.store.router.enabled, false);
assert.strictEqual(schemas.store.event.enabled, false);
['enterpriseCode', 'storeCode', 'name', 'type', 'status', 'countryCode', 'timezone', 'addressRef', 'channels', 'capabilities']
    .forEach(property => assert(schemas.store.definition[property], 'store.' + property + ' must exist'));
assert.strictEqual(schemas.store.indexes.individual.storeCode.options.unique, true);

assert.strictEqual(schemas.storeWarehouseAssignment.super, 'base');
assert.strictEqual(schemas.storeWarehouseAssignment.router.enabled, false);
['enterpriseCode', 'storeCode', 'warehouseCode', 'status', 'purposes', 'priority', 'effectiveFrom', 'effectiveTo']
    .forEach(property => assert(schemas.storeWarehouseAssignment.definition[property], 'assignment.' + property + ' must exist'));
assert.strictEqual(schemas.storeWarehouseAssignment.indexes.individual.warehouseCode.options.unique, true);

['storePreSave', 'storePreGet', 'storePreUpdate', 'storePreRemove', 'storeWarehouseAssignmentPreSave',
    'storeWarehouseAssignmentPreGet', 'storeWarehouseAssignmentPreUpdate', 'storeWarehouseAssignmentPreRemove']
    .forEach(code => assert(interceptors[code], code + ' interceptor must exist'));

console.log('Store foundation schema contract validated');
