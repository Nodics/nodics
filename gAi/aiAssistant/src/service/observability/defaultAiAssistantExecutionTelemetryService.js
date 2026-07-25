/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/observability/DefaultAiAssistantExecutionTelemetryService
 * @description Maintains bounded process-local execution and recovery counters without tenant, principal, turn, prompt, or provider labels.
 * @layer service
 * @owner aiAssistant
 * @override Monitoring adapters may export snapshots while preserving zero-cardinality identity disclosure.
 */
module.exports = {
    _metrics: null,

    /** Creates the fixed counter set. */
    create: function () {
        return {
            claimsAttempted: 0, claimsAcquired: 0, claimConflicts: 0,
            leaseRenewals: 0, heartbeatFailures: 0, cacheMirrorFailures: 0,
            cancellationRequests: 0, cancellationSignals: 0, cancellationRecoveries: 0,
            recoveryScanned: 0, recoverySucceeded: 0, recoveryClaimConflicts: 0,
            retryRequiredRecoveries: 0, uncertainProviderRecoveries: 0,
            lastHeartbeatFailureAt: null, lastRecoveryAt: null
        };
    },

    /** Returns mutable internal metrics, initialized lazily for loader-independent tests. */
    metrics: function () {
        if (!this._metrics) this._metrics = this.create();
        return this._metrics;
    },

    /** Increments one fixed counter and optional fixed timestamp. */
    record: function (counter, timestamp) {
        const metrics = this.metrics();
        if (!Object.prototype.hasOwnProperty.call(metrics, counter) ||
            typeof metrics[counter] !== 'number') throw new Error('Unknown AI Assistant metric: ' + counter);
        metrics[counter] += 1;
        if (timestamp) metrics[timestamp] = new Date().toISOString();
        return metrics[counter];
    },

    /** Adds a bounded non-negative amount to one fixed counter. */
    add: function (counter, amount) {
        const value = Number(amount || 0);
        if (!Number.isSafeInteger(value) || value < 0) throw new Error('AI Assistant metric amount is invalid');
        const metrics = this.metrics();
        if (typeof metrics[counter] !== 'number') throw new Error('Unknown AI Assistant metric: ' + counter);
        metrics[counter] += value;
        return metrics[counter];
    },

    /** Returns a sanitized copy suitable for secured diagnostics. */
    snapshot: function () {
        return Object.assign({ generatedAt: new Date().toISOString() }, this.metrics());
    },

    /** Clears process-local state for shutdown and focused tests. */
    reset: function () {
        this._metrics = this.create();
        return true;
    }
};
