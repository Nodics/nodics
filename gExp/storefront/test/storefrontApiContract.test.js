/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontApiContract
 * @description Validates generated OpenAPI schemas, client compatibility, delivery headers, ETag revalidation, retry guidance, and response redaction.
 * @layer test
 * @owner storefront
 * @override Projects may add compatible fields and headers while retaining major-version and security boundaries.
 */
const assert = require('assert');
const properties = require('../config/properties');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: (name) => name === 'storefront' ? properties.storefront : undefined };
global.SERVICE = {};
SERVICE.DefaultStorefrontEnterpriseScopeService = { error: (code, message) => new NodicsError(code, message) };
const contract = require('../src/service/defaultStorefrontContractService');
const contracts = require('../src/schemas/apiContracts');
const routers = require('../src/router/routers').storefront;
const controller = require('../src/controller/defaultStorefrontContextController');
const response = () => ({ headers: {}, setHeader: function (name, value) { this.headers[name] = value; } });
const context = {
    hostname: 'electronics.nodics.com', canonical: true, scheme: 'https', storefrontCode: 'web', name: 'Electronics',
    cmsSite: { cmsSiteCode: 'site' }, stores: ['store'], defaultStore: { storeCode: 'store' },
    productCatalogCodes: ['catalog'], countries: ['AE'], locales: ['en-AE'], currencies: ['AED'], channels: ['WEB'],
    defaults: { country: 'AE', locale: 'en-AE', currency: 'AED', channel: 'WEB' },
    downstream: { cms: {}, product: {}, pricing: {}, inventory: {} }
};

(async function () {
    assert(contracts.contextData && contracts.diagnosticsData && contracts.errorEnvelope);
    assert(routers.context.resolve.responses[200].content['application/json'].schema);
    [304, 400, 404, 426, 429, 503].forEach(status => assert(routers.context.resolve.responses[status], 'missing response ' + status));
    assert(routers.context.resolve.help.parameters.some(parameter => parameter.name === 'x-nodics-client-contract-version'));
    assert(routers.operations.diagnostics.responses[200].content['application/json'].schema);

    let httpResponse = response(), request = { requestId: 'request-1', headers: {}, httpResponse: httpResponse };
    let decorated = contract.decorate(request, context);
    assert.strictEqual(decorated.data.contract.status, 'COMPATIBLE');
    assert.strictEqual(decorated.data.contract.moduleContractVersion, 1);
    assert.strictEqual(decorated.data.correlationId, 'request-1');
    assert.strictEqual(httpResponse.headers['x-nodics-storefront-contract-version'], '1');
    assert.strictEqual(httpResponse.headers['x-request-id'], 'request-1');
    assert.strictEqual(httpResponse.headers['Cache-Control'], 'private, max-age=0, must-revalidate');
    assert(/^W\/["].+["]$/.test(httpResponse.headers.ETag));
    assert.strictEqual(JSON.stringify(decorated.data).includes('tenantCode'), false);
    assert.strictEqual(JSON.stringify(decorated.data).includes('enterpriseCode'), false);

    assert.strictEqual(contract.compatibility({ headers: { 'x-nodics-client-contract-version': '2' } }).status, 'DEGRADED');
    assert.throws(() => contract.compatibility({ headers: { 'x-nodics-client-contract-version': 'invalid' } }), (error) => error.code === 'ERR_STOREFRONT_00012');
    let originalMinimum = properties.storefront.deliveryContract.minimumClientContractVersion;
    properties.storefront.deliveryContract.minimumClientContractVersion = 2;
    assert.throws(() => contract.compatibility({ headers: { 'x-nodics-client-contract-version': '1' } }), (error) => error.code === 'ERR_STOREFRONT_00015');
    properties.storefront.deliveryContract.minimumClientContractVersion = originalMinimum;

    SERVICE.DefaultStorefrontContractService = contract;
    SERVICE.DefaultStorefrontTrafficService = { resolve: async () => context };
    SERVICE.DefaultStorefrontContextAccessService = { issue: async () => ({ handle: 'a'.repeat(43), header: 'x-nodics-storefront-context', expiresInSeconds: 120 }) };
    let firstResponse = response();
    let first = await controller.resolve({ requestId: 'request-2', headers: {}, httpResponse: firstResponse });
    assert.strictEqual(first.data.contract.moduleContractVersion, 1);
    assert.strictEqual(first.data.contextAccess.handle.length, 43);
    let secondResponse = response();
    let second = await controller.resolve({ requestId: 'request-3', headers: { 'if-none-match': firstResponse.headers.ETag }, httpResponse: secondResponse });
    assert.strictEqual(second.responseCode, '304');
    assert.strictEqual(second.data, undefined);

    let retryResponse = response();
    contract.applyRetryAfter({ httpResponse: retryResponse });
    assert.strictEqual(retryResponse.headers['Retry-After'], '1');
    console.log('Storefront API contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
