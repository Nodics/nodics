/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** Validates exact read-only ON_HAND Availability, sourcing order, membership expansion, conversion, evidence, bounds, and intent security. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
const route = require('../src/router/routers').inventory.stockAvailabilityIntent.evaluateOnHand;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService');
const availability = require('../src/service/availability/defaultStockAvailabilityService');
const intent = require('../src/service/availability/defaultStockAvailabilityIntentService');
SERVICE.DefaultStockAvailabilityService = availability;
const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
SERVICE.DefaultStockSourcingCacheService = { evaluate: async () => ({ enterpriseCode: 'enterpriseA', poolCodes: ['primary', 'fallback'], matchedRuleCodes: [] }) };
SERVICE.DefaultStockPoolService = { get: async () => ({ result: [
    { poolCode: 'primary', status: 'ACTIVE' }, { poolCode: 'fallback', status: 'ACTIVE' }
] }) };
SERVICE.DefaultStockPoolMemberService = { get: async () => ({ result: [
    { code: 'm2', poolCode: 'fallback', warehouseCode: 'west', priority: 1, status: 'ACTIVE' },
    { code: 'm1', poolCode: 'primary', warehouseCode: 'central', priority: 10, status: 'ACTIVE' },
    { code: 'duplicate', poolCode: 'fallback', warehouseCode: 'central', priority: 2, status: 'ACTIVE' }
] }) };
SERVICE.DefaultWarehouseService = { get: async () => ({ result: [
    { warehouseCode: 'central', status: 'ACTIVE' }, { warehouseCode: 'west', status: 'ACTIVE' }
] }) };
SERVICE.DefaultStockBalanceService = { get: async () => ({ result: [
    { code: 's1', warehouseCode: 'central', itemType: 'SKU', itemCode: 'phone', quantity: '2.000', reservedQuantity: '0.250', unitCode: 'KG', scale: 3, revision: 1 },
    { code: 's2', warehouseCode: 'west', itemType: 'SKU', itemCode: 'phone', quantity: '500', reservedQuantity: '100', unitCode: 'G', scale: 0, revision: 2 }
] }) };
SERVICE.DefaultInventoryUnitsReferenceProviderService = { convert: async (_request, value) => {
    assert.strictEqual(value.fromUnitCode, 'G'); assert.strictEqual(value.toUnitCode, 'KG');
    return { quantity: SERVICE.DefaultExactUnitsService.multiplyRational(value.quantity, '1', '1000', value.targetScale, 'UNNECESSARY') };
} };

(async () => {
    assert.strictEqual(route.secured, true); assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    assert.strictEqual(route.apiExposure, 'moduleInternal'); assert.strictEqual(route.key, '/references/stock-availability/evaluate');
    let result = await availability.evaluate({ tenant: 'tenantA', authData: authData, context: { countryCode: 'AE' },
        item: { itemType: 'SKU', itemCode: 'phone', unitCode: 'KG', targetScale: 3 } });
    assert.strictEqual(result.type, 'ON_HAND'); assert.strictEqual(result.quantity, '2.500');
    assert.strictEqual(result.reservedQuantity, '0.350'); assert.strictEqual(result.availableToSell, '2.150');
    assert.deepStrictEqual(result.warehouseCodes, ['central', 'west']); assert.strictEqual(result.evidence.length, 2);
    let response = await intent.evaluate({ tenant: 'tenantA', authData: authData,
        body: { context: { countryCode: 'AE' }, item: { itemType: 'SKU', itemCode: 'phone', unitCode: 'KG', targetScale: 3 } } });
    assert.strictEqual(response.code, 'SUC_INV_00003'); assert.strictEqual(response.data.quantity, '2.500');
    await assert.rejects(intent.evaluate({ authData: { tokenType: 'access', enterprise: { code: 'enterpriseA' } }, body: { context: {}, item: {} } }),
        error => error.code === 'ERR_INV_00031');
    await assert.rejects(availability.evaluate({ authData: authData, context: {}, item: { itemType: 'SKU', itemCode: 'phone', unitCode: 'KG', targetScale: 19 } }),
        error => error.code === 'ERR_INV_00029');
    let oldMaximum = inventory.stockAvailability.maximumWarehouses; inventory.stockAvailability.maximumWarehouses = 1;
    await assert.rejects(availability.evaluate({ authData: authData, context: {}, item: { itemType: 'SKU', itemCode: 'phone', unitCode: 'KG' } }),
        error => error.code === 'ERR_INV_00030'); inventory.stockAvailability.maximumWarehouses = oldMaximum;
    console.log('Inventory Stock Availability foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
