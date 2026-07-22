/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/test/pricingStoreReferenceProviderContract @description Validates configured Pricing-to-Store reference ownership in co-hosted and modular deployments. @layer test @owner pricing @override Extend when Pricing Store reference policy or transport changes. */
const assert = require('assert');
const pricing = require('../config/properties').pricing;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CONFIG = { get: key => key === 'pricing' ? pricing : undefined };
global.SERVICE = { DefaultPricingEnterpriseScopeService: { error: (code, message) => new NodicsError(code, message) } };
const provider = require('../src/service/reference/defaultPricingStoreReferenceProviderService');

(async () => {
    assert.strictEqual(pricing.references.providers.store, 'DefaultPricingStoreReferenceProviderService');
    SERVICE.DefaultStoreService = { get: async input => ({ result: input.query.enterpriseCode === 'enterpriseA' &&
        input.query.storeCode === 'electronics' ? [{ storeCode: 'electronics', status: 'ACTIVE' }] : [] }) };
    assert.strictEqual(await provider.validate({ tenant: 'tenantA', enterpriseCode: 'enterpriseA', code: 'electronics' }), true);
    assert.strictEqual(await provider.validate({ tenant: 'tenantA', enterpriseCode: 'enterpriseB', code: 'electronics' }), false);

    delete SERVICE.DefaultStoreService;
    global.NODICS = { getInternalAuthToken: () => 'pricing-service-token' };
    let descriptor;
    SERVICE.DefaultModuleService = {
        buildRequest: input => { descriptor = input; return input; },
        fetch: async () => ({ data: { found: true, store: { storeCode: 'electronics' } } })
    };
    assert.strictEqual(await provider.validate({ tenant: 'tenantA', enterpriseCode: 'enterpriseA', code: 'electronics' }), true);
    assert.strictEqual(descriptor.moduleName, 'store');
    assert.strictEqual(descriptor.apiName, '/references/stores/resolve');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer pricing-service-token');
    assert.strictEqual(descriptor.header['x-enterprise-code'], 'enterpriseA');

    global.NODICS = { getInternalAuthToken: () => undefined };
    await assert.rejects(provider.validate({ tenant: 'tenantA', enterpriseCode: 'enterpriseA', code: 'electronics' }),
        error => error.code === 'ERR_PRICE_00020');
    console.log('Pricing Store reference provider contract validated');
})().catch(error => { console.error(error); process.exit(1); });
