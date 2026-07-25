/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/test/AiProviderCircuitBreakerContract
 * @description Verifies engine-neutral open, half-open concurrency, recovery, isolation, and outage behavior.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const circuit = require('../src/service/resilience/defaultAiProviderCircuitBreakerService');

function cachePort() {
    const values = new Map();
    return {
        values: values,
        get: input => values.has(input.tenant + ':' + input.key) ?
            Promise.resolve(values.get(input.tenant + ':' + input.key)) :
            Promise.reject(Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' })),
        put: input => {
            values.set(input.tenant + ':' + input.key, input.value);
            return Promise.resolve(true);
        },
        incrementBounded: input => {
            const key = input.tenant + ':' + input.key;
            const current = Number(values.get(key) || 0);
            if (current + input.amount > input.maximum) {
                return Promise.resolve({ allowed: false, value: current, maximum: input.maximum });
            }
            values.set(key, current + input.amount);
            return Promise.resolve({ allowed: true, value: current + input.amount, maximum: input.maximum });
        },
        flushCache: input => {
            input.keys.forEach(key => values.delete(input.tenant + ':' + key));
            return Promise.resolve(true);
        }
    };
}

async function qualify(mode) {
    const configuration = JSON.parse(JSON.stringify(defaults));
    configuration.resilience.circuitBreaker.failureThreshold = 1;
    configuration.resilience.circuitBreaker.openSeconds = 1;
    configuration.resilience.circuitBreaker.halfOpenMaximumCalls = 1;
    const cache = cachePort();
    const input = {
        configuration: configuration,
        context: { tenant: 'tenant-a', circuitBreakerCache: cache },
        profileCode: 'assistantGeneration', providerCode: 'openAi', capability: 'GENERATION'
    };
    const first = await circuit.beforeAttempt(input);
    assert.strictEqual(first.state, 'CLOSED', mode);
    await circuit.recordFailure(input, first, Object.assign(new Error('unavailable'), {
        aiProviderNormalized: true, code: 'AI_PROVIDER_UNAVAILABLE',
        providerDiagnostics: { category: 'UNAVAILABLE', retryable: true }
    }));
    await assert.rejects(circuit.beforeAttempt(input), error =>
        error.code === 'AI_PROVIDER_CIRCUIT_OPEN' && error.retryable === true);

    const keys = circuit.keys(input);
    cache.values.set('tenant-a:' + keys.state, { state: 'OPEN', openUntil: Date.now() - 1 });
    const probes = await Promise.allSettled([circuit.beforeAttempt(input), circuit.beforeAttempt(input)]);
    assert.strictEqual(probes.filter(result => result.status === 'fulfilled').length, 1, mode);
    assert.strictEqual(probes.filter(result => result.status === 'rejected').length, 1, mode);
    const permit = probes.find(result => result.status === 'fulfilled').value;
    assert.strictEqual(permit.state, 'HALF_OPEN', mode);
    await circuit.recordSuccess(input, permit);
    assert.strictEqual((await circuit.beforeAttempt(input)).state, 'CLOSED', mode);

    const tenantB = Object.assign({}, input, {
        context: { tenant: 'tenant-b', circuitBreakerCache: cache }
    });
    assert.strictEqual((await circuit.beforeAttempt(tenantB)).state, 'CLOSED', mode);
}

(async function () {
    for (const mode of ['nodeCache', 'redisCache', 'hazelcastCache']) await qualify(mode);
    const configuration = JSON.parse(JSON.stringify(defaults));
    await assert.rejects(circuit.beforeAttempt({
        configuration: configuration, context: { tenant: 'default', circuitBreakerCache: {} },
        profileCode: 'assistantGeneration', providerCode: 'openAi', capability: 'GENERATION'
    }), /cache is unavailable/);
    console.log('AI provider circuit breaker engine-neutral contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
