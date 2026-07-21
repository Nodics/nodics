/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/ProductManagementAndReferenceContract
 * @description Proves human management and service-token reference boundaries, safe projections, bounded filters, and permissions.
 * @layer test
 * @owner product
 * @override Not applicable; this test protects the default security boundary.
 */
const assert = require('assert'), configuration = require('../config/properties'), authProperties = require('../../../gFramework/nAuth/config/properties'), groups = require('../../../gCore/profile/data/init/data/groups/defaultUserGroupsData'), routes = require('../src/router/routers').product;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => configuration[key] }; global.SERVICE = {};
SERVICE.DefaultProductEnterpriseScopeService = require('../src/service/foundation/defaultProductEnterpriseScopeService');
let records = [{ code: 'internal', enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone', name: 'Phone', baseUnitCode: 'piece', sellable: true, stockManaged: true, status: 'ACTIVE', secret: 'hidden' }], received = {};
SERVICE.DefaultProductItemService = { get: async request => { received.get = request; return { result: records.filter(item => Object.keys(request.query || {}).every(key => item[key] === request.query[key])) }; }, save: async request => { received.save = request; return request.model; }, update: async request => { received.update = request; return { modifiedCount: 1 }; } };
SERVICE.DefaultProductIdentifierService = SERVICE.DefaultProductItemService;
const management = require('../src/service/management/defaultProductManagementService'), lookup = require('../src/service/reference/defaultProductItemReferenceService'), human = { tokenType: 'access', principalId: 'admin', enterprise: { code: 'entA' } }, service = { tokenType: 'service', principalId: 'inventory', enterprise: { code: 'entA' } };
(async () => {
    Object.values(routes.management).forEach(route => { assert.strictEqual(route.secured, true); assert.deepStrictEqual(route.authTokenTypes, ['access']); assert.strictEqual(route.apiExposure, 'productManagement'); });
    assert.strictEqual(routes.itemReference.resolve.permissionConfig, 'authSecurity.internalToken.routePermission'); assert.strictEqual(routes.itemReference.resolve.apiExposure, 'moduleInternal');
    ['product.backoffice.read', 'product.backoffice.manage'].forEach(permission => { assert(authProperties.identityGovernance.permissionCatalog.includes(permission)); assert(Object.values(groups).find(group => group.code === 'runtimeConfigAdminUserGroup').permissions.includes(permission)); });
    await assert.rejects(management.list({ authData: service, params: { resource: 'items' } }), error => error.code === 'ERR_PRODUCT_00022');
    let list = await management.list({ tenant: 't1', authData: human, params: { resource: 'items' }, query: { itemCode: 'phone' } }); assert.strictEqual(list.count, 1); assert.strictEqual(list.items[0].secret, undefined); assert.strictEqual(received.get.query.enterpriseCode, 'entA');
    await assert.rejects(management.list({ authData: human, params: { resource: 'items' }, query: { itemCode: { $ne: 'x' } } }), error => error.code === 'ERR_PRODUCT_00023');
    await management.create({ tenant: 't1', authData: human, params: { resource: 'items' }, body: { enterpriseCode: 'evil', code: 'evil', catalogCode: 'retail', itemType: 'SKU', itemCode: 'tablet' } }); assert.strictEqual(received.save.model.enterpriseCode, undefined); assert.strictEqual(received.save.model.code, undefined);
    await management.retire({ tenant: 't1', authData: human, params: { resource: 'items', businessCode: 'phone' }, query: { catalogCode: 'retail' } }); assert.strictEqual(received.update.model.status, 'RETIRED');
    await assert.rejects(lookup.resolve({ authData: human, body: { catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone' } }), error => error.code === 'ERR_PRODUCT_00030');
    let result = await lookup.resolve({ tenant: 't1', authData: service, body: { catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone' } }); assert.strictEqual(result.found, true); assert.strictEqual(result.item.secret, undefined);
    console.log('Product P0 management and reference contract validated');
})().catch(error => { console.error(error); process.exit(1); });
