/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontPersistenceIntegration
 * @description Exercises protected management persistence and public hostname resolution through the composed Storefront services.
 * @layer test
 * @owner storefront
 * @override Extend when management persistence or the public response contract changes.
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
const storefrontFoundation = require('../src/service/foundation/defaultStorefrontFoundationService');
const endpointFoundation = require('../src/service/foundation/defaultStorefrontEndpointFoundationService');
const management = require('../src/service/defaultStorefrontManagementService');
const context = require('../src/service/defaultStorefrontContextService');
const controller = require('../src/controller/defaultStorefrontContextController');
Object.assign(SERVICE, {
    DefaultStorefrontEnterpriseScopeService: scope,
    DefaultStorefrontFoundationService: storefrontFoundation,
    DefaultStorefrontEndpointFoundationService: endpointFoundation,
    DefaultStorefrontManagementService: management,
    DefaultStorefrontContextService: context,
    DefaultStorefrontCmsSiteReferenceProviderService: {
        resolve: async (request, code) => ({ cmsSiteCode: code, catalogCode: 'contentCatalog' })
    },
    DefaultStorefrontStoreReferenceProviderService: {
        resolve: async (request, code) => ({ storeCode: code, name: 'Electronics' })
    },
    DefaultStorefrontCatalogReferenceProviderService: { validate: async (request, code) => ({ catalogCode: code }) }
});
const records = { storefronts: [], endpoints: [] };
const matches = function (item, query) {
    return Object.keys(query || {}).every((key) => {
        let expected = query[key];
        return expected && typeof expected === 'object' && expected.$ne !== undefined
            ? item[key] !== expected.$ne
            : item[key] === expected;
    });
};
const service = function (bucket, foundation, saveMethod, updateMethod) {
    return {
        get: async (request) => ({ result: records[bucket].filter((item) => matches(item, request.query)) }),
        save: async (request) => {
            await foundation[saveMethod](request);
            records[bucket].push(Object.assign({}, request.model));
            return request.model;
        },
        update: async (request) => {
            await foundation[updateMethod](request);
            let item = records[bucket].find((candidate) => matches(candidate, request.query));
            Object.assign(item, request.model.$set || request.model);
            return item;
        }
    };
};
SERVICE.DefaultStorefrontService = service('storefronts', storefrontFoundation, 'prepareSave', 'prepareUpdate');
SERVICE.DefaultStorefrontEndpointService = service('endpoints', endpointFoundation, 'prepareSave', 'prepareUpdate');
const authData = { tokenType: 'access', principalId: 'operator', enterpriseCode: 'enterpriseA' };
const request = function (resource, body) {
    return { tenant: 'tenantA', authData: authData, params: { resource: resource }, body: body };
};

(async function () {
    await management.create(
        request('storefronts', {
            storefrontCode: 'electronicsWeb',
            name: 'Electronics',
            cmsSiteCode: 'electronicsSite',
            storeCodes: ['electronics'],
            defaultStoreCode: 'electronics',
            productCatalogCodes: ['electronicsProduct'],
            defaultProductCatalogCode: 'electronicsProduct'
        })
    );
    await management.update(
        Object.assign(request('storefronts', { status: 'ACTIVE' }), {
            params: { resource: 'storefronts', businessCode: 'electronicsWeb' }
        })
    );
    await management.create(
        request('endpoints', { hostname: 'electronics.nodics.com', storefrontCode: 'electronicsWeb', canonical: true })
    );
    await management.update(
        Object.assign(request('endpoints', { status: 'ACTIVE' }), {
            params: { resource: 'endpoints', businessCode: 'electronics.nodics.com' }
        })
    );

    let response = await controller.resolve({ hostname: 'electronics.nodics.com' });
    assert.strictEqual(response.code, 'SUC_STOREFRONT_00001');
    assert.strictEqual(response.data.storefrontCode, 'electronicsWeb');
    assert.strictEqual(response.data.cmsSite.cmsSiteCode, 'electronicsSite');
    assert.strictEqual(response.data.defaultStore.storeCode, 'electronics');
    assert.strictEqual(response.data.downstream.cms.site, 'electronicsSite');
    assert.strictEqual(response.data.downstream.product.catalogCode, 'electronicsProduct');
    assert.strictEqual(records.endpoints[0].tenantCode, 'tenantA');
    await assert.rejects(
        controller.resolve({ hostname: 'unknown.nodics.com' }),
        (error) => error.code === 'ERR_STOREFRONT_00009'
    );
    await assert.rejects(
        management.list({
            tenant: 'tenantA',
            authData: { tokenType: 'service', principalId: 'module' },
            params: { resource: 'storefronts' },
            query: {}
        }),
        (error) => error.code === 'ERR_STOREFRONT_00011'
    );
    console.log('Storefront persistence integration validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
