/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/observability/defaultAiProviderTelemetryService
 * @description Maintains bounded process-local provider metrics without prompts, responses, tenants, or principals.
 * @layer service
 * @owner aiProviders
 * @override Deployments may export snapshots to a monitoring adapter while preserving bounded labels and redaction.
 */
module.exports = {
    _series: new Map(),
    _overflow: null,

    /** Creates an empty stable metric series. */
    createSeries: function (labels) {
        return {
            labels: Object.freeze(Object.assign({}, labels)),
            requests: 0, successes: 0, failures: 0, retries: 0, fallbacks: 0,
            reconciled: 0, overages: 0, uncertain: 0,
            totalLatencyMs: 0, maximumLatencyMs: 0, lastLatencyMs: 0,
            failuresByCategory: {}, lastFailureCode: null, lastFailureAt: null,
            lastSuccessAt: null
        };
    },

    /** Returns one bounded series, aggregating excess cardinality into an overflow bucket. */
    getSeries: function (labels, configuration) {
        const key = [labels.profileCode, labels.capability, labels.providerCode].join(':');
        if (this._series.has(key)) return this._series.get(key);
        const maximumSeries = Number(((configuration || {}).observability || {}).maximumSeries || 64);
        if (this._series.size >= maximumSeries) {
            if (!this._overflow) this._overflow = this.createSeries({
                profileCode: '_overflow', capability: '_overflow', providerCode: '_overflow'
            });
            return this._overflow;
        }
        const series = this.createSeries(labels);
        this._series.set(key, series);
        return series;
    },

    /** Records the start of one cost-bearing provider attempt. */
    begin: function (input) {
        const series = this.getSeries({
            profileCode: String(input.profileCode || '_'),
            capability: String(input.capability || '_'),
            providerCode: String(input.providerCode || '_')
        }, input.configuration);
        series.requests += 1;
        if (Number(input.attemptNumber || 1) > 1) series.retries += 1;
        if (input.fallback === true) series.fallbacks += 1;
        return { series: series, startedAt: Date.now() };
    },

    /** Records a successful normalized attempt and its accounting outcome. */
    success: function (measurement, result) {
        const now = new Date().toISOString();
        const latency = Math.max(0, Date.now() - measurement.startedAt);
        const series = measurement.series;
        series.successes += 1;
        series.lastSuccessAt = now;
        series.lastLatencyMs = latency;
        series.totalLatencyMs += latency;
        series.maximumLatencyMs = Math.max(series.maximumLatencyMs, latency);
        const state = result && result.usageReconciliation && result.usageReconciliation.state;
        if (state === 'RECONCILED') series.reconciled += 1;
        if (state === 'OVERAGE') series.overages += 1;
        return result;
    },

    /** Records a sanitized failed attempt and uncertain accounting indicator. */
    failure: function (measurement, error, uncertain) {
        const now = new Date().toISOString();
        const latency = Math.max(0, Date.now() - measurement.startedAt);
        const series = measurement.series;
        const category = error && error.providerDiagnostics && error.providerDiagnostics.category || 'INTERNAL';
        series.failures += 1;
        series.failuresByCategory[category] = Number(series.failuresByCategory[category] || 0) + 1;
        series.lastFailureCode = error && error.code || 'AI_PROVIDER_INTERNAL_FAILURE';
        series.lastFailureAt = now;
        series.lastLatencyMs = latency;
        series.totalLatencyMs += latency;
        series.maximumLatencyMs = Math.max(series.maximumLatencyMs, latency);
        if (uncertain === true) series.uncertain += 1;
        return error;
    },

    /** Returns a sanitized immutable-value snapshot for secured operations diagnostics. */
    snapshot: function () {
        const values = Array.from(this._series.values()).concat(this._overflow ? [this._overflow] : []);
        return {
            generatedAt: new Date().toISOString(),
            series: values.map(value => Object.assign({}, value, {
                labels: Object.assign({}, value.labels),
                failuresByCategory: Object.assign({}, value.failuresByCategory),
                averageLatencyMs: value.requests ? Math.round(value.totalLatencyMs / value.requests) : 0
            })).sort((left, right) => JSON.stringify(left.labels).localeCompare(JSON.stringify(right.labels))),
            activeSeries: this._series.size,
            overflowed: Boolean(this._overflow)
        };
    },

    /** Clears process-local state during shutdown and focused tests. */
    reset: function () {
        this._series.clear();
        this._overflow = null;
        return true;
    }
};
