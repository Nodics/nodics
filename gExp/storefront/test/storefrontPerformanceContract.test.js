/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontPerformanceContract
 * @description Produces repeatable evidence for cached context resolution and sanitized diagnostics within layered performance budgets.
 * @layer test
 * @owner storefront
 * @override Environments may tighten iteration counts and latency budgets after representative capacity testing.
 */
const assert = require('assert');
const properties = require('../config/properties');

global.CONFIG = { get: (name) => name === 'storefront' ? properties.storefront : undefined };
global.SERVICE = {};
SERVICE.DefaultStorefrontEndpointFoundationService = { normalizeHostname: (value) => String(value).toLowerCase() };
SERVICE.DefaultStorefrontEnterpriseScopeService = { error: (code, message) => Object.assign(new Error(message), { code: code }) };
SERVICE.DefaultStorefrontContextService = {
    requestHostname: (request) => request.hostname,
    resolve: async () => { throw new Error('cached performance path must not call authority'); }
};
SERVICE.DefaultStorefrontCmsSiteReferenceProviderService = { resolve: async () => true };
SERVICE.DefaultStorefrontStoreReferenceProviderService = { resolve: async () => true };
SERVICE.DefaultStorefrontManagementService = { authorize: () => 'enterpriseA' };
SERVICE.DefaultCacheEngineService = { getCacheEngine: () => ({}) };
SERVICE.DefaultCacheService = {
    get: async () => ({ contractVersion: 1, value: { storefrontCode: 'web' } }),
    getCacheMetricsSnapshot: () => ({ operations: {} })
};
const observability = require('../src/service/defaultStorefrontObservabilityService');
const cache = require('../src/service/defaultStorefrontContextCacheService');
SERVICE.DefaultStorefrontObservabilityService = observability;

(async function () {
    observability.reset();
    let budget = properties.storefront.observability.performance;
    let iterations = Number(budget.cacheHitIterations);
    let startedAt = process.hrtime.bigint();
    for (let count = 0; count < iterations; count += 1) {
        let result = await cache.resolve({ hostname: 'electronics.nodics.com' });
        assert.strictEqual(result.storefrontCode, 'web');
    }
    let cacheHitBatchMs = Number(process.hrtime.bigint() - startedAt) / 1000000;
    startedAt = process.hrtime.bigint();
    let diagnostics = await observability.diagnostics({ authData: { tokenType: 'access', principalId: 'operator' } });
    let diagnosticsMs = Number(process.hrtime.bigint() - startedAt) / 1000000;
    assert.strictEqual(diagnostics.resolution.resolutions, iterations);
    assert.strictEqual(diagnostics.resolution.cacheHits, iterations);
    assert(cacheHitBatchMs <= Number(budget.maximumCacheHitBatchMs), 'cached resolution batch exceeded layered budget');
    assert(diagnosticsMs <= Number(budget.maximumDiagnosticsMs), 'sanitized diagnostics exceeded layered budget');
    console.log('Storefront performance evidence validated: iterations=' + iterations +
        ', cacheHitBatchMs=' + cacheHitBatchMs.toFixed(3) + ', diagnosticsMs=' + diagnosticsMs.toFixed(3));
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
