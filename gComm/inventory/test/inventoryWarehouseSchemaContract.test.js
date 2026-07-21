/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates warehouse/location schema ownership, indexes, private API posture, interceptor governance, and configuration extension points. */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').inventory;
const interceptors = require('../src/interceptors/interceptors');
const properties = require('../config/properties').inventory;

assert.strictEqual(schemas.warehouse.super, 'base');
assert.strictEqual(schemas.warehouse.model, true);
assert.strictEqual(schemas.warehouse.router.enabled, false, 'foundation CRUD must remain private until intent APIs and permissions exist');
assert.strictEqual(schemas.warehouse.definition.enterpriseCode.required, true);
assert.strictEqual(schemas.warehouse.definition.warehouseCode.required, true);
assert.strictEqual(schemas.warehouse.indexes.common.enterpriseCode.name, 'enterpriseCode');
assert.strictEqual(schemas.warehouse.indexes.individual.warehouseCode.options.unique, true);

assert.strictEqual(schemas.warehouseLocation.super, 'base');
assert.strictEqual(schemas.warehouseLocation.router.enabled, false);
assert.strictEqual(schemas.warehouseLocation.definition.parentLocationCode.required, false);
assert.strictEqual(schemas.warehouseLocation.definition.path.required, true);
assert.strictEqual(schemas.warehouseLocation.indexes.common.warehouseCode.name, 'warehouseCode');
assert.strictEqual(schemas.warehouseLocation.indexes.individual.locationCode.options.unique, true);

['warehousePreSave', 'warehousePreGet', 'warehousePreUpdate', 'warehousePreRemove',
    'warehouseLocationPreSave', 'warehouseLocationPreGet', 'warehouseLocationPreUpdate',
    'warehouseLocationPreRemove'].forEach(name => assert(interceptors[name], 'missing inventory interceptor ' + name));
assert.strictEqual(interceptors.warehousePreGet.handler, 'DefaultInventoryEnterpriseScopeService.scopeQuery');
assert(properties.warehouse.types.includes('STORE'));
assert(properties.location.types.includes('BIN'));
assert.strictEqual(properties.location.maxDepth, 12);

console.log('Inventory warehouse and location schema contract validated');
