/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontReferenceTransportContract
 * @description Verifies CMS and Store remote lookups use the shared timeout, retry, circuit-breaker, response-bound, redirect, and idempotency transport contract.
 * @layer test
 * @owner storefront
 * @override Projects may change provider coordinates while retaining DefaultModuleService resilience ownership.
 */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: (name) => name === 'storefront' ? properties.storefront : undefined };
global.NODICS = { getInternalAuthToken: () => 'internal-token' };
global.SERVICE = {};
let descriptors = [];
SERVICE.DefaultStorefrontEnterpriseScopeService = {
    validateBusinessCode: (value) => value,
    resolveEnterpriseCode: () => 'enterpriseA',
    error: (code, message) => Object.assign(new Error(message), { code: code })
};
SERVICE.DefaultModuleService = {
    buildRequest: (descriptor) => { descriptors.push(descriptor); return descriptor; },
    fetch: async (descriptor) => descriptor.moduleName === 'cms'
        ? { data: { data: { found: true, site: { cmsSiteCode: 'site' } } } }
        : { data: { data: { found: true, store: { storeCode: 'store' } } } }
};
const cms = require('../src/service/reference/defaultStorefrontCmsSiteReferenceProviderService');
const store = require('../src/service/reference/defaultStorefrontStoreReferenceProviderService');

(async function () {
    let originalCms = Object.assign({}, properties.storefront.cmsSiteReference), originalStore = Object.assign({}, properties.storefront.storeReference);
    properties.storefront.cmsSiteReference.preferLocal = false;
    properties.storefront.cmsSiteReference.requestTimeoutMs = 321;
    properties.storefront.cmsSiteReference.maximumAttempts = 3;
    properties.storefront.cmsSiteReference.maximumResponseBytes = 12345;
    properties.storefront.storeReference.preferLocal = false;
    properties.storefront.storeReference.requestTimeoutMs = 654;
    properties.storefront.storeReference.maximumAttempts = 4;
    properties.storefront.storeReference.maximumResponseBytes = 23456;
    await cms.resolve({ tenant: 'tenantA', authData: { enterpriseCode: 'enterpriseA' } }, 'site');
    await store.resolve({ tenant: 'tenantA', authData: { enterpriseCode: 'enterpriseA' } }, 'store');
    assert.deepStrictEqual(descriptors.map(item => ({ moduleName: item.moduleName, methodName: item.methodName,
        timeoutMs: item.timeoutMs, maxAttempts: item.maxAttempts, maxResponseBytes: item.maxResponseBytes,
        followRedirects: item.followRedirects, idempotent: Boolean(item.idempotencyKey) })), [
        { moduleName: 'cms', methodName: 'POST', timeoutMs: 321, maxAttempts: 3, maxResponseBytes: 12345, followRedirects: false, idempotent: true },
        { moduleName: 'store', methodName: 'POST', timeoutMs: 654, maxAttempts: 4, maxResponseBytes: 23456, followRedirects: false, idempotent: true }
    ]);
    assert.deepStrictEqual(descriptors[0].requestBody, { cmsSiteCode: 'site' });
    assert.deepStrictEqual(descriptors[1].requestBody, { storeCode: 'store' });
    assert.strictEqual(descriptors[0].body, undefined);
    assert.strictEqual(descriptors[0].requestTimeoutMs, undefined);
    Object.assign(properties.storefront.cmsSiteReference, originalCms);
    Object.assign(properties.storefront.storeReference, originalStore);
    console.log('Storefront reference transport contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
