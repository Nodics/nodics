/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/DefaultStorefrontTrafficService
 * @description Coalesces identical hostname resolutions and enforces runtime-configurable concurrency and queue bounds around the authoritative cache/resolver chain.
 * @layer service
 * @owner storefront
 * @override Deployments may replace scheduling while preserving opaque keys, bounded state, runtime policy reads, and cleanup after every outcome.
 */
module.exports = {
    _active: 0,
    _queue: [],
    _inFlight: new Map(),
    /** Initializes bounded Storefront traffic coordination state. */
    init: function () { this.reset(); return Promise.resolve(true); },
    /** Completes traffic coordination initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Reads effective traffic policy for every scheduling decision. */
    policy: function () { return ((CONFIG.get('storefront') || {}).traffic) || {}; },
    /** Returns the effective resolver without duplicating cache or persistence authority. */
    resolver: function () { return SERVICE.DefaultStorefrontContextCacheService || SERVICE.DefaultStorefrontContextService; },
    /** Returns a stable opaque key without retaining the hostname in process coordination state. */
    key: function (request) {
        let hostname = SERVICE.DefaultStorefrontContextService.requestHostname(request);
        return SERVICE.DefaultStorefrontContextCacheService
            ? SERVICE.DefaultStorefrontContextCacheService.buildKey(hostname)
            : SERVICE.DefaultStorefrontEndpointFoundationService.normalizeHostname(hostname);
    },
    /** Resolves through coalescing and bounded scheduling using the latest effective runtime policy. */
    resolve: function (request) {
        let policy = this.policy();
        if (policy.enabled === false) return this.resolver().resolve(request);
        let key = this.key(request);
        if (policy.coalescingEnabled !== false && this._inFlight.has(key)) {
            this.observe('coalesced');
            return this._inFlight.get(key);
        }
        if (this._inFlight.size >= Math.max(1, Number(policy.maximumInFlightKeys || 512))) return this.reject('IN_FLIGHT_KEY_LIMIT', request);
        let execution = this.schedule(() => this.resolver().resolve(request), request);
        if (policy.coalescingEnabled !== false) {
            this._inFlight.set(key, execution);
            execution.finally(() => this._inFlight.delete(key)).catch(() => false);
        }
        return execution;
    },
    /** Runs immediately within the concurrency bound or enters the bounded FIFO queue. */
    schedule: function (operation, request) {
        let policy = this.policy(), concurrent = Math.max(1, Number(policy.maximumConcurrentResolutions || 64));
        if (this._active < concurrent) return this.execute(operation);
        if (this._queue.length >= Math.max(0, Number(policy.maximumQueuedResolutions || 256))) return this.reject('TRAFFIC_QUEUE_FULL', request);
        this.observe('queued');
        return new Promise((resolve, reject) => this._queue.push({ operation: operation, resolve: resolve, reject: reject }));
    },
    /** Executes one scheduled operation and drains the queue after success or failure. */
    execute: function (operation) {
        this._active += 1;
        this.observe('started');
        return Promise.resolve().then(operation).finally(() => {
            this._active = Math.max(0, this._active - 1);
            this.drain();
        });
    },
    /** Drains queued work according to the latest runtime concurrency value. */
    drain: function () {
        let concurrent = Math.max(1, Number(this.policy().maximumConcurrentResolutions || 64));
        while (this._queue.length && this._active < concurrent) {
            let item = this._queue.shift();
            this.execute(item.operation).then(item.resolve, item.reject);
        }
        return true;
    },
    /** Rejects excess work with a stable service-unavailable contract. */
    reject: function (reason, request) {
        this.observe('rejected', reason);
        if (SERVICE.DefaultStorefrontContractService) SERVICE.DefaultStorefrontContractService.applyRetryAfter(request);
        return Promise.reject(SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00014', 'Storefront resolution capacity is temporarily unavailable'));
    },
    /** Records bounded traffic outcomes through Storefront observability when active. */
    observe: function (outcome, reason) {
        if (SERVICE.DefaultStorefrontObservabilityService && typeof SERVICE.DefaultStorefrontObservabilityService.recordTrafficOutcome === 'function') {
            SERVICE.DefaultStorefrontObservabilityService.recordTrafficOutcome(outcome, reason);
        }
        return true;
    },
    /** Returns sanitized scheduler state without keys or queued request data. */
    diagnostics: function () { return { active: this._active, queued: this._queue.length, inFlightKeys: this._inFlight.size }; },
    /** Clears process-local state for isolated testing and lifecycle initialization. */
    reset: function () { this._active = 0; this._queue = []; this._inFlight = new Map(); return true; }
};
