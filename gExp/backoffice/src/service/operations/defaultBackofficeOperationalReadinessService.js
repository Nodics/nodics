/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/service/operations/DefaultBackofficeOperationalReadinessService
 * @description Validates layered BackOffice deployment policy and derives low-disclosure operational readiness and alert codes from owning diagnostics.
 * @layer service
 * @owner backoffice
 * @override Environments may tighten requirements and thresholds while preserving source authority and stable alert semantics.
 */
module.exports = {
    /** Registers configuration validity as a required readiness contributor. */
    init: function () {
        if (SERVICE.DefaultHealthService) SERVICE.DefaultHealthService.registerReadinessContributor('backofficeOperationalConfiguration', {
            required: true, order: 391, description: 'BackOffice operational configuration is valid',
            check: () => this.validateConfiguration().valid
        });
        return Promise.resolve(true);
    },
    /** Completes operational readiness initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered operations policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).operations || {}; },
    /** Validates cross-setting invariants without reading or returning secrets. */
    validateConfiguration: function () {
        let registry = CONFIG.get('backofficeRegistry') || {};
        let operations = registry.operations || {};
        let availability = registry.availability || {};
        let failures = [];
        if (Number(registry.leaseTtlMs || 0) <= Number(registry.sweepIntervalMs || 0)) failures.push('LEASE_TTL_NOT_GREATER_THAN_SWEEP');
        if (operations.requireDistributedStore === true && (!registry.store || registry.store.mode !== 'distributed')) failures.push('DISTRIBUTED_STORE_REQUIRED');
        if (registry.store && registry.store.mode === 'distributed' && (!registry.store.moduleName || !registry.store.engineName || !registry.store.keyPrefix)) {
            failures.push('DISTRIBUTED_STORE_COORDINATES_INVALID');
        }
        if (Number(availability.maxConcurrentObservations || 0) < 1 || Number(availability.maxQueuedObservations || 0) < 1) {
            failures.push('AVAILABILITY_PRESSURE_LIMIT_INVALID');
        }
        if (Number(availability.staleAfterMs || 0) <= Number(availability.timeoutMs || 0)) failures.push('AVAILABILITY_FRESHNESS_INVALID');
        let thresholds = operations.thresholds || {};
        ['availabilityFailurePercent', 'availabilityQueuePercent', 'discoveryFailurePercent'].forEach(name => {
            let value = Number(thresholds[name]);
            if (!Number.isFinite(value) || value < 0 || value > 100) failures.push('OPERATION_THRESHOLD_INVALID');
        });
        if (Number(operations.minimumSamples || 0) < 1) failures.push('OPERATION_SAMPLE_LIMIT_INVALID');
        return { valid: failures.length === 0, failures: failures };
    },
    /** Derives stable alerts from sanitized counters already owned by registry subsystems. */
    assess: function (diagnostics) {
        diagnostics = diagnostics || {};
        let configuration = this.validateConfiguration();
        let policy = this.getConfiguration();
        let threshold = policy.thresholds || {};
        let minimum = Number(policy.minimumSamples || 10);
        let alerts = configuration.failures.slice();
        let store = diagnostics.store || {};
        let storeMetrics = store.metrics || {};
        if (store.available === false) alerts.push('REGISTRY_STORE_UNAVAILABLE');
        let storeErrorLimit = Number(threshold.storeErrors === undefined ? 1 : threshold.storeErrors);
        let conflictLimit = Number(threshold.conditionalDeleteConflicts === undefined ? 10 : threshold.conditionalDeleteConflicts);
        if (Number(storeMetrics.errors || 0) >= storeErrorLimit) alerts.push('REGISTRY_STORE_ERRORS');
        if (Number(storeMetrics.conditionalDeleteConflicts || 0) >= conflictLimit) alerts.push('LEASE_RENEWAL_CONFLICTS');
        let availability = diagnostics.availability || {};
        let availabilityMetrics = availability.metrics || {};
        if (Number(availabilityMetrics.attempts || 0) >= minimum && Number(availabilityMetrics.failures || 0) * 100 /
            Number(availabilityMetrics.attempts || 1) >= Number(threshold.availabilityFailurePercent === undefined ? 25 : threshold.availabilityFailurePercent)) alerts.push('AVAILABILITY_FAILURE_RATE');
        let queueLimit = Number(((CONFIG.get('backofficeRegistry') || {}).availability || {}).maxQueuedObservations || 1);
        if (Number(availability.queued || 0) * 100 / queueLimit >= Number(threshold.availabilityQueuePercent === undefined ? 80 : threshold.availabilityQueuePercent)) alerts.push('AVAILABILITY_QUEUE_SATURATED');
        let discovery = diagnostics.discovery || {};
        if (Number(discovery.attempts || 0) >= minimum && Number(discovery.failures || 0) * 100 /
            Number(discovery.attempts || 1) >= Number(threshold.discoveryFailurePercent === undefined ? 25 : threshold.discoveryFailurePercent)) alerts.push('DISCOVERY_FAILURE_RATE');
        if (Number((diagnostics.security || {}).throttled || 0) >= Number(threshold.refreshThrottles === undefined ? 1 : threshold.refreshThrottles)) alerts.push('ADMIN_REFRESH_THROTTLED');
        alerts = Array.from(new Set(alerts)).sort();
        let state = configuration.valid && store.available !== false ? alerts.length > 0 ? 'DEGRADED' : 'READY' : 'NOT_READY';
        return { state: state, alerts: alerts, checkedAt: new Date().toISOString() };
    }
};
