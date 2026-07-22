/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontContract
 * @description Validates Storefront schemas, hostname security, references, lifecycle, and public context resolution.
 * @layer test
 * @owner storefront
 * @override Extend this contract for every new context dimension or resolution rule.
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
const context = require('../src/service/defaultStorefrontContextService');
const schemas = require('../src/schemas/schemas').storefront;
const routers = require('../src/router/routers').storefront;
const interceptors = require('../src/interceptors/interceptors');
SERVICE.DefaultStorefrontEnterpriseScopeService = scope;
SERVICE.DefaultStorefrontEndpointFoundationService = endpointFoundation;
const auth = { tokenType: 'access', principalId: 'operator', enterpriseCode: 'enterpriseA' };
let storefronts = [
    {
        enterpriseCode: 'enterpriseA',
        storefrontCode: 'electronicsWeb',
        name: 'Electronics',
        cmsSiteCode: 'electronicsSite',
        storeCodes: ['electronics'],
        defaultStoreCode: 'electronics',
        productCatalogCodes: ['electronicsProduct'],
        defaultProductCatalogCode: 'electronicsProduct',
        countryCodes: ['AE'],
        defaultCountryCode: 'AE',
        localeCodes: ['en-AE'],
        defaultLocaleCode: 'en-AE',
        currencyCodes: ['AED'],
        defaultCurrencyCode: 'AED',
        status: 'ACTIVE'
    }
];
let endpoints = [
    {
        hostname: 'electronics.nodics.com',
        storefrontCode: 'electronicsWeb',
        enterpriseCode: 'enterpriseA',
        tenantCode: 'tenantA',
        scheme: 'https',
        canonical: true,
        status: 'ACTIVE'
    }
];
const matches = (item, query) => Object.keys(query || {}).every((key) => item[key] === query[key]);
SERVICE.DefaultStorefrontService = {
    get: async (request) => ({ result: storefronts.filter((item) => matches(item, request.query)) })
};
SERVICE.DefaultStorefrontEndpointService = {
    get: async (request) => ({ result: endpoints.filter((item) => matches(item, request.query)) })
};
SERVICE.DefaultStorefrontCmsSiteReferenceProviderService = {
    resolve: async (request, code) =>
        code === 'electronicsSite'
            ? { cmsSiteCode: code, catalogCode: 'electronicsContent' }
            : Promise.reject(new NodicsError('ERR_STOREFRONT_00005'))
};
SERVICE.DefaultStorefrontStoreReferenceProviderService = {
    resolve: async (request, code) =>
        code === 'electronics'
            ? { storeCode: code, name: 'Electronics UAE' }
            : Promise.reject(new NodicsError('ERR_STOREFRONT_00005'))
};
SERVICE.DefaultStorefrontCatalogReferenceProviderService = {
    validate: async (request, code) =>
        code === 'electronicsProduct' ? { catalogCode: code } : Promise.reject(new NodicsError('ERR_STOREFRONT_00005'))
};

(async function () {
    assert(schemas.storefront && schemas.storefrontEndpoint);
    assert.strictEqual(schemas.storefront.router.enabled, false);
    assert.deepStrictEqual(schemas.storefrontEndpoint.tenants, ['default']);
    assert.strictEqual(schemas.storefrontEndpoint.indexes.individual.canonicalKey.options.unique, true);
    assert.strictEqual(routers.context.resolve.publicAccess, true);
    assert.strictEqual(routers.context.resolve.cache.enabled, false);
    assert(interceptors.storefrontPostSaveInvalidateContext);
    assert(interceptors.storefrontPostUpdateInvalidateContext);
    assert(interceptors.storefrontEndpointPostSaveInvalidateContext);
    assert(interceptors.storefrontEndpointPostUpdateInvalidateContext);
    assert.deepStrictEqual(routers.management.create.authTokenTypes, ['access']);
    assert.strictEqual(routers.operations.diagnostics.permission, 'storefront.operations.read');
    assert.deepStrictEqual(routers.operations.diagnostics.authTokenTypes, ['access']);
    assert.strictEqual(endpointFoundation.normalizeHostname('Electronics.Nodics.Com.'), 'electronics.nodics.com');
    ['localhost', '10.0.0.1', '*.nodics.com', 'https://nodics.com', 'nodics.com:443'].forEach((host) =>
        assert.throws(
            () => endpointFoundation.normalizeHostname(host),
            (error) => error.code === 'ERR_STOREFRONT_00008'
        )
    );
    let create = {
        tenant: 'tenantA',
        authData: auth,
        model: {
            storefrontCode: 'fashionWeb',
            name: 'Fashion',
            cmsSiteCode: 'electronicsSite',
            storeCodes: ['electronics'],
            defaultStoreCode: 'electronics',
            status: 'DRAFT'
        }
    };
    await foundation.prepareSave(create);
    assert.strictEqual(create.model.enterpriseCode, 'enterpriseA');
    assert.strictEqual(create.model.code, 'enterpriseA::storefront::fashionWeb');
    await assert.rejects(
        foundation.prepareSave({
            tenant: 'tenantA',
            authData: auth,
            model: {
                storefrontCode: 'bad',
                name: 'Bad',
                cmsSiteCode: 'electronicsSite',
                storeCodes: ['electronics'],
                defaultStoreCode: 'other'
            }
        }),
        (error) => error.code === 'ERR_STOREFRONT_00003'
    );
    let resolved = await context.resolve({
        hostname: 'electronics.nodics.com',
        query: { hostname: 'attacker.example.com' },
        headers: { host: 'attacker.example.com' }
    });
    assert.strictEqual(resolved.storefrontCode, 'electronicsWeb');
    assert.strictEqual(resolved.cmsSite.catalogCode, 'electronicsContent');
    assert.strictEqual(resolved.defaultStore.storeCode, 'electronics');
    assert.strictEqual(resolved.defaults.currency, 'AED');
    assert.strictEqual(resolved.downstream.cms.site, 'electronicsSite');
    assert.strictEqual(resolved.downstream.product.catalogCode, 'electronicsProduct');
    assert.strictEqual(resolved.downstream.pricing.storeCode, 'electronics');
    assert.strictEqual(resolved.downstream.inventory.countryCode, 'AE');
    assert.strictEqual(resolved.enterpriseCode, undefined);
    assert.strictEqual(resolved.tenantCode, undefined);
    await assert.rejects(
        context.resolve({ hostname: 'unknown.nodics.com' }),
        (error) => error.code === 'ERR_STOREFRONT_00009'
    );
    console.log('Storefront contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
