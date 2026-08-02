/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/src/service/config/defaultAiProviderConfigurationService
 * @description Validates effective AI provider profiles and creates immutable secret-safe snapshots.
 * @layer service
 * @owner aiProviders
 * @override Later modules may strengthen validation while preserving gateway and secret invariants.
 */
const allowedKeys = ['contractVersion', 'enabled', 'configuration', 'profiles', 'providers',
    'resilience', 'observability', 'controls', 'tokenOptimization', 'pricing', 'ledger', 'security'];
const forbiddenSecretNames = ['apikey', 'accesstoken', 'credential', 'password', 'privatekey', 'secret', 'token'];

function transform(value, redact) {
    if (Array.isArray(value)) return value.map(item => transform(item, redact));
    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((result, key) => {
            result[key] = redact && key === 'secretReference' && value[key] ?
                '[SECRET_REFERENCE]' : transform(value[key], redact);
            return result;
        }, {});
    }
    return value;
}

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.keys(value).forEach(key => deepFreeze(value[key]));
    }
    return value;
}

function assertNoInlineSecrets(value, path) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(key => {
        const normalizedKey = key.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
        const childPath = path ? path + '.' + key : key;
        if (key !== 'secretReference' &&
            forbiddenSecretNames.some(name => normalizedKey.endsWith(name)) &&
            value[key] !== undefined) {
            throw new Error('AI provider configuration contains forbidden inline secret property: ' + childPath);
        }
        assertNoInlineSecrets(value[key], childPath);
    });
}

module.exports = {
    /** Validates the already-merged `aiProviders` configuration subtree. */
    validate: function (configuration) {
        if (!configuration || configuration.contractVersion !== 1) {
            throw new Error('AI provider configuration contractVersion must be 1');
        }
        if (configuration.configuration && configuration.configuration.rejectUnknownKeys === true) {
            const unknownKeys = Object.keys(configuration).filter(key => !allowedKeys.includes(key));
            if (unknownKeys.length) throw new Error('Unknown AI provider configuration keys: ' + unknownKeys.join(', '));
        }
        if (!configuration.security || configuration.security.allowCallerProviderOverride !== false ||
            configuration.security.allowInlineSecrets !== false ||
            configuration.security.requireSecretReference !== true ||
            configuration.security.allowProviderNativeTools !== false) {
            throw new Error('AI provider gateway security invariants cannot be weakened by configuration');
        }
        if (!configuration.tokenOptimization || configuration.tokenOptimization.enabled !== true ||
            configuration.tokenOptimization.failClosed !== true ||
            configuration.tokenOptimization.requireProviderEstimator !== true ||
            configuration.tokenOptimization.requireReservation !== true) {
            throw new Error('AI token estimation and budget reservation must remain fail closed');
        }
        if (!Number.isInteger(configuration.tokenOptimization.costScale) ||
            configuration.tokenOptimization.costScale < 0 || configuration.tokenOptimization.costScale > 18) {
            throw new Error('AI token costScale must be an integer from 0 to 18');
        }
        const reuse = configuration.tokenOptimization.reuse;
        if (!reuse || !Number.isSafeInteger(reuse.maximumEntryBytes) || reuse.maximumEntryBytes < 1 ||
            !reuse.responseChannelName || !reuse.embeddingChannelName) {
            throw new Error('AI provider reuse-cache configuration is invalid');
        }
        const alerts = configuration.tokenOptimization.alerts;
        if (!alerts || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(
            String(alerts.maximumActualCostPerAttempt)) || !alerts.eventTarget || !alerts.eventName) {
            throw new Error('AI provider usage-alert configuration is invalid');
        }
        Object.keys(configuration.profiles || {}).forEach(profileCode => {
            const profile = configuration.profiles[profileCode];
            if (!profile || !['GENERATION', 'EMBEDDING'].includes(profile.capability)) {
                throw new Error('AI provider profile has unsupported capability: ' + profileCode);
            }
            if (profile.fallbackProviders && !Array.isArray(profile.fallbackProviders)) {
                throw new Error('AI provider fallbackProviders must be an array: ' + profileCode);
            }
        });
        Object.keys(configuration.providers || {}).forEach(providerCode => {
            const provider = configuration.providers[providerCode];
            if (provider && provider.enabled === true && !provider.secretReference) {
                throw new Error('Enabled AI provider requires a secretReference: ' + providerCode);
            }
        });
        const controls = configuration.controls;
        const circuitBreaker = configuration.resilience && configuration.resilience.circuitBreaker;
        if (!circuitBreaker || circuitBreaker.enabled !== true || !circuitBreaker.channelName) {
            throw new Error('AI provider circuit breaker must remain enabled');
        }
        ['failureThreshold', 'samplingWindowSeconds', 'openSeconds',
            'halfOpenMaximumCalls', 'halfOpenProbeSeconds'].forEach(key => {
            if (!Number.isSafeInteger(circuitBreaker[key]) || circuitBreaker[key] < 1) {
                throw new Error('AI provider circuit breaker requires a positive safe integer: ' + key);
            }
        });
        const observability = configuration.observability;
        if (!observability || observability.enabled !== true ||
            !Number.isSafeInteger(observability.maximumSeries) || observability.maximumSeries < 1 ||
            observability.maximumSeries > 1000) {
            throw new Error('AI provider observability requires a bounded maximumSeries');
        }
        if (!controls || controls.failClosed !== true || !controls.killSwitches ||
            !controls.rateLimit || controls.rateLimit.enabled !== true ||
            !Number.isSafeInteger(controls.rateLimit.windowSeconds) || controls.rateLimit.windowSeconds < 1 ||
            !Number.isSafeInteger(controls.rateLimit.maximumRequests) || controls.rateLimit.maximumRequests < 1 ||
            !Array.isArray(controls.rateLimit.scopeDimensions) || !controls.rateLimit.scopeDimensions.length) {
            throw new Error('AI operational controls and rate limiting must remain enabled and fail closed');
        }
        Object.keys(configuration.tokenOptimization.profiles || {}).forEach(profileCode => {
            const policy = configuration.tokenOptimization.profiles[profileCode];
            ['maximumInputTokens', 'maximumOutputTokens', 'minimumReservedOutputTokens'].forEach(key => {
                if (!Number.isSafeInteger(policy[key]) || policy[key] < 0) {
                    throw new Error('AI token policy requires a non-negative safe integer: ' + profileCode + '.' + key);
                }
            });
            if (policy.minimumReservedOutputTokens > policy.maximumOutputTokens) {
                throw new Error('AI token output reservation exceeds maximum output: ' + profileCode);
            }
            if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(String(policy.maximumEstimatedCost))) {
                throw new Error('AI token maximumEstimatedCost must be an exact decimal string: ' + profileCode);
            }
        });
        Object.keys((configuration.pricing || {}).models || {}).forEach(modelKey => {
            const price = configuration.pricing.models[modelKey];
            if (!price || !price.revision || !/^[A-Z]{3}$/.test(String(price.currencyCode || ''))) {
                throw new Error('AI model pricing requires revision and ISO currency: ' + modelKey);
            }
            ['inputPerMillion', 'outputPerMillion', 'cachedInputPerMillion', 'embeddingPerMillion'].forEach(key => {
                if (price[key] !== undefined && !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(String(price[key]))) {
                    throw new Error('AI model pricing requires exact decimal rates: ' + modelKey + '.' + key);
                }
            });
            ['effectiveAt', 'expiresAt'].forEach(key => {
                if (price[key] && Number.isNaN(new Date(price[key]).getTime())) {
                    throw new Error('AI model pricing date is invalid: ' + modelKey + '.' + key);
                }
            });
            if (price.effectiveAt && price.expiresAt &&
                new Date(price.effectiveAt) >= new Date(price.expiresAt)) {
                throw new Error('AI model pricing effective range is invalid: ' + modelKey);
            }
        });
        const ledger = configuration.ledger;
        if (!ledger || ledger.enabled !== true || ledger.failClosed !== true) {
            throw new Error('AI persistent token ledger must remain enabled and fail closed');
        }
        ['reservationTtlSeconds', 'uncertainRetentionSeconds', 'expiryBatchSize',
            'maximumCompareAndSwapAttempts'].forEach(key => {
            if (!Number.isSafeInteger(ledger[key]) || ledger[key] < 1) {
                throw new Error('AI ledger requires a positive safe integer: ' + key);
            }
        });
        if (!ledger.budget || !['DAY', 'MONTH'].includes(ledger.budget.period) ||
            !Array.isArray(ledger.budget.scopeDimensions) || !ledger.budget.scopeDimensions.length ||
            !Number.isSafeInteger(ledger.budget.defaultMaximumTokens) ||
            ledger.budget.defaultMaximumTokens < 0 ||
            !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(String(ledger.budget.defaultMaximumCost)) ||
            !/^[A-Z]{3}$/.test(String(ledger.budget.currencyCode || ''))) {
            throw new Error('AI ledger budget configuration is invalid');
        }
        const hierarchy = ledger.budget.hierarchy;
        if (!hierarchy || hierarchy.requireAtomicRepository !== true || !Array.isArray(hierarchy.levels) ||
            !hierarchy.levels.length || hierarchy.levels.some(level => !level.code ||
                !Array.isArray(level.dimensions) || !level.dimensions.length ||
                level.dimensions[0] !== 'tenantCode' ||
                level.dimensions.some(name => !ledger.budget.scopeDimensions.includes(name)))) {
            throw new Error('AI hierarchical budget configuration is invalid');
        }
        if (ledger.cache && ledger.cache.enabled === true &&
            (!Number.isSafeInteger(ledger.cache.ttlSeconds) || ledger.cache.ttlSeconds < 1)) {
            throw new Error('AI ledger cache ttlSeconds must be a positive safe integer');
        }
        const repair = ledger.repair;
        if (!repair || repair.enabled !== true || repair.requireServiceIdentity !== true ||
            repair.allowUncertainReleaseWithoutProviderEvidence !== false ||
            !['AUTOMATIC', 'MANUAL'].includes(repair.deterministicRepairApprovalMode)) {
            throw new Error('AI ledger repair safety invariants cannot be weakened');
        }
        ['batchSize', 'maximumFindings', 'staleTransitionSeconds', 'scheduleWindowMinutes'].forEach(key => {
            if (!Number.isSafeInteger(repair[key]) || repair[key] < 1) {
                throw new Error('AI ledger repair requires a positive safe integer: ' + key);
            }
        });
        assertNoInlineSecrets(configuration, 'aiProviders');
        return true;
    },

    /** Creates an immutable secret-safe snapshot of effective configuration and origins. */
    snapshot: function (configuration, origins) {
        this.validate(configuration);
        return deepFreeze({
            contractVersion: 1,
            effective: transform(configuration, true),
            origins: transform(origins || {}, true)
        });
    }
};
