/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/availability/DefaultBackofficeAvailabilityService
 * @description Observes bounded public runtime readiness asynchronously and aggregates module availability without replacing target health authority.
 * @layer service
 * @owner backoffice
 * @override Projects may replace polling policy while preserving exact-origin safety, freshness, low disclosure, and non-blocking registration.
 */
module.exports = {
    _observations: new Map(),
    _inflight: new Map(),
    _metrics: { attempts: 0, successes: 0, failures: 0, transitions: 0, lastSuccessAt: null, lastFailureAt: null, lastFailureCode: null },

    /** Initializes the availability observer. */
    init: function () { return Promise.resolve(true); },
    /** Completes availability observer initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered health-observation policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).availability || {}; },
    /** Returns the stable process-instance observation key. */
    getKey: function (registration) { return String(registration && registration.instanceId || ''); },
    /** Returns the target module's low-disclosure readiness status without retaining its response. */
    observe: async function (registration) {
        let key = this.getKey(registration);
        if (!key || !registration.clientCallable || !registration.endpoint) return false;
        let policy = this.getConfiguration();
        this._metrics.attempts++;
        let previous = this._observations.get(key);
        let attemptedAt = new Date().toISOString();
        try {
            let endpointPolicy = SERVICE.DefaultBackofficeDiscoveryService;
            if (!endpointPolicy || typeof endpointPolicy.buildObservedUrl !== 'function') throw new Error('BackOffice endpoint policy is unavailable');
            let uri = endpointPolicy.buildObservedUrl(registration, registration.healthPath || '/nodics/system/v0/health/ready', policy.allowedHosts || []);
            let request = SERVICE.DefaultModuleService.buildExternalRequest({ uri: uri, methodName: 'GET', timeoutMs: Number(policy.timeoutMs || 1000),
                maxAttempts: 1, maxResponseBytes: Number(policy.maxResponseBytes || 65536), followRedirects: policy.allowRedirects === true });
            let response = await SERVICE.DefaultModuleService.fetch(request);
            let data = response && response.data || response;
            let state = data && data.status === 'UP' ? 'UP' : 'UNAVAILABLE';
            let observation = { instanceId: key, state: state, attemptedAt: attemptedAt, observedAt: new Date().toISOString() };
            this.recordTransition(previous, observation);
            this._observations.set(key, observation);
            if (state === 'UP') {
                this._metrics.successes++;
                this._metrics.lastSuccessAt = observation.observedAt;
            } else {
                this._metrics.failures++;
                this._metrics.lastFailureAt = observation.observedAt;
                this._metrics.lastFailureCode = 'READINESS_NOT_UP';
            }
            return observation;
        } catch (error) {
            let observation = { instanceId: key, state: 'UNAVAILABLE', attemptedAt: attemptedAt, observedAt: new Date().toISOString(),
                failureCode: error.code || error.name || 'HEALTH_OBSERVATION_FAILED' };
            this.recordTransition(previous, observation);
            this._observations.set(key, observation);
            this._metrics.failures++;
            this._metrics.lastFailureAt = observation.observedAt;
            this._metrics.lastFailureCode = observation.failureCode;
            return observation;
        }
    },
    /** Counts state transitions without exposing target responses or endpoints. */
    recordTransition: function (previous, current) {
        if (previous && previous.state !== current.state) this._metrics.transitions++;
    },
    /** Schedules one deduplicated refresh without delaying registration or module traffic. */
    scheduleObservation: function (registration) {
        let policy = this.getConfiguration();
        if (policy.enabled === false || !registration || !registration.clientCallable) return Promise.resolve(false);
        let key = this.getKey(registration);
        let previous = this._observations.get(key);
        let refreshIntervalMs = Math.max(1, Number(policy.refreshIntervalMs || 10000));
        if (previous && Date.now() - Date.parse(previous.attemptedAt) < refreshIntervalMs) return Promise.resolve(false);
        if (this._inflight.has(key)) return this._inflight.get(key);
        let promise = Promise.resolve().then(() => this.observe(registration)).finally(() => this._inflight.delete(key));
        this._inflight.set(key, promise);
        return promise;
    },
    /** Removes process-instance state after its final lease is removed or expires. */
    removeInstance: function (instanceId) { return this._observations.delete(String(instanceId || '')); },
    /** Returns one fresh instance state, treating missing or stale observations as unknown. */
    getInstanceState: function (instanceId) {
        let observation = this._observations.get(String(instanceId || ''));
        if (!observation) return 'UNKNOWN';
        let staleAfterMs = Math.max(1, Number(this.getConfiguration().staleAfterMs || 30000));
        return Date.now() - Date.parse(observation.observedAt) > staleAfterMs ? 'UNKNOWN' : observation.state;
    },
    /** Aggregates module state across currently valid observed runtime instances. */
    getModuleAvailability: function (instances) {
        let states = (instances || []).map(instance => this.getInstanceState(instance.instanceId));
        let up = states.filter(state => state === 'UP').length;
        let unavailable = states.filter(state => state === 'UNAVAILABLE').length;
        let unknown = states.filter(state => state === 'UNKNOWN').length;
        let state = states.length === 0 || unknown === states.length ? 'UNKNOWN' :
            up === states.length ? 'UP' : up > 0 ? 'DEGRADED' : unavailable > 0 && unknown === 0 ? 'UNAVAILABLE' : 'UNKNOWN';
        return { state: state, activeInstances: states.length, healthyInstances: up,
            unavailableInstances: unavailable, unknownInstances: unknown };
    },
    /** Returns low-disclosure counters for secured BackOffice diagnostics. */
    getDiagnostics: function () {
        return { trackedInstances: this._observations.size, inflight: this._inflight.size, metrics: Object.assign({}, this._metrics) };
    }
};
