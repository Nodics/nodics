/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/src/service/resilience/defaultAiProviderCircuitBreakerService
 * @description Enforces provider circuit state through the configured nCache authority.
 * @layer service
 * @owner aiProviders
 * @override Projects may tune policy or cache engines while preserving atomic probes and fail-closed behavior.
 */
module.exports = {
    /** Returns the configured cache authority or fails closed. */
    cache: function (context) {
        const cache = context && (context.circuitBreakerCache || context.rateLimitCache) ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService);
        if (!cache || typeof cache.get !== 'function' || typeof cache.put !== 'function' ||
            typeof cache.incrementBounded !== 'function' || typeof cache.flushCache !== 'function') {
            throw new Error('AI circuit-breaker cache is unavailable');
        }
        return cache;
    },

    /** Builds bounded configuration-owned circuit keys without principal or prompt input. */
    keys: function (input) {
        const base = [input.profileCode, input.providerCode, input.capability].map(String).join(':');
        return { state: 'circuit:' + base, failures: 'circuit-failures:' + base, probe: 'circuit-probe:' + base };
    },

    /** Checks closed/open/half-open state and atomically grants at most the configured probe count. */
    beforeAttempt: async function (input) {
        const policy = input.configuration.resilience.circuitBreaker;
        if (policy.enabled !== true) return { state: 'DISABLED' };
        const cache = this.cache(input.context);
        const keys = this.keys(input);
        let state;
        try {
            state = await cache.get({
                moduleName: 'aiProviders', channelName: policy.channelName,
                tenant: input.context.tenantCode || input.context.tenant, key: keys.state
            });
        } catch (error) {
            if (!error || error.code !== 'ERR_CACHE_00001') throw error;
        }
        if (!state) return { state: 'CLOSED', keys: keys };
        if (Date.now() < Number(state.openUntil || 0)) throw this.openError();
        const probe = await cache.incrementBounded({
            moduleName: 'aiProviders', channelName: policy.channelName,
            tenant: input.context.tenantCode || input.context.tenant, key: keys.probe,
            amount: 1, maximum: policy.halfOpenMaximumCalls, ttl: policy.halfOpenProbeSeconds
        });
        if (!probe || probe.allowed !== true) throw this.openError();
        return { state: 'HALF_OPEN', keys: keys };
    },

    /** Records a normalized failure and opens or reopens the circuit at the threshold. */
    recordFailure: async function (input, permit, error) {
        const policy = input.configuration.resilience.circuitBreaker;
        if (policy.enabled !== true || !error || error.aiProviderNormalized !== true) return false;
        const cache = this.cache(input.context);
        const keys = permit && permit.keys || this.keys(input);
        const count = await cache.incrementBounded({
            moduleName: 'aiProviders', channelName: policy.channelName,
            tenant: input.context.tenantCode || input.context.tenant, key: keys.failures,
            amount: 1, maximum: policy.failureThreshold, ttl: policy.samplingWindowSeconds
        });
        if (permit && permit.state === 'HALF_OPEN' || !count.allowed || count.value >= policy.failureThreshold) {
            await cache.put({
                moduleName: 'aiProviders', channelName: policy.channelName,
                tenant: input.context.tenantCode || input.context.tenant, key: keys.state,
                value: { state: 'OPEN', openUntil: Date.now() + policy.openSeconds * 1000 },
                ttl: policy.openSeconds + policy.halfOpenProbeSeconds
            });
            return true;
        }
        return false;
    },

    /** Closes the circuit after a successful call and removes stale counters/probes. */
    recordSuccess: function (input, permit) {
        const policy = input.configuration.resilience.circuitBreaker;
        if (policy.enabled !== true) return Promise.resolve(false);
        const keys = permit && permit.keys || this.keys(input);
        return Promise.resolve(this.cache(input.context).flushCache({
            moduleName: 'aiProviders', channelName: policy.channelName,
            tenant: input.context.tenantCode || input.context.tenant,
            keys: [keys.state, keys.failures, keys.probe]
        })).then(() => true);
    },

    /** Creates a safe retryable routing signal without claiming provider invocation. */
    openError: function () {
        const error = new Error('AI_PROVIDER_CIRCUIT_OPEN');
        error.name = 'AiProviderError';
        error.code = 'AI_PROVIDER_CIRCUIT_OPEN';
        error.retryable = true;
        error.aiProviderNormalized = true;
        error.circuitOpen = true;
        error.providerDiagnostics = Object.freeze({
            category: 'CIRCUIT', retryable: true, status: undefined
        });
        return error;
    }
};
