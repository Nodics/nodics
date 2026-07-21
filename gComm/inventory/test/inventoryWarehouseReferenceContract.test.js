/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates secured routing and safe, bounded, enterprise-scoped Warehouse reference resolution. */
const assert = require('assert');
const route = require('../src/router/routers').inventory.warehouseReference.resolve;
const properties = require('../config/properties').inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? properties : undefined };
global.SERVICE = {};
const scope = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const reference = require('../src/service/reference/defaultInventoryWarehouseReferenceService');
SERVICE.DefaultInventoryEnterpriseScopeService = scope;

assert.strictEqual(route.secured, true);
assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(route.apiExposure, 'moduleInternal');
assert.strictEqual(route.method, 'POST');
assert.strictEqual(route.key, '/references/warehouses/resolve');

const serviceAuth = { tokenType: 'service', enterprise: { code: 'enterpriseA' }, entCode: 'enterpriseA' };
SERVICE.DefaultWarehouseService = { get: async input => ({ result: input.query.warehouseCode === 'central' ? [{
    code: 'private-code', enterpriseCode: 'enterpriseA', warehouseCode: 'central', status: 'ACTIVE', type: 'PHYSICAL',
    countryCode: 'AE', capabilities: ['FULFILLMENT'], externalReferences: { secret: 'not-returned' }
}] : [] }) };

(async () => {
    let resolved = await reference.resolve({ tenant: 'tenantA', authData: serviceAuth, body: { warehouseCode: 'central' } });
    assert.strictEqual(resolved.code, 'SUC_INV_00001');
    assert.deepStrictEqual(Object.keys(resolved.data).sort(),
        ['capabilities', 'countryCode', 'enterpriseCode', 'status', 'type', 'warehouseCode'].sort());
    assert.strictEqual(resolved.data.externalReferences, undefined);
    await assert.rejects(reference.resolve({ tenant: 'tenantA', authData: serviceAuth, body: { warehouseCode: 'missing' } }),
        error => error.code === 'ERR_INV_00009');
    await assert.rejects(reference.resolve({ tenant: 'tenantA', authData: { tokenType: 'access', entCode: 'enterpriseA' },
        body: { warehouseCode: 'central' } }), error => error.code === 'ERR_INV_00010');
    await assert.rejects(reference.resolve({ tenant: 'tenantA', authData: { tokenType: 'service' },
        body: { warehouseCode: 'central' } }), error => error.code === 'ERR_INV_00001');
    console.log('Inventory Warehouse reference contract validated');
})().catch(error => { console.error(error); process.exit(1); });
