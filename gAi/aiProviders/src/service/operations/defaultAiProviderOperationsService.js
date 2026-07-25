/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/operations/defaultAiProviderOperationsService
 * @description Provides sanitized provider readiness and telemetry through existing Nodics authorities.
 * @layer service
 * @owner aiProviders
 * @override Projects may add external monitoring exporters without creating another provider authority.
 */
const configurationService = require('../config/defaultAiProviderConfigurationService');
const credentialService = require('../credential/defaultAiProviderCredentialService');

module.exports = {
    /** Registers optional AI capability readiness without blocking unrelated Nodics traffic. */
    init: function () {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultHealthService) {
            SERVICE.DefaultHealthService.registerReadinessContributor('aiProviders', {
                required: false, order: 395,
                description: 'Optional AI provider capability is operational',
                check: () => this.assess().then(result => ({ status: result.state === 'READY' ? 'UP' : 'DOWN' }))
            });
        }
        return Promise.resolve(true);
    },

    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Assesses configuration, adapters, credentials, cache, ledger, and recent provider outcomes. */
    assess: async function (runtime) {
        runtime = runtime || {};
        const configuration = runtime.configuration ||
            (typeof CONFIG !== 'undefined' && CONFIG.get('aiProviders'));
        const gateway = runtime.gateway ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiProviderGatewayService);
        const cache = runtime.rateLimitCache ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService);
        const ledger = runtime.tokenLedger ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiTokenLedgerService);
        const telemetry = runtime.telemetry ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiProviderTelemetryService);
        const failures = [];
        try {
            configurationService.validate(configuration);
        } catch (error) {
            failures.push('CONFIGURATION_INVALID');
        }
        if (!configuration || configuration.enabled !== true) {
            return { state: 'DISABLED', failures: failures, checkedAt: new Date().toISOString() };
        }
        const registrations = gateway && typeof gateway.registrations === 'function' ? gateway.registrations() : [];
        const registered = new Set(registrations.map(item => item.providerCode));
        const enabledProviders = Object.keys(configuration.providers || {})
            .filter(code => configuration.providers[code].enabled === true).sort();
        enabledProviders.forEach(code => {
            if (!registered.has(code)) failures.push('ADAPTER_UNAVAILABLE');
        });
        if (!cache || typeof cache.incrementBounded !== 'function') failures.push('RATE_LIMIT_CACHE_UNAVAILABLE');
        if (!ledger || typeof ledger.reserve !== 'function') failures.push('TOKEN_LEDGER_UNAVAILABLE');
        for (const code of enabledProviders) {
            try {
                await credentialService.resolve(configuration.providers[code].secretReference, runtime);
            } catch (error) {
                failures.push('CREDENTIAL_UNAVAILABLE');
            }
        }
        const snapshot = telemetry && typeof telemetry.snapshot === 'function' ? telemetry.snapshot() :
            { series: [], activeSeries: 0, overflowed: false };
        if (snapshot.series.some(series => series.lastFailureCode === 'AI_PROVIDER_QUOTA_EXCEEDED' &&
            (!series.lastSuccessAt || String(series.lastFailureAt) > String(series.lastSuccessAt)))) {
            failures.push('PROVIDER_QUOTA_EXCEEDED');
        }
        return {
            state: failures.length ? 'DEGRADED' : 'READY',
            failures: Array.from(new Set(failures)).sort(),
            enabledProviderCount: enabledProviders.length,
            registeredProviderCount: registrations.length,
            checkedAt: new Date().toISOString()
        };
    },

    /** Returns secured low-cardinality diagnostics without secrets or user-controlled identifiers. */
    diagnostics: async function (request, runtime) {
        const telemetry = runtime && runtime.telemetry ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiProviderTelemetryService);
        return {
            readiness: await this.assess(runtime),
            telemetry: telemetry.snapshot()
        };
    }
};
