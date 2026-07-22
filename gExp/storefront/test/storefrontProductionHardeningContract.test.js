/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontProductionHardeningContract
 * @description Validates production endpoint governance, canonical uniqueness, lifecycle safety, and modular failure recovery.
 * @layer test
 * @owner storefront
 * @override Extend when endpoint lifecycle, transport, or recovery policy changes.
 */
const assert = require('assert');
class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}
global.CLASSES = { NodicsError };
global.CONFIG = { get: (name) => (name === 'storefront' ? require('../config/properties').storefront : undefined) };
global.SERVICE = {};
const scope = require('../src/service/foundation/defaultStorefrontEnterpriseScopeService');
const endpointFoundation = require('../src/service/foundation/defaultStorefrontEndpointFoundationService');
const foundation = require('../src/service/foundation/defaultStorefrontFoundationService');
const storeProvider = require('../src/service/reference/defaultStorefrontStoreReferenceProviderService');
SERVICE.DefaultStorefrontEnterpriseScopeService = scope;
SERVICE.DefaultStorefrontEndpointFoundationService = endpointFoundation;
const auth = { tokenType: 'access', principalId: 'operator', enterpriseCode: 'enterpriseA' };
let storefronts = [
    { code: 'enterpriseA::storefront::web', enterpriseCode: 'enterpriseA', storefrontCode: 'web', status: 'ACTIVE' },
    { code: 'enterpriseA::storefront::draft', enterpriseCode: 'enterpriseA', storefrontCode: 'draft', status: 'DRAFT' }
];
let endpoints = [];
const matches = function (item, query) {
    return Object.keys(query || {}).every((key) => {
        let expected = query[key];
        return expected && typeof expected === 'object' && expected.$ne !== undefined
            ? item[key] !== expected.$ne
            : item[key] === expected;
    });
};
SERVICE.DefaultStorefrontService = {
    get: async (request) => ({ result: storefronts.filter((item) => matches(item, request.query)) })
};
SERVICE.DefaultStorefrontEndpointService = {
    get: async (request) => ({ result: endpoints.filter((item) => matches(item, request.query)) })
};

const endpointRequest = function (model) {
    return {
        tenant: 'tenantA',
        authData: auth,
        model: Object.assign({ hostname: 'www.nodics.com', storefrontCode: 'web' }, model)
    };
};

(async function () {
    let draft = endpointRequest({ canonical: true });
    await endpointFoundation.prepareSave(draft);
    assert.strictEqual(draft.model.status, 'DRAFT');
    assert.strictEqual(draft.model.scheme, 'https');
    assert.strictEqual(draft.model.canonicalKey, 'canonical::enterpriseA::tenantA::web');

    await assert.rejects(
        endpointFoundation.prepareSave(endpointRequest({ scheme: 'ftp' })),
        (error) => error.code === 'ERR_STOREFRONT_00003'
    );
    await assert.rejects(
        endpointFoundation.prepareSave(endpointRequest({ status: 'UNKNOWN' })),
        (error) => error.code === 'ERR_STOREFRONT_00003'
    );
    await assert.rejects(
        endpointFoundation.prepareSave(endpointRequest({ effectiveFrom: 'invalid-date' })),
        (error) => error.code === 'ERR_STOREFRONT_00003'
    );
    await assert.rejects(
        endpointFoundation.prepareSave(endpointRequest({ storefrontCode: 'draft', status: 'ACTIVE' })),
        (error) => error.code === 'ERR_STOREFRONT_00005'
    );

    endpoints.push(Object.assign({}, draft.model));
    await assert.rejects(
        endpointFoundation.prepareSave(endpointRequest({ hostname: 'WWW.NODICS.COM' })),
        (error) => error.code === 'ERR_STOREFRONT_00010'
    );
    await assert.rejects(
        endpointFoundation.prepareSave(endpointRequest({ hostname: 'shop.nodics.com', canonical: true })),
        (error) => error.code === 'ERR_STOREFRONT_00010'
    );
    let alias = endpointRequest({ hostname: 'shop.nodics.com', canonical: false });
    await endpointFoundation.prepareSave(alias);
    assert.strictEqual(alias.model.canonicalKey, 'alias::shop.nodics.com');

    endpoints[0].status = 'ACTIVE';
    let existing = Object.assign(
        { name: 'Web', cmsSiteCode: 'site', storeCodes: ['store'], defaultStoreCode: 'store', productCatalogCodes: [] },
        storefronts[0]
    );
    storefronts[0] = existing;
    SERVICE.DefaultStorefrontCmsSiteReferenceProviderService = { resolve: async () => true };
    SERVICE.DefaultStorefrontStoreReferenceProviderService = { resolve: async () => true };
    SERVICE.DefaultStorefrontCatalogReferenceProviderService = { validate: async () => true };
    await assert.rejects(
        foundation.prepareUpdate({
            tenant: 'tenantA',
            authData: auth,
            query: { storefrontCode: 'web' },
            model: { status: 'RETIRED' }
        }),
        (error) => error.code === 'ERR_STOREFRONT_00010'
    );

    let attempts = 0;
    global.NODICS = { getInternalAuthToken: () => 'service-token' };
    SERVICE.DefaultModuleService = {
        buildRequest: (request) => request,
        fetch: async () => {
            attempts += 1;
            if (attempts === 1) throw new Error('temporary outage');
            return { data: { found: true, store: { storeCode: 'store' } } };
        }
    };
    let originalPolicy = storeProvider.policy;
    storeProvider.policy = () => ({ preferLocal: false, maximumAttempts: 2 });
    await assert.rejects(storeProvider.resolve({ tenant: 'tenantA', authData: auth }, 'store'));
    let recovered = await storeProvider.resolve({ tenant: 'tenantA', authData: auth }, 'store');
    assert.strictEqual(recovered.storeCode, 'store');
    assert.strictEqual(attempts, 2);
    storeProvider.policy = originalPolicy;
    console.log('Storefront production hardening contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
