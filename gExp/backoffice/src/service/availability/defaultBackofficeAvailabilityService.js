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
    _moduleStates: new Map(),
    _moduleTransitions: new Map(),
    _instanceModules: new Map(),
    _moduleRegistrations: new Map(),
    _queue: [],
    _activeObservations: 0,
    _metrics: { attempts: 0, successes: 0, failures: 0, readinessFailures: 0, transportFailures: 0,
        timeouts: 0, staleReads: 0, suppressedRefreshes: 0, inflightDeduplications: 0, queued: 0,
        queueRejected: 0, maxConcurrentObserved: 0, transitions: 0,
        publicationAttempts: 0, publicationSuccesses: 0, publicationFailures: 0, totalDurationMs: 0,
        maxDurationMs: 0, lastDurationMs: 0, lastSuccessAt: null, lastFailureAt: null, lastFailureCode: null },

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
        let startedAt = Date.now();
        try {
            let endpointPolicy = SERVICE.DefaultBackofficeDiscoveryService;
            if (!endpointPolicy || typeof endpointPolicy.buildObservedUrl !== 'function') throw new Error('BackOffice endpoint policy is unavailable');
            let uri = endpointPolicy.buildObservedUrl(registration, registration.healthPath || '/nodics/system/v0/health/ready', policy.allowedHosts || []);
            let request = SERVICE.DefaultModuleService.buildExternalRequest({ uri: uri, methodName: 'GET', timeoutMs: Number(policy.timeoutMs || 1000),
                maxAttempts: 1, maxResponseBytes: Number(policy.maxResponseBytes || 65536), followRedirects: policy.allowRedirects === true });
            let response = await SERVICE.DefaultModuleService.fetch(request);
            let data = response && response.data || response;
            let state = data && data.status === 'UP' ? 'UP' : 'UNAVAILABLE';
            let observation = { moduleName: String(registration.moduleName), instanceId: key, state: state,
                attemptedAt: attemptedAt, observedAt: new Date().toISOString(),
                failureCode: state === 'UP' ? undefined : 'READINESS_NOT_UP' };
            this._observations.set(key, observation);
            this.recordTransition(previous, observation, registration);
            if (state === 'UP') {
                this._metrics.successes++;
                this._metrics.lastSuccessAt = observation.observedAt;
            } else {
                this._metrics.failures++;
                this._metrics.readinessFailures++;
                this._metrics.lastFailureAt = observation.observedAt;
                this._metrics.lastFailureCode = 'READINESS_NOT_UP';
            }
            return observation;
        } catch (error) {
            let failureCode = this.normalizeFailureCode(error);
            let observation = { moduleName: String(registration.moduleName), instanceId: key, state: 'UNAVAILABLE',
                attemptedAt: attemptedAt, observedAt: new Date().toISOString(),
                failureCode: failureCode };
            this._observations.set(key, observation);
            this.recordTransition(previous, observation, registration);
            this._metrics.failures++;
            this._metrics.transportFailures++;
            if (failureCode === 'OBSERVATION_TIMEOUT') this._metrics.timeouts++;
            this._metrics.lastFailureAt = observation.observedAt;
            this._metrics.lastFailureCode = observation.failureCode;
            return observation;
        } finally {
            let durationMs = Math.max(0, Date.now() - startedAt);
            this._metrics.lastDurationMs = durationMs;
            this._metrics.totalDurationMs += durationMs;
            this._metrics.maxDurationMs = Math.max(this._metrics.maxDurationMs, durationMs);
        }
    },
    /** Converts transport failures into bounded operational codes. */
    normalizeFailureCode: function (error) {
        let code = String(error && (error.code || error.name) || '').toUpperCase();
        return code.includes('TIMEOUT') || code === 'ETIMEDOUT' ? 'OBSERVATION_TIMEOUT' : 'HEALTH_OBSERVATION_FAILED';
    },
    /** Schedules serialized module aggregation after an instance observation. */
    recordTransition: function (previous, current, registration) {
        let key = this.getKey(registration);
        let modules = this._instanceModules.get(key) || new Set([String(registration && registration.moduleName || '')]);
        modules.forEach(moduleName => {
            if (!moduleName) return;
            let effectiveRegistration = this._moduleRegistrations.get(moduleName) && this._moduleRegistrations.get(moduleName).get(key) || registration;
            let prior = this._moduleTransitions.get(moduleName) || Promise.resolve();
            let pending = prior.then(() => this.evaluateModuleTransition(effectiveRegistration)).catch(() => false)
                .finally(() => { if (this._moduleTransitions.get(moduleName) === pending) this._moduleTransitions.delete(moduleName); });
            this._moduleTransitions.set(moduleName, pending);
        });
        return true;
    },
    /** Aggregates current leases and publishes only genuine module-state changes. */
    evaluateModuleTransition: async function (registration) {
        let moduleName = String(registration.moduleName);
        let instances = [registration];
        let registry = SERVICE.DefaultBackofficeRegistryService;
        if (registry && typeof registry.getStore === 'function') {
            let entries = await registry.getStore().values();
            instances = entries.map(entry => entry.value).filter(value => value.moduleName === moduleName);
        }
        let current = this.getModuleAvailability(instances);
        let trigger = this._observations.get(this.getKey(registration));
        if (trigger && trigger.failureCode) current.failureCode = trigger.failureCode;
        let previous = this._moduleStates.get(moduleName);
        this._moduleStates.set(moduleName, current);
        let events = this.getConfiguration().events || {};
        let changed = previous ? previous.state !== current.state : events.emitInitialState === true;
        if (!changed) return false;
        this._metrics.transitions++;
        return this.publishTransition(registration, previous, current);
    },
    /** Publishes one sanitized operational transition through the configured Nodics event capability. */
    publishTransition: async function (registration, previous, current) {
        let events = this.getConfiguration().events || {};
        if (events.enabled === false) return false;
        let publisher = SERVICE[events.publisherService || 'DefaultEventService'];
        if (!publisher || typeof publisher.publish !== 'function') return false;
        let data = {
            moduleName: String(registration && registration.moduleName || ''),
            instanceId: this.getKey(registration),
            environment: registration && registration.environment,
            server: registration && registration.server,
            node: registration && registration.node,
            previousState: previous ? previous.state : 'UNKNOWN',
            currentState: current.state,
            reasonCode: current.failureCode,
            activeInstances: current.activeInstances,
            healthyInstances: current.healthyInstances,
            unavailableInstances: current.unavailableInstances,
            unknownInstances: current.unknownInstances,
            observedAt: new Date().toISOString()
        };
        Object.keys(data).forEach(key => { if (data[key] === undefined || data[key] === null || data[key] === '') delete data[key]; });
        this._metrics.publicationAttempts++;
        try {
            await publisher.publish({ tenant: CONFIG.get('defaultTenant') || 'default', active: true,
                event: events.eventName || 'backoffice.availability.changed', sourceName: 'backoffice',
                sourceId: typeof NODICS !== 'undefined' && NODICS.getNodeName ? NODICS.getNodeName() || 'default' : 'default',
                target: events.target || 'backoffice', state: 'NEW', type: events.type || 'ASYNC',
                targetType: typeof ENUMS !== 'undefined' && ENUMS.TargetType && ENUMS.TargetType.MODULE ? ENUMS.TargetType.MODULE.key : 'MODULE', data: data });
            this._metrics.publicationSuccesses++;
            return true;
        } catch (error) {
            this._metrics.publicationFailures++;
            if (this.LOG && this.LOG.warn) this.LOG.warn('BackOffice availability transition publication failed', {
                moduleName: data.moduleName, instanceId: data.instanceId, code: 'AVAILABILITY_EVENT_PUBLICATION_FAILED'
            });
            return false;
        }
    },
    /** Schedules one deduplicated refresh without delaying registration or module traffic. */
    scheduleObservation: function (registration) {
        let policy = this.getConfiguration();
        if (policy.enabled === false || !registration || !registration.clientCallable) return Promise.resolve(false);
        let key = this.getKey(registration);
        if (!this._instanceModules.has(key)) this._instanceModules.set(key, new Set());
        let moduleName = String(registration.moduleName || '');
        this._instanceModules.get(key).add(moduleName);
        if (!this._moduleRegistrations.has(moduleName)) this._moduleRegistrations.set(moduleName, new Map());
        this._moduleRegistrations.get(moduleName).set(key, Object.assign({}, registration));
        let previous = this._observations.get(key);
        let refreshIntervalMs = Math.max(1, Number(policy.refreshIntervalMs || 10000));
        if (previous && previous.state === 'UNAVAILABLE') refreshIntervalMs = Math.min(Number(policy.maxFailureBackoffMs || 60000),
            refreshIntervalMs * Math.max(1, Number(policy.failureBackoffMultiplier || 2)));
        if (previous && Date.now() - Date.parse(previous.attemptedAt) < refreshIntervalMs) {
            this._metrics.suppressedRefreshes++;
            return Promise.resolve(false);
        }
        if (this._inflight.has(key)) {
            this._metrics.inflightDeduplications++;
            return this._inflight.get(key);
        }
        if (this._queue.length >= Number(policy.maxQueuedObservations || 10000)) {
            this._metrics.queueRejected++;
            this.removeScheduledRegistration(key, moduleName);
            return Promise.resolve(false);
        }
        let promise = this.enqueueObservation(registration).finally(() => this._inflight.delete(key));
        this._inflight.set(key, promise);
        return promise;
    },
    /** Removes registration metadata for work rejected before observation, preventing queue-pressure leaks. */
    removeScheduledRegistration: function (instanceId, moduleName) {
        let modules = this._instanceModules.get(instanceId);
        if (modules) { modules.delete(moduleName); if (modules.size === 0) this._instanceModules.delete(instanceId); }
        let registrations = this._moduleRegistrations.get(moduleName);
        if (registrations) { registrations.delete(instanceId); if (registrations.size === 0) this._moduleRegistrations.delete(moduleName); }
    },
    /** Runs or queues one observation under the layered process concurrency ceiling. */
    enqueueObservation: function (registration) {
        let limit = Math.max(1, Number(this.getConfiguration().maxConcurrentObservations || 32));
        if (this._activeObservations < limit) return this.runObservation(registration);
        this._metrics.queued++;
        return new Promise((resolve, reject) => this._queue.push({ registration: registration, resolve: resolve, reject: reject }));
    },
    /** Executes one queued observation and drains the next item without blocking registration traffic. */
    runObservation: function (registration) {
        this._activeObservations++;
        this._metrics.maxConcurrentObserved = Math.max(this._metrics.maxConcurrentObserved, this._activeObservations);
        return Promise.resolve().then(() => this.observe(registration)).finally(() => {
            this._activeObservations--;
            let next = this._queue.shift();
            if (next) this.runObservation(next.registration).then(next.resolve, next.reject);
        });
    },
    /** Removes process-instance state after its final lease is removed or expires. */
    removeInstance: function (instanceId) {
        let key = String(instanceId || '');
        let removed = this._observations.delete(key);
        let modules = this._instanceModules.get(key) || new Set();
        this._instanceModules.delete(key);
        modules.forEach(moduleName => {
            if (this._moduleRegistrations.has(moduleName)) {
                this._moduleRegistrations.get(moduleName).delete(key);
                if (this._moduleRegistrations.get(moduleName).size === 0) this._moduleRegistrations.delete(moduleName);
            }
            if (!Array.from(this._instanceModules.values()).some(names => names.has(moduleName))) this._moduleStates.delete(moduleName);
        });
        return removed;
    },
    /** Removes only process-local observations absent from the authoritative active lease snapshot. */
    reconcileActiveInstances: function (instanceIds) {
        let active = new Set((instanceIds || []).map(String));
        let removed = 0;
        Array.from(this._observations.keys()).forEach(instanceId => { if (!active.has(instanceId) && this.removeInstance(instanceId)) removed++; });
        return removed;
    },
    /** Returns one fresh instance state, treating missing or stale observations as unknown. */
    getInstanceState: function (instanceId) {
        let observation = this._observations.get(String(instanceId || ''));
        if (!observation) return 'UNKNOWN';
        let staleAfterMs = Math.max(1, Number(this.getConfiguration().staleAfterMs || 30000));
        if (Date.now() - Date.parse(observation.observedAt) > staleAfterMs) {
            this._metrics.staleReads++;
            return 'UNKNOWN';
        }
        return observation.state;
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
        return { trackedInstances: this._observations.size, trackedModules: this._moduleStates.size,
            inflight: this._inflight.size, queued: this._queue.length, activeObservations: this._activeObservations,
            inflightTransitions: this._moduleTransitions.size, metrics: Object.assign({}, this._metrics) };
    }
};
