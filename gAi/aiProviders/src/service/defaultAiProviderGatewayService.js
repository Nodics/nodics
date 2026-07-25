/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/defaultAiProviderGatewayService
 * @description Resolves configured usage profiles to registered provider adapters and hides vendor implementations from callers.
 * @layer service
 * @owner aiProviders
 * @override Later modules may replace selection and resilience behavior while preserving profile-only caller access.
 */
const adapters = new Map();
const operationCapability = { generate: 'GENERATION', embed: 'EMBEDDING' };
const configurationService = require('./config/defaultAiProviderConfigurationService');
const tokenEconomicsService = require('./token/defaultAiTokenEconomicsService');
const controlService = require('./control/defaultAiProviderControlService');
const adapterContractService = require('./adapter/defaultAiProviderAdapterContractService');
const credentialService = require('./credential/defaultAiProviderCredentialService');
const reuseCacheService = require('./cache/defaultAiProviderReuseCacheService');
const usageAlertService = require('./observability/defaultAiProviderUsageAlertService');
const providerErrorService = require('./observability/defaultAiProviderErrorService');
const telemetryService = require('./observability/defaultAiProviderTelemetryService');
const circuitBreakerService = require('./resilience/defaultAiProviderCircuitBreakerService');

module.exports = {
    /** Registers an active vendor adapter and its supported normalized capabilities. */
    register: function (providerCode, adapter) {
        adapterContractService.validate(providerCode, adapter);
        if (adapters.has(providerCode)) throw new Error('AI provider is already registered: ' + providerCode);
        adapters.set(providerCode, adapter);
        return true;
    },

    /** Unregisters a provider adapter during module shutdown or focused tests. */
    unregister: function (providerCode) {
        return adapters.delete(providerCode);
    },

    /** Returns client-safe registered capability metadata without adapter objects. */
    registrations: function () {
        return Array.from(adapters.entries()).map(entry => ({
            providerCode: entry[0],
            capabilities: entry[1].capabilities.slice().sort()
        })).sort((left, right) => left.providerCode.localeCompare(right.providerCode));
    },

    /** Resolves every ordered eligible provider candidate for governed retry/fallback. */
    resolveCandidates: function (profileCode, requiredCapability, configuration) {
        configurationService.validate(configuration);
        if (!configuration || configuration.enabled !== true) throw new Error('AI provider gateway is disabled');
        const profile = configuration.profiles && configuration.profiles[profileCode];
        if (!profile) throw new Error('Unknown AI provider profile: ' + profileCode);
        if (profile.capability !== requiredCapability) {
            throw new Error('AI provider profile capability mismatch: ' + profileCode);
        }
        const providerCodes = [profile.provider].concat(
            configuration.resilience && configuration.resilience.fallbackEnabled === true ?
                (profile.fallbackProviders || []) : []
        ).filter(Boolean);
        return providerCodes.map(providerCode => ({
            providerCode: providerCode,
            model: providerCode === profile.provider ? profile.model :
                ((profile.fallbackModels || {})[providerCode] || profile.model),
            adapter: adapters.get(providerCode),
            providerConfiguration: configuration.providers && configuration.providers[providerCode]
        })).filter(selection => selection.providerConfiguration &&
            selection.providerConfiguration.enabled === true && selection.adapter &&
            selection.adapter.capabilities.includes(requiredCapability));
    },

    /** Resolves a profile to a configured, enabled, registered, capable adapter. */
    resolve: function (profileCode, requiredCapability, configuration) {
        const selections = this.resolveCandidates(profileCode, requiredCapability, configuration);
        if (selections.length) return selections[0];
        throw new Error('No configured AI provider supports profile: ' + profileCode);
    },

    /** Looks up positive provider usage evidence for governed uncertain repair. */
    lookupUsage: function (providerCode, providerRequestId, context, configuration) {
        configurationService.validate(configuration);
        const providerConfiguration = configuration.providers && configuration.providers[providerCode];
        const adapter = adapters.get(providerCode);
        if (!providerConfiguration || providerConfiguration.enabled !== true || !adapter ||
            typeof adapter.lookupUsage !== 'function') {
            return Promise.resolve({ found: false, reason: 'PROVIDER_LOOKUP_UNAVAILABLE' });
        }
        return credentialService.resolve(providerConfiguration.secretReference, context || {})
            .then(credential => adapter.lookupUsage({
                providerRequestId: providerRequestId, providerConfiguration: providerConfiguration,
                credential: credential, context: context || {}
            })).then(evidence => evidence && evidence.found === true ? evidence :
                { found: false, reason: 'PROVIDER_USAGE_NOT_FOUND' });
    },

    /** Executes with optional tenant-safe nCache reuse before spending provider capacity. */
    execute: function (profileCode, operation, request, context, configuration) {
        const capability = operationCapability[operation];
        if (!capability) return Promise.reject(new Error('Unsupported AI provider operation: ' + operation));
        let selection;
        try {
            selection = this.resolve(profileCode, capability, configuration);
        } catch (error) {
            return Promise.reject(error);
        }
        const cacheInput = {
            configuration: configuration, context: context || {}, profileCode: profileCode,
            operation: operation, providerCode: selection.providerCode, modelCode: selection.model,
            request: request || {}
        };
        return reuseCacheService.get(cacheInput).then(cached => {
            if (cached) return Object.assign({}, cached, {
                cacheHit: true,
                usage: adapterContractService.normalizeUsage({}),
                usageReconciliation: { state: 'CACHE_HIT' }
            });
            return this.executeAttempts(profileCode, operation, request, context, configuration)
                .then(result => reuseCacheService.put(cacheInput, result).then(() => result));
        });
    },

    /** Executes ordered attempts with an independent reservation and outcome for each invocation. */
    executeAttempts: async function (profileCode, operation, request, context, configuration) {
        const selections = this.resolveCandidates(profileCode, operationCapability[operation], configuration);
        if (!selections.length) throw new Error('No configured AI provider supports profile: ' + profileCode);
        const maximumAttempts = configuration.resilience.maximumAttempts;
        let lastError;
        const attemptedProviders = [];
        for (let index = 0; index < maximumAttempts; index += 1) {
            const selection = selections[Math.min(index, selections.length - 1)];
            const attemptContext = Object.assign({}, context || {}, {
                idempotencyKey: String(context && context.idempotencyKey) + ':attempt:' + (index + 1),
                _aiAttemptNumber: attemptedProviders.length + 1,
                _aiFallback: index > 0 && selection.providerCode !== selections[0].providerCode
            });
            try {
                const result = await this.executeUncached(profileCode, operation, request, attemptContext,
                    configuration, selection);
                attemptedProviders.push(selection.providerCode);
                return Object.assign({}, result, {
                    attempt: attemptedProviders.length,
                    attemptedProviders: attemptedProviders.slice()
                });
            } catch (error) {
                lastError = error;
                if (error.providerInvocationStarted === true) attemptedProviders.push(selection.providerCode);
                if (index + 1 >= maximumAttempts || error.retryable !== true) throw error;
            }
        }
        throw lastError;
    },

    /** Executes one cost-bearing normalized attempt using only a usage-profile code. */
    executeUncached: function (profileCode, operation, request, context, configuration, resolvedSelection) {
        const requiredCapability = operationCapability[operation];
        if (!requiredCapability) return Promise.reject(new Error('Unsupported AI provider operation: ' + operation));
        if (request && (request.provider || request.providerCode || request.model)) {
            return Promise.reject(new Error('Callers cannot override AI provider or model selection'));
        }
        let selection;
        try {
            selection = resolvedSelection || this.resolve(profileCode, requiredCapability, configuration);
        } catch (error) {
            return Promise.reject(error);
        }
        if (typeof selection.adapter[operation] !== 'function') {
            return Promise.reject(new Error('AI provider adapter does not implement operation: ' + operation));
        }
        if (typeof selection.adapter.estimateTokens !== 'function') {
            return Promise.reject(new Error('AI provider adapter does not implement token estimation'));
        }
        const safeContext = context || {};
        const ledgerContext = Object.assign({}, safeContext, { _aiProviderConfiguration: configuration });
        const tokenLedger = safeContext.tokenLedger ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiTokenLedgerService);
        let reservation;
        let providerInvocationStarted = false;
        const measurement = telemetryService.begin({
            profileCode: profileCode,
            capability: requiredCapability,
            providerCode: selection.providerCode,
            attemptNumber: safeContext._aiAttemptNumber,
            fallback: safeContext._aiFallback,
            configuration: configuration
        });
        let rates = ((configuration.pricing || {}).models || {})[
            selection.providerCode + ':' + selection.model
        ];
        if (!rates) return Promise.reject(new Error('AI provider model pricing is not configured'));
        const providerConfiguration = selection.providerConfiguration ||
            configuration.providers[selection.providerCode];
        const circuitInput = {
            configuration: configuration, context: safeContext,
            profileCode: profileCode, providerCode: selection.providerCode,
            capability: requiredCapability
        };
        let circuitPermit;
        return circuitBreakerService.beforeAttempt(circuitInput).then(permit => {
            circuitPermit = permit;
            return controlService.authorize({
            configuration: configuration,
            context: safeContext,
            profileCode: profileCode,
            providerCode: selection.providerCode,
            modelCode: selection.model,
            capability: requiredCapability
            });
        }).then(rateLimit => credentialService.resolve(providerConfiguration.secretReference, safeContext)
            .then(credential => ({ rateLimit: rateLimit, credential: credential })))
            .then(runtime => Promise.resolve(selection.adapter.estimateTokens({
            operation: operation, model: selection.model, request: request || {}, context: safeContext
        })).then(estimate => {
            const plan = tokenEconomicsService.plan({
                configuration: configuration,
                profileCode: profileCode,
                provider: selection.providerCode,
                model: selection.model,
                estimatedInputTokens: estimate.inputTokens,
                requestedOutputTokens: estimate.requestedOutputTokens,
                cachedInputTokens: estimate.cachedInputTokens,
                embeddingTokens: estimate.embeddingTokens,
                optimizations: estimate.optimizations,
                rates: rates,
                configurationRevision: safeContext.configurationRevision
            });
            return tokenEconomicsService.reserve(plan, safeContext.idempotencyKey, ledgerContext,
                tokenLedger).then(value => {
                reservation = value;
                if (!reservation.tokenPlan) reservation.tokenPlan = plan;
                reservation.rateLimit = runtime.rateLimit;
                providerInvocationStarted = true;
                return selection.adapter[operation]({
                    model: selection.model,
                    request: request || {},
                    context: safeContext,
                    providerConfiguration: providerConfiguration,
                    credential: runtime.credential
                });
            });
        })).then(result => {
            const normalized = adapterContractService.normalizeResult(result);
            ledgerContext.providerRequestId = normalized.providerRequestId;
            return tokenEconomicsService.reconcile(reservation, normalized.usage, rates, configuration,
                ledgerContext, tokenLedger).then(reconciliation =>
                usageAlertService.notify({
                    configuration: configuration, context: safeContext,
                    plan: reservation.tokenPlan, reconciliation: reconciliation
                }).then(alert => Object.assign({}, normalized, {
                    provider: selection.providerCode,
                    tokenPlan: reservation.tokenPlan,
                    usageReconciliation: reconciliation,
                    usageAlert: alert
                }))).then(output => circuitBreakerService.recordSuccess(circuitInput, circuitPermit)
                    .then(() => telemetryService.success(measurement, output)));
        }).catch(error => {
            const normalizedError = providerErrorService.normalize(error, {
                providerInvocationStarted: providerInvocationStarted
            });
            normalizedError.providerInvocationStarted = providerInvocationStarted;
            const circuit = normalizedError.circuitOpen === true ? Promise.resolve(false) :
                circuitBreakerService.recordFailure(circuitInput, circuitPermit, normalizedError);
            return circuit.then(() => providerInvocationStarted ?
                tokenEconomicsService.markUncertain(reservation, normalizedError.code || 'AI_PROVIDER_REQUEST_FAILED',
                    ledgerContext, tokenLedger) :
                tokenEconomicsService.release(reservation, normalizedError.code || 'AI_PROVIDER_REQUEST_FAILED',
                    ledgerContext, tokenLedger)).then(() => {
                telemetryService.failure(measurement, normalizedError, providerInvocationStarted);
                return Promise.reject(normalizedError);
            }, accountingError => {
                telemetryService.failure(measurement, normalizedError, providerInvocationStarted);
                return Promise.reject(accountingError);
            });
        });
    }
};
