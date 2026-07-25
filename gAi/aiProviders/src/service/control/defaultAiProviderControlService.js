/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/control/defaultAiProviderControlService
 * @description Enforces layered emergency stops and nCache-backed request limits before provider invocation.
 * @layer service
 * @owner aiProviders
 * @override Projects may add governed dimensions while preserving fail-closed evaluation and nCache authority.
 */
module.exports = {
    /** Rejects a request when any applicable configured emergency stop is active. */
    assertEnabled: function (input) {
        const switches = input.configuration.controls.killSwitches;
        const context = input.context || {};
        const checks = [
            ['global', 'global', switches.global],
            ['tenant', context.tenantCode || context.tenant, switches.tenants],
            ['enterprise', context.enterpriseCode, switches.enterprises],
            ['application', context.applicationCode, switches.applications],
            ['principal', context.principalCode, switches.principals],
            ['profile', input.profileCode, switches.profiles],
            ['provider', input.providerCode, switches.providers],
            ['model', input.modelCode, switches.models],
            ['capability', input.capability, switches.capabilities]
        ];
        const stopped = checks.find(check => check[2] === true ||
            (check[1] && check[2] && check[2][check[1]] === true));
        if (stopped) throw new Error('AI provider operation is disabled by ' + stopped[0] + ' kill switch');
        return true;
    },

    /** Consumes one fixed-window request permit through nCache's atomic bounded counter. */
    acquireRateLimit: function (input) {
        const policy = input.configuration.controls.rateLimit;
        const context = input.context || {};
        const cacheService = context.rateLimitCache ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService);
        if (!cacheService || typeof cacheService.incrementBounded !== 'function') {
            return Promise.reject(new Error('AI rate-limit cache is unavailable'));
        }
        const values = {
            tenantCode: context.tenantCode || context.tenant || 'default',
            enterpriseCode: context.enterpriseCode || '_',
            applicationCode: context.applicationCode || '_',
            principalCode: context.principalCode || '_',
            profileCode: input.profileCode,
            providerCode: input.providerCode,
            modelCode: input.modelCode,
            capability: input.capability
        };
        const window = Math.floor(Date.now() / (policy.windowSeconds * 1000));
        const key = ['ai-rate', window].concat(policy.scopeDimensions.map(name => values[name] || '_')).join(':');
        return Promise.resolve(cacheService.incrementBounded({
            moduleName: 'aiProviders',
            channelName: policy.channelName,
            tenant: values.tenantCode,
            key: key,
            amount: 1,
            maximum: policy.maximumRequests,
            ttl: policy.windowSeconds
        })).then(result => {
            if (!result || result.allowed !== true) throw new Error('AI provider rate limit exceeded');
            return { key: key, used: result.value, maximum: result.maximum, windowSeconds: policy.windowSeconds };
        });
    },

    /** Applies emergency-stop and rate-limit controls in their fail-fast order. */
    authorize: function (input) {
        try {
            this.assertEnabled(input);
            return this.acquireRateLimit(input);
        } catch (error) {
            return Promise.reject(error);
        }
    }
};
