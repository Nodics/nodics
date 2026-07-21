/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/test/inventoryOperationsContract @description Validates secured bounded operational routes, enterprise filters, and safe projections. @layer test @owner inventory */
const assert = require('assert'); const inventory = require('../config/properties').inventory; class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } } global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined }; global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService'); let received; SERVICE.DefaultStockBalanceService = { get: async request => { received = request; return { result: [{ code: 's1', enterpriseCode: 'e1', warehouseCode: 'w1', itemCode: 'p1', quantity: '4', reservedQuantity: '1', revision: 2, secret: 'hidden' }] }; } }; const service = require('../src/service/operations/defaultInventoryOperationsService'); const routes = require('../src/router/routers').inventory.inventoryOperations;
(async () => { Object.values(routes).forEach(route => { assert.strictEqual(route.secured, true); assert.strictEqual(route.permission, 'inventory.operations.read'); assert.strictEqual(route.apiExposure, 'inventoryOperations'); }); let response = await service.list('balances', { tenant: 't1', authData: { tokenType: 'access', enterprise: { code: 'e1' } }, query: { warehouseCode: 'w1', limit: '10' } }); assert.strictEqual(received.query.enterpriseCode, 'e1'); assert.strictEqual(received.searchOptions.pageSize, 10); assert.strictEqual(response.items[0].secret, undefined); await assert.rejects(service.list('balances', { authData: { enterprise: { code: 'e1' } }, query: { quantity: { $gt: 0 } } }), error => error.code === 'ERR_INV_00029'); console.log('Inventory operational API contract validated'); })().catch(error => { console.error(error); process.exit(1); });
