/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module pricing/test/PricingManagementContract
 * @description Verifies human-only Pricing intents, permissions, bounds, enterprise isolation, projections, retirement, overlap preview, and simulation.
 * @layer test
 * @owner pricing
 * @override Not applicable; this test protects the OOTB contract.
 */
const assert = require('assert'), properties = require('../config/properties'), authProperties = require('../../../gFramework/nAuth/config/properties'), groups = require('../../../gCore/profile/data/init/data/groups/defaultUserGroupsData'), routes = require('../src/router/routers').pricing.management;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => properties[key] }; global.SERVICE = {};
SERVICE.DefaultPricingEnterpriseScopeService = require('../src/service/foundation/defaultPricingEnterpriseScopeService');
let records = [{ code: 'e1::price::p1', enterpriseCode: 'e1', priceCode: 'p1', priceListCode: 'retail', itemType: 'SKU', itemCode: 'phone', amount: '10.00', currencyCode: 'AED', unitCode: 'piece', unitFactor: 1, minimumQuantity: '1', status: 'ACTIVE', secret: 'hidden' }], received = {};
SERVICE.DefaultPriceService = {
    get: async request => { received.get = request; return { result: records.filter(item => Object.keys(request.query || {}).every(key => item[key] === request.query[key])) }; },
    save: async request => { received.save = request; return request.model; },
    update: async request => { received.update = request; return { modifiedCount: 1 }; }
};
['DefaultPriceListService', 'DefaultPriceListAssignmentService', 'DefaultPriceGroupService', 'DefaultPriceGroupMemberService'].forEach(name => { SERVICE[name] = SERVICE.DefaultPriceService; });
SERVICE.DefaultPricingValidationService = { preparePriceWithReferences: async request => { request.model.enterpriseCode = 'e1'; request.model.code = 'derived'; return true; }, preparePriceList: async () => true, prepareAssignmentWithReferences: async () => true, prepareGroup: async () => true, prepareMembershipWithReferences: async () => true };
SERVICE.DefaultPriceResolutionService = { resolve: async request => ({ priceCode: request.body.item.itemCode + '-price', amount: '10.00' }) };
const service = require('../src/service/management/defaultPricingManagementService'), human = { tokenType: 'access', principalId: 'admin', enterprise: { code: 'e1' } };
(async () => {
    Object.values(routes).forEach(route => { assert.strictEqual(route.secured, true); assert.deepStrictEqual(route.authTokenTypes, ['access']); assert.strictEqual(route.apiExposure, 'pricingManagement'); assert(!route.permissionConfig); });
    assert.strictEqual(properties.backofficeCapabilities.pricing.capabilityId, 'pricing-management');
    ['pricing.backoffice.read', 'pricing.backoffice.preview', 'pricing.backoffice.manage'].forEach(permission => { assert(authProperties.identityGovernance.permissionCatalog.includes(permission)); assert(Object.values(groups).find(group => group.code === 'runtimeConfigAdminUserGroup').permissions.includes(permission)); });
    await assert.rejects(service.list({ authData: { tokenType: 'service', principalId: 'runtime', enterprise: { code: 'e1' } }, params: { resource: 'prices' } }), error => error.code === 'ERR_PRICE_00022');
    let list = await service.list({ tenant: 't1', authData: human, params: { resource: 'prices' }, query: { priceCode: 'p1', limit: '10' } }); assert.strictEqual(list.count, 1); assert.strictEqual(list.items[0].secret, undefined); assert.strictEqual(received.get.query.enterpriseCode, 'e1');
    await assert.rejects(service.list({ authData: human, params: { resource: 'prices' }, query: { amount: { $gt: '0' } } }), error => error.code === 'ERR_PRICE_00023');
    await service.create({ tenant: 't1', authData: human, params: { resource: 'prices' }, body: { enterpriseCode: 'evil', code: 'evil', priceCode: 'p2' } }); assert.strictEqual(received.save.model.enterpriseCode, undefined); assert.strictEqual(received.save.model.code, undefined);
    await service.retire({ tenant: 't1', authData: human, params: { resource: 'prices', businessCode: 'p1' } }); assert.deepStrictEqual(received.update.query, { enterpriseCode: 'e1', priceCode: 'p1' }); assert.strictEqual(received.update.model.status, 'RETIRED');
    let conflict = await service.conflicts({ tenant: 't1', authData: human, body: { price: Object.assign({}, records[0], { code: undefined, priceCode: 'p2' }) } }); assert.strictEqual(conflict.valid, false); assert.strictEqual(conflict.conflictCount, 1);
    let simulation = await service.simulate({ tenant: 't1', authData: human, body: { item: { itemType: 'SKU', itemCode: 'phone' }, quantity: '1', unitCode: 'piece', currencyCode: 'AED' } }); assert.strictEqual(simulation.persisted, false); assert.strictEqual(simulation.result.priceCode, 'phone-price');
    console.log('Pricing human management and preview contract validated');
})().catch(error => { console.error(error); process.exit(1); });
