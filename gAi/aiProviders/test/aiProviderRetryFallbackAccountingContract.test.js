/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/test/AiProviderRetryFallbackAccountingContract
 * @description Verifies every retry/fallback attempt receives independent reservation and usage outcome.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const gateway = require('../src/service/defaultAiProviderGatewayService');
const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.resilience.fallbackEnabled = true;
configuration.resilience.maximumAttempts = 2;
configuration.resilience.circuitBreaker.failureThreshold = 1;
configuration.profiles.assistantGeneration.provider = 'primary';
configuration.profiles.assistantGeneration.model = 'primary-model';
configuration.profiles.assistantGeneration.fallbackProviders = ['fallback'];
configuration.profiles.assistantGeneration.fallbackModels = { fallback: 'fallback-model' };
['primary', 'fallback'].forEach(provider => {
    configuration.providers[provider] = { enabled: true, secretReference: 'vault://' + provider };
    configuration.pricing.models[provider + ':' + provider + '-model'] = {
        revision: provider + '-price-1', currencyCode: 'USD',
        inputPerMillion: '1.00000000', outputPerMillion: '1.00000000'
    };
});
const events = [];
const circuitValues = new Map();
const cache = {
    incrementBounded: input => {
        if (!String(input.key).startsWith('circuit-')) {
            return Promise.resolve({ allowed: true, value: 1, maximum: 60 });
        }
        const next = Number(circuitValues.get(input.key) || 0) + 1;
        circuitValues.set(input.key, next);
        return Promise.resolve({ allowed: next <= input.maximum, value: Math.min(next, input.maximum),
            maximum: input.maximum });
    },
    get: input => circuitValues.has(input.key) ? Promise.resolve(circuitValues.get(input.key)) :
        Promise.reject(Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' })),
    put: input => { circuitValues.set(input.key, input.value); return Promise.resolve(true); },
    flushCache: input => { input.keys.forEach(key => circuitValues.delete(key)); return Promise.resolve(true); }
};
const ledger = {
    reserve: input => {
        events.push({ type: 'reserve', key: input.idempotencyKey });
        return {
            reservationId: input.idempotencyKey, idempotencyKey: input.idempotencyKey,
            state: 'RESERVED', tokenPlan: input.tokenPlan, reservedAt: new Date().toISOString()
        };
    },
    reconcile: input => { events.push({ type: 'reconcile', id: input.reconciliation.reservationId }); return true; },
    markUncertain: input => { events.push({ type: 'uncertain', id: input.reservationId }); return true; },
    release: input => { events.push({ type: 'release', id: input.reservationId }); return true; }
};
const estimateTokens = () => ({ inputTokens: 2, requestedOutputTokens: 2 });
const providerFailure = new Error('provider unavailable');
providerFailure.retryable = true;
gateway.register('primary', {
    capabilities: ['GENERATION'], estimateTokens: estimateTokens,
    generate: () => Promise.reject(providerFailure)
});
gateway.register('fallback', {
    capabilities: ['GENERATION'], estimateTokens: estimateTokens,
    generate: input => Promise.resolve({
        id: 'fallback-result', model: input.model, text: 'ok',
        usage: { inputTokens: 2, outputTokens: 1 }
    })
});

gateway.execute('assistantGeneration', 'generate', { messages: [{ role: 'user', content: 'hello' }] }, {
    tenant: 'default', principalCode: 'admin', idempotencyKey: 'fallback-test-request',
    configurationRevision: 'config-1', tokenLedger: ledger,
    secretResolver: () => Promise.resolve('credential'),
    rateLimitCache: cache
}, configuration)
    .then(result => {
        assert.strictEqual(result.provider, 'fallback');
        assert.strictEqual(result.attempt, 2);
        assert.deepStrictEqual(result.attemptedProviders, ['primary', 'fallback']);
        assert.deepStrictEqual(events.filter(event => event.type === 'reserve').map(event => event.key), [
            'fallback-test-request:attempt:1', 'fallback-test-request:attempt:2'
        ]);
        assert.strictEqual(events.filter(event => event.type === 'uncertain').length, 1);
        assert.strictEqual(events.filter(event => event.type === 'reconcile').length, 1);
        return gateway.execute('assistantGeneration', 'generate',
            { messages: [{ role: 'user', content: 'hello again' }] }, {
                tenant: 'default', principalCode: 'admin',
                idempotencyKey: 'fallback-open-circuit-request',
                configurationRevision: 'config-1', tokenLedger: ledger,
                secretResolver: () => Promise.resolve('credential'),
                rateLimitCache: cache
            }, configuration);
    })
    .then(result => {
        assert.strictEqual(result.provider, 'fallback');
        assert.strictEqual(result.attempt, 1);
        assert.deepStrictEqual(result.attemptedProviders, ['fallback']);
        assert.strictEqual(events.filter(event => event.type === 'reserve').length, 3,
            'Open primary circuit must not create a reservation');
        gateway.unregister('primary');
        gateway.unregister('fallback');
        console.log('AI provider retry and fallback accounting validated');
    })
    .catch(error => {
        gateway.unregister('primary');
        gateway.unregister('fallback');
        throw error;
    });
