/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module nCache/cache/service/rate/DefaultRateLimitService
 * @description Enforces tenant-scoped operation limits through cache adapters that provide atomic bounded increments.
 * @layer service
 * @owner nCache/cache
 * @override Customer modules may replace key derivation or limit behavior while preserving tenant isolation, atomicity, and fail-closed production semantics.
 */
module.exports = {
    /** Enforces one configured limit and returns a safe counter projection. */
    enforce: async function (options) {
        this.validate(options);
        const moduleName = options.moduleName || 'cache';
        const channelName = options.channelName || 'rateLimit';
        const channel = SERVICE.DefaultCacheEngineService.getCacheEngine(moduleName, channelName);
        if (!channel) throw this.error('ERR_CACHE_00012');

        const capabilities = channel.engineOptions && channel.engineOptions.capabilities || {};
        const distributed = capabilities.distributed === true || channel.engineOptions && channel.engineOptions.distributed === true;
        if (options.requireDistributed === true && !distributed) throw this.error('ERR_CACHE_00012');
        if (capabilities.atomicBoundedIncrement !== true && channel.engineOptions.atomicBoundedIncrement !== true) {
            throw this.error('ERR_CACHE_00012');
        }

        const result = await SERVICE.DefaultCacheService.incrementBounded({
            moduleName,
            channelName,
            tenant: options.tenant,
            key: this.createKey(options),
            amount: 1,
            maximum: options.limit,
            ttl: options.windowSeconds
        });
        if (!result.allowed) {
            const error = this.error('ERR_CACHE_00011');
            error.retryAfterSeconds = options.windowSeconds;
            error.limit = options.limit;
            throw error;
        }
        return {
            allowed: true,
            limit: options.limit,
            remaining: Math.max(options.limit - result.value, 0),
            windowSeconds: options.windowSeconds,
            distributed
        };
    },

    /** Creates a non-reversible storage key without leaking the subject identifier. */
    createKey: function (options) {
        const identity = typeof options.identity === 'string' ? options.identity : JSON.stringify(options.identity);
        const digest = crypto.createHash(options.hashAlgorithm || 'sha256').update(identity).digest('hex');
        return ['rate', options.tenant, options.capability, options.operation, digest].join(':');
    },

    /**

     * Validates the module artifact within the cache-owned layered contract.

     *

     * @param {*} options Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    validate: function (options) {
        if (!options || !options.tenant || !options.capability || !options.operation || options.identity === undefined || options.identity === null) {
            throw this.error('ERR_CACHE_00009');
        }
        if (!Number.isInteger(options.limit) || options.limit <= 0 || !Number.isInteger(options.windowSeconds) || options.windowSeconds <= 0) {
            throw this.error('ERR_CACHE_00009');
        }
    },

    /**

     * Executes the error operation within the cache-owned layered contract.

     *

     * @param {*} code Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    error: function (code) {
        const error = new Error(code);
        error.code = code;
        return error;
    }
};
