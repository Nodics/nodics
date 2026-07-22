/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontObservabilityContract
 * @description Validates readiness contribution, sanitized metrics, alert thresholds, access separation, and nCache diagnostics composition.
 * @layer test
 * @owner storefront
 * @override Projects may export additional telemetry while preserving bounded secret-safe diagnostics and nSystem/nCache ownership.
 */
const assert = require('assert');
const properties = require('../config/properties');

global.CONFIG = { get: (name) => name === 'storefront' ? properties.storefront : undefined };
global.SERVICE = {};
let contributors = {};
SERVICE.DefaultHealthService = {
    registerReadinessContributor: (name, contributor) => { contributors[name] = contributor; }
};
SERVICE.DefaultStorefrontCmsSiteReferenceProviderService = { resolve: async () => true };
SERVICE.DefaultStorefrontStoreReferenceProviderService = { resolve: async () => true };
SERVICE.DefaultCacheEngineService = { getCacheEngine: (moduleName, channelName) => moduleName === 'storefront' && channelName === 'context' ? {} : null };
SERVICE.DefaultCacheService = {
    getCacheMetricsSnapshot: () => ({
        operations: {
            'storefront|default|context|get': {
                operation: 'get', count: 3, results: { hit: 2, miss: 1 }, totalLatencyMs: 6,
                maxLatencyMs: 4, tenant: 'default', lastErrorCode: null
            }
        }
    })
};
SERVICE.DefaultStorefrontManagementService = {
    authorize: (request) => {
        if (!request.authData || request.authData.tokenType !== 'access') throw Object.assign(new Error('human required'), { code: 'ERR_STOREFRONT_00011' });
        return 'enterpriseA';
    }
};
const service = require('../src/service/defaultStorefrontObservabilityService');

(async function () {
    await service.init();
    ['storefrontConfiguration', 'storefrontCmsReferenceProvider', 'storefrontStoreReferenceProvider', 'storefrontContextCache'].forEach((name) => assert(contributors[name], name));
    assert.strictEqual(contributors.storefrontConfiguration.required, true);
    assert.strictEqual(contributors.storefrontContextCache.required, false);
    assert.strictEqual(contributors.storefrontConfiguration.check(), true);
    assert.strictEqual(contributors.storefrontCmsReferenceProvider.check(), true);
    assert.strictEqual(contributors.storefrontStoreReferenceProvider.check(), true);
    assert.strictEqual(contributors.storefrontContextCache.check(), true);

    service.recordCacheOutcome('cacheMiss');
    service.recordCacheOutcome('cacheError', { code: 'ERR_CACHE_PROVIDER' });
    service.recordCacheOutcome('cacheWriteError', { code: 'ERR_CACHE_WRITE' });
    service.recordCacheOutcome('contractMiss');
    service.recordDependency('cms', true);
    service.recordDependency('cms', false, { code: 'ERR_CMS_REFERENCE' });
    service.recordDependency('store', true);
    service.recordResolution('cacheHit', Date.now() - 4);
    service.recordResolution('authoritativeSuccess', Date.now() - 6);
    service.recordResolution('authoritativeFailure', Date.now() - 8, { code: 'ERR_STOREFRONT_00005' });
    let snapshot = service.snapshot();
    assert.strictEqual(snapshot.resolutions, 3);
    assert.strictEqual(snapshot.successes, 2);
    assert.strictEqual(snapshot.failures, 1);
    assert.strictEqual(snapshot.cacheHits, 1);
    assert.strictEqual(snapshot.cacheMisses, 1);
    assert.strictEqual(snapshot.cacheErrors, 1);
    assert.strictEqual(snapshot.cacheWriteErrors, 1);
    assert.strictEqual(snapshot.contractMisses, 1);
    assert.strictEqual(snapshot.authoritativeResolutions, 2);
    assert.strictEqual(snapshot.dependencies.cms.attempts, 2);
    assert.strictEqual(snapshot.dependencies.cms.failures, 1);
    assert.strictEqual(snapshot.dependencies.store.successes, 1);

    let diagnostics = await service.diagnostics({ authData: { tokenType: 'access', principalId: 'operator' } });
    assert.strictEqual(diagnostics.assessment.state, 'READY');
    assert.strictEqual(diagnostics.dependencies.cmsSiteReferenceProvider.status, 'AVAILABLE');
    assert.strictEqual(diagnostics.cache.totalOperations, 3);
    assert.deepStrictEqual(diagnostics.cache.operations.get.results, { hit: 2, miss: 1 });
    let serialized = JSON.stringify(diagnostics);
    ['electronics.nodics.com', 'tenantCode', 'principalId', 'accessToken', 'internalToken', 'https://'].forEach((secret) => assert(!serialized.includes(secret)));
    await assert.rejects(service.diagnostics({ authData: { tokenType: 'service', principalId: 'module' } }), (error) => error.code === 'ERR_STOREFRONT_00011');

    let original = service.policy;
    service.recordTrafficOutcome('rejected', 'TRAFFIC_QUEUE_FULL');
    service.policy = () => ({ enabled: true, readiness: { cacheRequired: true }, thresholds: {
        minimumSamples: 1, failurePercent: 1, cacheErrorPercent: 1, dependencyFailurePercent: 1, trafficRejected: 1,
        maximumAverageLatencyMs: 1, maximumObservedLatencyMs: 1
    } });
    let degraded = service.assess();
    assert.strictEqual(degraded.state, 'DEGRADED');
    assert(degraded.alerts.includes('RESOLUTION_FAILURE_RATE'));
    assert(degraded.alerts.includes('CACHE_ERROR_RATE'));
    assert(degraded.alerts.includes('CMS_REFERENCE_FAILURE_RATE'));
    assert(degraded.alerts.includes('TRAFFIC_CAPACITY_REJECTED'));
    assert(degraded.alerts.includes('AVERAGE_LATENCY_HIGH'));
    assert(degraded.alerts.includes('MAXIMUM_LATENCY_HIGH'));
    service.policy = original;

    SERVICE.DefaultStorefrontCmsSiteReferenceProviderService = undefined;
    assert.strictEqual(service.assess().state, 'NOT_READY');
    console.log('Storefront observability contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
