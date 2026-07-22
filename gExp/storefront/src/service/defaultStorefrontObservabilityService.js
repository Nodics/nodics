/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/DefaultStorefrontObservabilityService
 * @description Contributes Storefront readiness and exposes bounded secret-safe resolution and cache diagnostics without replacing nSystem or nCache authority.
 * @layer service
 * @owner storefront
 * @override Deployments may export or replace metrics while preserving stable counters, sanitized output, and readiness ownership.
 */
module.exports = {
    _metrics: null,
    /** Initializes counters and registers Storefront checks with the nSystem readiness authority. */
    init: function () {
        this.reset();
        if (SERVICE.DefaultHealthService) {
            let timeoutMs = Number((this.policy().readiness || {}).contributorTimeoutMs || 1000);
            SERVICE.DefaultHealthService.registerReadinessContributor('storefrontConfiguration', {
                required: true, order: 392, timeoutMs: timeoutMs,
                description: 'Storefront context configuration is valid',
                check: () => this.validateConfiguration().valid
            });
            SERVICE.DefaultHealthService.registerReadinessContributor('storefrontCmsReferenceProvider', {
                required: true, order: 393, timeoutMs: timeoutMs,
                description: 'Storefront CMS Site reference provider is available',
                check: () => this.providerAvailable('DefaultStorefrontCmsSiteReferenceProviderService')
            });
            SERVICE.DefaultHealthService.registerReadinessContributor('storefrontStoreReferenceProvider', {
                required: true, order: 394, timeoutMs: timeoutMs,
                description: 'Storefront Store reference provider is available',
                check: () => this.providerAvailable('DefaultStorefrontStoreReferenceProviderService')
            });
            SERVICE.DefaultHealthService.registerReadinessContributor('storefrontContextCache', {
                required: (this.policy().readiness || {}).cacheRequired === true, order: 395, timeoutMs: timeoutMs,
                description: 'Configured Storefront context cache channel is available',
                check: () => this.cacheAvailable()
            });
        }
        return Promise.resolve(true);
    },
    /** Completes observability initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Storefront observability policy. */
    policy: function () { return ((CONFIG.get('storefront') || {}).observability) || {}; },
    /** Returns the effective context-cache policy. */
    cachePolicy: function () { return ((CONFIG.get('storefront') || {}).contextCache) || {}; },
    /** Resets process-local resolution counters for tests or a governed exporter lifecycle. */
    reset: function () {
        this._metrics = {
            startedAt: new Date().toISOString(), resolutions: 0, successes: 0, failures: 0,
            cacheHits: 0, negativeHits: 0, cacheMisses: 0, cacheErrors: 0, cacheWriteErrors: 0, contractMisses: 0,
            authoritativeResolutions: 0, totalLatencyMs: 0, maximumLatencyMs: 0,
            lastLatencyMs: 0, lastOutcome: null, lastErrorCode: null, updatedAt: null,
            traffic: { started: 0, queued: 0, coalesced: 0, rejected: 0, lastRejectionReason: null },
            dependencies: {
                cms: { attempts: 0, successes: 0, failures: 0, lastErrorCode: null, updatedAt: null },
                store: { attempts: 0, successes: 0, failures: 0, lastErrorCode: null, updatedAt: null }
            }
        };
        return this.snapshot();
    },
    /** Records a completed client resolution without retaining hostname, tenant, principal, or payload data. */
    recordResolution: function (outcome, startedAt, error) {
        if (this.policy().enabled === false) return true;
        if (!this._metrics) this.reset();
        let elapsedMs = Math.max(0, Date.now() - Number(startedAt || Date.now()));
        this._metrics.resolutions += 1;
        this._metrics.successes += outcome === 'cacheHit' || outcome === 'authoritativeSuccess' ? 1 : 0;
        this._metrics.failures += outcome === 'authoritativeFailure' || outcome === 'negativeHit' ? 1 : 0;
        this._metrics.cacheHits += outcome === 'cacheHit' ? 1 : 0;
        this._metrics.authoritativeResolutions += outcome.indexOf('authoritative') === 0 ? 1 : 0;
        this._metrics.totalLatencyMs += elapsedMs;
        this._metrics.maximumLatencyMs = Math.max(this._metrics.maximumLatencyMs, elapsedMs);
        this._metrics.lastLatencyMs = elapsedMs;
        this._metrics.lastOutcome = outcome;
        this._metrics.lastErrorCode = error && error.code || null;
        this._metrics.updatedAt = new Date().toISOString();
        if (error) this.log('warn', 'Storefront context resolution failed', { outcome: outcome, errorCode: error.code || 'STOREFRONT_RESOLUTION_ERROR' });
        return true;
    },
    /** Records a non-terminal cache outcome while nCache retains authoritative adapter metrics. */
    recordCacheOutcome: function (outcome, error) {
        if (this.policy().enabled === false) return true;
        if (!this._metrics) this.reset();
        if (outcome === 'cacheMiss') this._metrics.cacheMisses += 1;
        if (outcome === 'negativeHit') this._metrics.negativeHits += 1;
        if (outcome === 'cacheError') this._metrics.cacheErrors += 1;
        if (outcome === 'cacheWriteError') this._metrics.cacheWriteErrors += 1;
        if (outcome === 'contractMiss') this._metrics.contractMisses += 1;
        if (error) this._metrics.lastErrorCode = error.code || 'CACHE_PROVIDER_ERROR';
        this._metrics.updatedAt = new Date().toISOString();
        if (error) this.log('warn', 'Storefront context cache operation failed', { outcome: outcome, errorCode: error.code || 'CACHE_PROVIDER_ERROR' });
        return true;
    },
    /** Records CMS or Store reference outcomes without retaining requested business identifiers or response data. */
    recordDependency: function (dependency, success, error) {
        if (this.policy().enabled === false || !['cms', 'store'].includes(dependency)) return true;
        if (!this._metrics) this.reset();
        let metrics = this._metrics.dependencies[dependency];
        metrics.attempts += 1;
        metrics.successes += success ? 1 : 0;
        metrics.failures += success ? 0 : 1;
        metrics.lastErrorCode = error && error.code || null;
        metrics.updatedAt = new Date().toISOString();
        if (error) this.log('warn', 'Storefront reference dependency failed', { dependency: dependency, errorCode: error.code || 'REFERENCE_PROVIDER_ERROR' });
        return true;
    },
    /** Records bounded scheduler outcomes without retaining hostname keys or request data. */
    recordTrafficOutcome: function (outcome, reason) {
        if (this.policy().enabled === false) return true;
        if (!this._metrics) this.reset();
        if (Object.prototype.hasOwnProperty.call(this._metrics.traffic, outcome)) this._metrics.traffic[outcome] += 1;
        if (outcome === 'rejected') this._metrics.traffic.lastRejectionReason = reason || 'TRAFFIC_REJECTED';
        this._metrics.updatedAt = new Date().toISOString();
        return true;
    },
    /** Emits an optional structured sanitized diagnostic without request, identity, hostname, URL, token, or payload fields. */
    log: function (level, message, details) {
        if (this.LOG && typeof this.LOG[level] === 'function') this.LOG[level](message, details);
        return true;
    },
    /** Returns whether one required reference provider service is loaded. */
    providerAvailable: function (name) { return !!(SERVICE[name] && typeof SERVICE[name].resolve === 'function'); },
    /** Returns whether the configured cache channel is initialized, or true when context caching is disabled. */
    cacheAvailable: function () {
        let policy = this.cachePolicy();
        if (policy.enabled === false) return true;
        return !!(SERVICE.DefaultCacheEngineService && typeof SERVICE.DefaultCacheEngineService.getCacheEngine === 'function' &&
            SERVICE.DefaultCacheEngineService.getCacheEngine(policy.moduleName || 'storefront', policy.channelName || 'context'));
    },
    /** Validates Storefront observability and cache invariants without exposing effective secrets or endpoints. */
    validateConfiguration: function () {
        let storefront = CONFIG.get('storefront') || {}, cache = this.cachePolicy(), traffic = storefront.traffic || {};
        let threshold = this.policy().thresholds || {}, failures = [];
        if (cache.enabled !== false) {
            if (!cache.keyPrefix || Number(cache.maximumKeyLength || 0) < String(cache.keyPrefix || '').length + 64) failures.push('CACHE_KEY_POLICY_INVALID');
            if (!Number.isFinite(Number(cache.ttlSeconds)) || Number(cache.ttlSeconds) <= 0) failures.push('CACHE_TTL_INVALID');
            if (cache.negativeCachingEnabled !== false && (!Number.isFinite(Number(cache.negativeTtlSeconds)) || Number(cache.negativeTtlSeconds) <= 0 || Number(cache.negativeTtlSeconds) > Number(cache.ttlSeconds))) failures.push('NEGATIVE_CACHE_TTL_INVALID');
            if (!Number.isInteger(Number(cache.contractVersion)) || Number(cache.contractVersion) < 1) failures.push('CACHE_CONTRACT_VERSION_INVALID');
        }
        ['maximumConcurrentResolutions', 'maximumInFlightKeys'].forEach((name) => {
            if (!Number.isInteger(Number(traffic[name])) || Number(traffic[name]) < 1) failures.push('TRAFFIC_BOUND_INVALID');
        });
        if (!Number.isInteger(Number(traffic.maximumQueuedResolutions)) || Number(traffic.maximumQueuedResolutions) < 0) failures.push('TRAFFIC_BOUND_INVALID');
        let hardening = CONFIG.get('httpHardening') || {};
        if (traffic.requireHttpRateLimit === true && hardening.rateLimit && hardening.rateLimit.enabled !== true) failures.push('HTTP_RATE_LIMIT_REQUIRED');
        if ((storefront.host || {}).trustForwardedHost === true && hardening.trustProxy === false) failures.push('FORWARDED_HOST_TRUST_INVALID');
        ['failurePercent', 'cacheErrorPercent', 'dependencyFailurePercent'].forEach((name) => {
            let value = Number(threshold[name]);
            if (!Number.isFinite(value) || value < 0 || value > 100) failures.push('OBSERVABILITY_THRESHOLD_INVALID');
        });
        ['minimumSamples', 'maximumAverageLatencyMs', 'maximumObservedLatencyMs'].forEach((name) => {
            let value = Number(threshold[name]);
            if (!Number.isFinite(value) || value < 1) failures.push('OBSERVABILITY_THRESHOLD_INVALID');
        });
        if (!Number.isInteger(Number(threshold.trafficRejected)) || Number(threshold.trafficRejected) < 1) failures.push('OBSERVABILITY_THRESHOLD_INVALID');
        return { valid: failures.length === 0, failures: Array.from(new Set(failures)).sort() };
    },
    /** Returns a detached resolution snapshot with derived latency and hit-rate values. */
    snapshot: function () {
        let metrics = Object.assign({}, this._metrics || {}), resolutions = Number(metrics.resolutions || 0);
        metrics.averageLatencyMs = resolutions ? Number((Number(metrics.totalLatencyMs || 0) / resolutions).toFixed(3)) : 0;
        metrics.cacheHitPercent = resolutions ? Number((Number(metrics.cacheHits || 0) * 100 / resolutions).toFixed(3)) : 0;
        return metrics;
    },
    /** Aggregates nCache Storefront counters without disclosing tenant dimensions or operation keys. */
    cacheSnapshot: function () {
        let result = { available: this.cacheAvailable(), operations: {}, totalOperations: 0 };
        if (!SERVICE.DefaultCacheService || typeof SERVICE.DefaultCacheService.getCacheMetricsSnapshot !== 'function') return result;
        let snapshot = SERVICE.DefaultCacheService.getCacheMetricsSnapshot({ moduleName: 'storefront', channelName: 'context' });
        Object.keys(snapshot.operations || {}).forEach((key) => {
            let item = snapshot.operations[key], operation = item.operation || 'unknown';
            if (!result.operations[operation]) result.operations[operation] = { count: 0, results: {}, totalLatencyMs: 0, maximumLatencyMs: 0 };
            let target = result.operations[operation];
            target.count += Number(item.count || 0);
            target.totalLatencyMs += Number(item.totalLatencyMs || 0);
            target.maximumLatencyMs = Math.max(target.maximumLatencyMs, Number(item.maxLatencyMs || 0));
            Object.keys(item.results || {}).forEach((name) => { target.results[name] = (target.results[name] || 0) + Number(item.results[name] || 0); });
            result.totalOperations += Number(item.count || 0);
        });
        return result;
    },
    /** Derives stable low-disclosure operational state and alerts from effective policy and counters. */
    assess: function () {
        let configuration = this.validateConfiguration(), metrics = this.snapshot(), threshold = this.policy().thresholds || {};
        let alerts = configuration.failures.slice(), minimum = Number(threshold.minimumSamples === undefined ? 20 : threshold.minimumSamples);
        if (metrics.resolutions >= minimum && metrics.failures * 100 / Math.max(1, metrics.resolutions) >= Number(threshold.failurePercent === undefined ? 5 : threshold.failurePercent)) alerts.push('RESOLUTION_FAILURE_RATE');
        let cacheAttempts = metrics.cacheHits + metrics.negativeHits + metrics.cacheMisses + metrics.cacheErrors + metrics.contractMisses;
        if (cacheAttempts >= minimum && metrics.cacheErrors * 100 / Math.max(1, cacheAttempts) >= Number(threshold.cacheErrorPercent === undefined ? 10 : threshold.cacheErrorPercent)) alerts.push('CACHE_ERROR_RATE');
        if (metrics.traffic.rejected >= Number(threshold.trafficRejected === undefined ? 1 : threshold.trafficRejected)) alerts.push('TRAFFIC_CAPACITY_REJECTED');
        ['cms', 'store'].forEach((dependency) => {
            let item = metrics.dependencies[dependency];
            if (item.attempts >= minimum && item.failures * 100 / Math.max(1, item.attempts) >= Number(threshold.dependencyFailurePercent === undefined ? 10 : threshold.dependencyFailurePercent)) {
                alerts.push(dependency === 'cms' ? 'CMS_REFERENCE_FAILURE_RATE' : 'STORE_REFERENCE_FAILURE_RATE');
            }
        });
        if (metrics.averageLatencyMs >= Number(threshold.maximumAverageLatencyMs === undefined ? 250 : threshold.maximumAverageLatencyMs)) alerts.push('AVERAGE_LATENCY_HIGH');
        if (metrics.maximumLatencyMs >= Number(threshold.maximumObservedLatencyMs === undefined ? 2000 : threshold.maximumObservedLatencyMs)) alerts.push('MAXIMUM_LATENCY_HIGH');
        alerts = Array.from(new Set(alerts)).sort();
        let dependenciesReady = this.providerAvailable('DefaultStorefrontCmsSiteReferenceProviderService') && this.providerAvailable('DefaultStorefrontStoreReferenceProviderService');
        let state = !configuration.valid || !dependenciesReady ? 'NOT_READY' : alerts.length ? 'DEGRADED' : 'READY';
        return { state: state, alerts: alerts, checkedAt: new Date().toISOString() };
    },
    /** Returns authorized sanitized production diagnostics. */
    diagnostics: async function (request) {
        SERVICE.DefaultStorefrontManagementService.authorize(request);
        return {
            assessment: this.assess(),
            configuration: this.validateConfiguration(),
            dependencies: {
                cmsSiteReferenceProvider: {
                    status: this.providerAvailable('DefaultStorefrontCmsSiteReferenceProviderService') ? 'AVAILABLE' : 'UNAVAILABLE',
                    observations: this.snapshot().dependencies.cms
                },
                storeReferenceProvider: {
                    status: this.providerAvailable('DefaultStorefrontStoreReferenceProviderService') ? 'AVAILABLE' : 'UNAVAILABLE',
                    observations: this.snapshot().dependencies.store
                },
                contextCache: { status: this.cacheAvailable() ? 'AVAILABLE' : 'UNAVAILABLE' }
            },
            resolution: this.snapshot(),
            cache: this.cacheSnapshot(),
            traffic: SERVICE.DefaultStorefrontTrafficService && typeof SERVICE.DefaultStorefrontTrafficService.diagnostics === 'function'
                ? SERVICE.DefaultStorefrontTrafficService.diagnostics() : { active: 0, queued: 0, inFlightKeys: 0 }
        };
    }
};
