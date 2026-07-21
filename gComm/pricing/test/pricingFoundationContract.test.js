/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert'), properties = require('../config/properties').pricing, schemas = require('../src/schemas/schemas').pricing, interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'pricing' ? properties : undefined }; global.SERVICE = {};
SERVICE.DefaultPricingEnterpriseScopeService = require('../src/service/foundation/defaultPricingEnterpriseScopeService');
SERVICE.DefaultPricingReferenceService = { validate: async () => true };
const validation = require('../src/service/foundation/defaultPricingValidationService'); SERVICE.DefaultPricingValidationService = validation;
['priceList', 'priceListAssignment', 'priceGroup', 'priceGroupMember', 'price'].forEach(name => { assert.strictEqual(schemas[name].isVersionedEnabled, false, 'base and Online-safe schema must not require nPublish'); assert.strictEqual(Object.assign({}, schemas[name], { isVersionedEnabled: true }).isVersionedEnabled, true, 'Staged server schema override enables versioning'); assert.strictEqual(schemas[name].router.enabled, false); assert(interceptors[name + 'PreSave']); assert(interceptors[name + 'PreGet']); assert(interceptors[name + 'PreUpdate']); assert(interceptors[name + 'PreRemove']); });
let authData = { enterprise: { code: 'entA' } };
let list = { authData, model: { priceListCode: 'retail', name: 'Retail', currencies: ['AED'], priority: 100, taxMode: 'GROSS', stackingMode: 'EXCLUSIVE' } };
validation.preparePriceList(list); assert.strictEqual(list.model.enterpriseCode, 'entA'); assert.strictEqual(list.model.code, 'entA::priceList::retail');
let price = { authData, model: { priceCode: 'iphone-retail', priceListCode: 'retail', itemType: 'SKU', itemCode: 'iphone', amount: '4999.95', currencyCode: 'AED', unitCode: 'piece', unitFactor: 1, minimumQuantity: '1' } };
validation.preparePrice(price); assert.strictEqual(price.model.code, 'entA::price::iphone-retail');
assert.throws(() => validation.preparePrice({ authData, model: Object.assign({}, price.model, { code: undefined, priceCode: 'float', amount: '1e3' }) }), error => error.code === 'ERR_PRICE_00012');
assert.throws(() => validation.preparePrice({ authData, model: Object.assign({}, price.model, { code: undefined, priceCode: 'ambiguous-item', itemPriceGroupCode: 'phones' }) }), error => error.code === 'ERR_PRICE_00016');
assert.throws(() => validation.preparePriceList({ authData: { enterprise: { code: 'entB' } }, model: Object.assign({}, list.model) }), error => error.code === 'ERR_PRICE_00002');
assert.rejects(validation.rejectHardDelete(), error => error.code === 'ERR_PRICE_00018').then(() => console.log('Pricing foundation contract validated'));
