/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/service/cache/DefaultAiProviderReuseCacheService
 * @description Uses nCache for explicitly eligible response and embedding reuse without becoming spend authority.
 * @layer service
 * @owner aiProviders
 * @override Projects may narrow cache eligibility while preserving tenant scope and ledger independence.
 */
const crypto = require('crypto');

module.exports = {
    /** Builds a tenant/profile/provider/model/configuration-bound cache identity. */
    key: function (input) {
        return crypto.createHash('sha256').update(JSON.stringify({
            tenant: input.context.tenantCode || input.context.tenant,
            profileCode: input.profileCode, operation: input.operation,
            providerCode: input.providerCode, modelCode: input.modelCode,
            configurationRevision: input.context.configurationRevision,
            request: input.request
        })).digest('hex');
    },

    /** Returns cached normalized output only for explicitly deterministic requests. */
    get: function (input) {
        const policy = input.configuration.tokenOptimization.reuse;
        if (!policy || policy.enabled !== true || input.request.cacheEligible !== true) return Promise.resolve(undefined);
        const cache = input.context.reuseCache || (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService);
        if (!cache) return Promise.reject(new Error('AI provider reuse cache is unavailable'));
        return Promise.resolve(cache.get({
            moduleName: 'aiProviders',
            channelName: input.operation === 'embed' ? policy.embeddingChannelName : policy.responseChannelName,
            tenant: input.context.tenantCode || input.context.tenant,
            key: this.key(input)
        })).catch(error => error && error.code === 'ERR_CACHE_00001' ? undefined : Promise.reject(error));
    },

    /** Stores a bounded normalized result through nCache after successful reconciliation. */
    put: function (input, result) {
        const policy = input.configuration.tokenOptimization.reuse;
        if (!policy || policy.enabled !== true || input.request.cacheEligible !== true) return Promise.resolve(false);
        if (Buffer.byteLength(JSON.stringify(result)) > policy.maximumEntryBytes) return Promise.resolve(false);
        const cache = input.context.reuseCache || (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService);
        if (!cache) return Promise.reject(new Error('AI provider reuse cache is unavailable'));
        return Promise.resolve(cache.put({
            moduleName: 'aiProviders',
            channelName: input.operation === 'embed' ? policy.embeddingChannelName : policy.responseChannelName,
            tenant: input.context.tenantCode || input.context.tenant,
            key: this.key(input), value: result
        })).then(() => true);
    }
};
