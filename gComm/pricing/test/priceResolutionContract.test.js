/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert'), properties = require('../config/properties').pricing;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'pricing' ? properties : undefined }; global.SERVICE = {};
SERVICE.DefaultPricingEnterpriseScopeService = require('../src/service/foundation/defaultPricingEnterpriseScopeService'); SERVICE.DefaultPricingValidationService = require('../src/service/foundation/defaultPricingValidationService');
const now = new Date(), active = { status: 'ACTIVE', active: true, effectiveFrom: new Date(now.getTime() - 1000).toISOString(), effectiveTo: new Date(now.getTime() + 60000).toISOString(), versionId: 1 };
let lists = [Object.assign({ code: 'list-global', enterpriseCode: 'entA', priceListCode: 'global', priority: 100, currencies: ['AED'], taxMode: 'GROSS' }, active), Object.assign({ code: 'list-store', enterpriseCode: 'entA', priceListCode: 'store', priority: 100, currencies: ['AED'], taxMode: 'NET' }, active)];
let assignments = [Object.assign({ enterpriseCode: 'entA', assignmentCode: 'global', priceListCode: 'global', scopeType: 'ENTERPRISE', scopeCode: 'entA', priority: 100 }, active), Object.assign({ enterpriseCode: 'entA', assignmentCode: 'dubai', priceListCode: 'store', scopeType: 'STORE', scopeCode: 'dubai', priority: 100 }, active)];
let groups = [Object.assign({ enterpriseCode: 'entA', priceGroupCode: 'vip', groupType: 'CUSTOMER_SEGMENT' }, active), Object.assign({ enterpriseCode: 'entA', priceGroupCode: 'phones', groupType: 'ITEM' }, active)];
let memberships = [Object.assign({ enterpriseCode: 'entA', priceGroupCode: 'vip', memberCode: 'VIP' }, active), Object.assign({ enterpriseCode: 'entA', priceGroupCode: 'phones', memberCode: 'iphone' }, active)];
let prices = [Object.assign({ enterpriseCode: 'entA', priceCode: 'global-phone', priceListCode: 'global', itemPriceGroupCode: 'phones', amount: '5000', currencyCode: 'AED', unitCode: 'piece', unitFactor: 1, minimumQuantity: '1' }, active), Object.assign({ enterpriseCode: 'entA', priceCode: 'dubai-phone', priceListCode: 'store', itemCode: 'iphone', itemType: 'SKU', amount: '4900', currencyCode: 'AED', unitCode: 'piece', unitFactor: 1, minimumQuantity: '1' }, active), Object.assign({ enterpriseCode: 'entA', priceCode: 'dubai-vip-5', priceListCode: 'store', itemCode: 'iphone', itemType: 'SKU', customerPriceGroupCode: 'vip', amount: '4700', currencyCode: 'AED', unitCode: 'piece', unitFactor: 1, minimumQuantity: '5' }, active)];
const matches = (item, query) => Object.keys(query || {}).every(key => query[key] && query[key].$in ? query[key].$in.includes(item[key]) : item[key] === query[key]);
const service = data => ({ get: async request => ({ result: data.filter(item => matches(item, request.query)) }) });
SERVICE.DefaultPriceListService = service(lists); SERVICE.DefaultPriceListAssignmentService = service(assignments); SERVICE.DefaultPriceGroupService = service(groups); SERVICE.DefaultPriceGroupMemberService = service(memberships); SERVICE.DefaultPriceService = service(prices);
const resolver = require('../src/service/resolution/defaultPriceResolutionService'), authData = { enterprise: { code: 'entA' }, tokenType: 'service' };
(async () => {
    let result = await resolver.resolve({ authData, body: { item: { itemType: 'SKU', itemCode: 'iphone' }, quantity: '1', unitCode: 'piece', currencyCode: 'AED', context: { storeCode: 'dubai' } } }); assert.strictEqual(result.priceCode, 'dubai-phone'); assert.strictEqual(result.scopeType, 'STORE');
    result = await resolver.resolve({ authData, body: { item: { itemType: 'SKU', itemCode: 'iphone' }, quantity: '5.0', unitCode: 'piece', currencyCode: 'AED', context: { storeCode: 'dubai', customerSegmentCodes: ['VIP'] } } }); assert.strictEqual(result.priceCode, 'dubai-vip-5');
    await assert.rejects(resolver.resolve({ authData, body: { item: { itemType: 'SKU', itemCode: 'iphone' }, quantity: '1', unitCode: 'piece', currencyCode: 'USD', context: { storeCode: 'dubai' } } }), error => error.code === 'ERR_PRICE_00034');
    await assert.rejects(resolver.resolve({ authData, body: { item: { itemType: 'SKU', itemCode: 'iphone' }, quantity: '1', unitCode: 'piece', currencyCode: 'AED', context: { $where: 'x' } } }), error => error.code === 'ERR_PRICE_00031');
    prices.push(Object.assign({}, prices[1], { priceCode: 'dubai-phone-duplicate' })); await assert.rejects(resolver.resolve({ authData, body: { item: { itemType: 'SKU', itemCode: 'iphone' }, quantity: '1', unitCode: 'piece', currencyCode: 'AED', context: { storeCode: 'dubai' } } }), error => error.code === 'ERR_PRICE_00035');
    console.log('Pricing deterministic resolution contract validated');
})().catch(error => { console.error(error); process.exit(1); });
