/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/src/service/token/defaultAiTokenEconomicsService
 * @description Creates fail-closed token plans and reconciles exact AI cost through the persistent ledger contract.
 * @layer service
 * @owner aiProviders
 * @override Projects may replace estimation economics or ledger integration while preserving exact arithmetic, reservation, idempotency, and reconciliation.
 */
const configurationService = require('../config/defaultAiProviderConfigurationService');
const million = 1000000n;

function parseDecimal(value) {
    const text = String(value);
    if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(text)) throw new Error('AI cost requires an exact non-negative decimal string');
    const parts = text.split('.');
    return { digits: BigInt(parts[0] + (parts[1] || '')), scale: (parts[1] || '').length };
}

function formatDecimal(digits, scale) {
    const negative = digits < 0n;
    let text = (negative ? -digits : digits).toString().padStart(scale + 1, '0');
    if (scale) text = text.slice(0, -scale) + '.' + text.slice(-scale);
    return (negative ? '-' : '') + text;
}

function rateCost(tokens, rate, outputScale) {
    if (!Number.isSafeInteger(tokens) || tokens < 0) throw new Error('AI token usage must be a non-negative safe integer');
    const parsed = parseDecimal(rate || '0');
    const numerator = BigInt(tokens) * parsed.digits * (10n ** BigInt(outputScale));
    const denominator = million * (10n ** BigInt(parsed.scale));
    const roundedUp = numerator === 0n ? 0n : (numerator + denominator - 1n) / denominator;
    return roundedUp;
}

function exactCompare(left, right) {
    const a = parseDecimal(left);
    const b = parseDecimal(right);
    const scale = Math.max(a.scale, b.scale);
    const x = a.digits * (10n ** BigInt(scale - a.scale));
    const y = b.digits * (10n ** BigInt(scale - b.scale));
    return x < y ? -1 : x > y ? 1 : 0;
}

function exactCalculate(left, right, operation, scale) {
    const a = parseDecimal(left);
    const b = parseDecimal(right);
    const targetScale = scale === undefined ? Math.max(a.scale, b.scale) : Math.max(scale, a.scale, b.scale);
    const x = a.digits * (10n ** BigInt(targetScale - a.scale));
    const y = b.digits * (10n ** BigInt(targetScale - b.scale));
    const value = operation === 'SUBTRACT' ? x - y : x + y;
    if (value < 0n) throw new Error('AI exact decimal result cannot be negative');
    return formatDecimal(value, targetScale);
}

function cost(usage, rates, scale) {
    const input = rateCost(usage.inputTokens || 0, rates.inputPerMillion, scale);
    const output = rateCost(usage.outputTokens || 0, rates.outputPerMillion, scale);
    const cached = rateCost(usage.cachedInputTokens || 0, rates.cachedInputPerMillion, scale);
    const embedding = rateCost(usage.embeddingTokens || 0, rates.embeddingPerMillion, scale);
    return formatDecimal(input + output + cached + embedding, scale);
}

module.exports = {
    /** Calculates exact, conservatively rounded-up cost without binary floating point. */
    calculateCost: function (usage, rates, scale) {
        return cost(usage || {}, rates || {}, scale);
    },

    /** Adds exact non-negative decimal values at the requested scale. */
    addExact: function (left, right, scale) {
        return exactCalculate(left, right, 'ADD', scale);
    },

    /** Subtracts exact non-negative decimal values and rejects underflow. */
    subtractExact: function (left, right, scale) {
        return exactCalculate(left, right, 'SUBTRACT', scale);
    },

    /** Compares exact decimal values without binary floating point. */
    compareExact: function (left, right) {
        return exactCompare(left, right);
    },

    /** Creates an immutable preflight plan and rejects token or cost overflow. */
    plan: function (input) {
        const configuration = input.configuration;
        configurationService.validate(configuration);
        const policy = configuration.tokenOptimization.profiles[input.profileCode];
        if (!policy) throw new Error('Missing AI token optimization profile: ' + input.profileCode);
        if (!Number.isSafeInteger(input.estimatedInputTokens) || input.estimatedInputTokens < 0) {
            throw new Error('AI provider estimator returned invalid input tokens');
        }
        const requestedOutput = Number.isSafeInteger(input.requestedOutputTokens) && input.requestedOutputTokens >= 0 ?
            input.requestedOutputTokens : policy.minimumReservedOutputTokens;
        const reservedOutput = Math.max(requestedOutput, policy.minimumReservedOutputTokens);
        if (input.estimatedInputTokens > policy.maximumInputTokens) throw new Error('AI input token budget exceeded');
        if (reservedOutput > policy.maximumOutputTokens) throw new Error('AI output token budget exceeded');
        const rates = input.rates || {};
        if (!rates.revision || rates.currencyCode !== policy.currencyCode) {
            throw new Error('AI model pricing revision or currency does not match token policy');
        }
        const planTime = input.at ? new Date(input.at) : new Date();
        if (rates.effectiveAt && planTime < new Date(rates.effectiveAt) ||
            rates.expiresAt && planTime >= new Date(rates.expiresAt)) {
            throw new Error('AI model pricing revision is not effective for this attempt');
        }
        const estimatedCost = cost({
            inputTokens: input.estimatedInputTokens,
            outputTokens: reservedOutput,
            cachedInputTokens: input.cachedInputTokens || 0,
            embeddingTokens: input.embeddingTokens || 0
        }, rates, configuration.tokenOptimization.costScale);
        if (exactCompare(estimatedCost, policy.maximumEstimatedCost) > 0) {
            throw new Error('AI estimated cost budget exceeded');
        }
        return Object.freeze({
            contractVersion: 1,
            profileCode: input.profileCode,
            provider: input.provider,
            model: input.model,
            estimatedInputTokens: input.estimatedInputTokens,
            reservedOutputTokens: reservedOutput,
            estimatedCost: estimatedCost,
            currencyCode: policy.currencyCode,
            configurationRevision: input.configurationRevision || 'effective',
            pricingRevision: rates.revision,
            pricingEffectiveAt: rates.effectiveAt,
            pricingExpiresAt: rates.expiresAt,
            optimizations: Object.freeze((input.optimizations || []).slice())
        });
    },

    /** Atomically reserves budget through the configured ledger authority. */
    reserve: function (plan, idempotencyKey, context, ledger) {
        if (!ledger || typeof ledger.reserve !== 'function') return Promise.reject(new Error('AI token ledger reservation authority is unavailable'));
        if (!idempotencyKey || String(idempotencyKey).length < 8) return Promise.reject(new Error('AI token reservation requires an idempotency key'));
        return Promise.resolve(ledger.reserve({ tokenPlan: plan, idempotencyKey: idempotencyKey, context: context || {} }));
    },

    /** Reconciles actual normalized usage and exact cost against a reservation. */
    reconcile: function (reservation, usage, rates, configuration, context, ledger) {
        if (!reservation || !reservation.reservationId) return Promise.reject(new Error('AI token reconciliation requires a reservation'));
        if (!ledger || typeof ledger.reconcile !== 'function') return Promise.reject(new Error('AI token ledger reconciliation authority is unavailable'));
        const actualCost = cost(usage || {}, rates || {}, configuration.tokenOptimization.costScale);
        const reconciliation = {
            reservationId: reservation.reservationId,
            actualUsage: usage || {},
            actualCost: actualCost,
            currencyCode: reservation.tokenPlan.currencyCode,
            state: exactCompare(actualCost, reservation.tokenPlan.estimatedCost) > 0 ? 'OVERAGE' : 'RECONCILED'
        };
        return Promise.resolve(ledger.reconcile({ reconciliation: reconciliation, context: context || {} }))
            .then(() => reconciliation);
    },

    /** Releases a reservation after a provider failure or cancellation. */
    release: function (reservation, reason, context, ledger) {
        if (!reservation || !ledger || typeof ledger.release !== 'function') return Promise.resolve(false);
        return Promise.resolve(ledger.release({
            reservationId: reservation.reservationId,
            reason: reason || 'PROVIDER_FAILURE',
            context: context || {}
        }));
    },

    /** Marks post-invocation failures uncertain so repair can reconcile possible provider cost. */
    markUncertain: function (reservation, reason, context, ledger) {
        if (!reservation || !ledger || typeof ledger.markUncertain !== 'function') {
            return Promise.reject(new Error('AI token ledger cannot record uncertain post-invocation usage'));
        }
        return Promise.resolve(ledger.markUncertain({
            reservationId: reservation.reservationId,
            reason: reason || 'POST_INVOCATION_FAILURE',
            context: context || {}
        }));
    }
};
