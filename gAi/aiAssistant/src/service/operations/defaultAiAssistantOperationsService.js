/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/operations/DefaultAiAssistantOperationsService
 * @description Provides sanitized Assistant execution readiness and bounded operational telemetry.
 * @layer service
 * @owner aiAssistant
 * @override Deployments may add exporters without exposing conversational or identity data.
 */
const configurationService = require('../config/defaultAiAssistantConfigurationService');

module.exports = {
    /** Registers Assistant as an optional readiness contributor. */
    init: function () {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultHealthService) {
            SERVICE.DefaultHealthService.registerReadinessContributor('aiAssistantExecution', {
                required: false, order: 396,
                description: 'Optional AI Assistant execution capability is operational',
                check: () => this.assess().then(result => ({
                    status: ['READY', 'DISABLED'].includes(result.state) ? 'UP' : 'DOWN'
                }))
            });
        }
        return Promise.resolve(true);
    },

    /** Completes initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Assesses configured authorities and recent fixed-cardinality failure evidence. */
    assess: function (runtime) {
        runtime = runtime || {};
        const configuration = runtime.configuration ||
            (typeof CONFIG !== 'undefined' && CONFIG.get('aiAssistant'));
        const telemetry = runtime.telemetry ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiAssistantExecutionTelemetryService);
        const failures = [];
        try {
            configurationService.validate(configuration);
        } catch (error) {
            failures.push('CONFIGURATION_INVALID');
        }
        if (!configuration || configuration.enabled !== true) {
            return Promise.resolve({ state: 'DISABLED', failures: failures, checkedAt: new Date().toISOString() });
        }
        const turns = runtime.turns ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAssistantTurnService);
        const cache = runtime.cache ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService);
        if (!turns || typeof turns.update !== 'function' || typeof turns.get !== 'function') {
            failures.push('TURN_PERSISTENCE_UNAVAILABLE');
        }
        if (!cache || typeof cache.put !== 'function') failures.push('EXECUTION_CACHE_UNAVAILABLE');
        const snapshot = telemetry && typeof telemetry.snapshot === 'function' ?
            telemetry.snapshot() : {};
        const lastFailure = snapshot.lastHeartbeatFailureAt ?
            new Date(snapshot.lastHeartbeatFailureAt).getTime() : 0;
        const windowMs = Number((configuration.observability || {}).heartbeatFailureDegradedWindowMs || 300000);
        if (lastFailure && Date.now() - lastFailure <= windowMs) failures.push('RECENT_HEARTBEAT_FAILURE');
        return Promise.resolve({
            state: failures.length ? 'DEGRADED' : 'READY',
            failures: Array.from(new Set(failures)).sort(),
            checkedAt: new Date().toISOString()
        });
    },

    /** Returns secured low-disclosure readiness and process-local metrics. */
    diagnostics: async function (request, runtime) {
        const telemetry = runtime && runtime.telemetry ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiAssistantExecutionTelemetryService);
        return {
            readiness: await this.assess(runtime),
            telemetry: telemetry.snapshot()
        };
    }
};
