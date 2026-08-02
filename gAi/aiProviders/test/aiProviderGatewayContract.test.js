/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const contracts = require('../src/schemas/apiContracts');
const configurationService = require('../src/service/config/defaultAiProviderConfigurationService');
const gateway = require('../src/service/defaultAiProviderGatewayService');
const credentialService = require('../src/service/credential/defaultAiProviderCredentialService');

assert.strictEqual(configurationService.validate(defaults), true);
assert.strictEqual(defaults.enabled, false);
assert.strictEqual(defaults.security.allowCallerProviderOverride, false);
assert.strictEqual(defaults.ledger.failClosed, true);
assert.strictEqual(contracts.contractVersion, 1);
assert(contracts.capabilities.includes('GENERATION'));
assert(contracts.capabilities.includes('EMBEDDING'));
process.env.NODICS_TEST_AI_PROVIDER_SECRET = 'test-environment-secret';
assert.strictEqual(credentialService.resolveEnvironment(
    'env://NODICS_TEST_AI_PROVIDER_SECRET'), 'test-environment-secret');
assert.throws(() => credentialService.resolveEnvironment('env://invalid-name'), /reference is invalid/);
delete process.env.NODICS_TEST_AI_PROVIDER_SECRET;

const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.profiles.assistantGeneration.provider = 'testProvider';
configuration.profiles.assistantGeneration.model = 'test-generation-model';
configuration.profiles.knowledgeEmbedding.provider = 'testProvider';
configuration.profiles.knowledgeEmbedding.model = 'test-embedding-model';
configuration.providers.testProvider = {
    enabled: true,
    adapterService: 'TestAiProviderAdapterService',
    secretReference: 'vault://test/ai/provider'
};
configuration.pricing.models['testProvider:test-generation-model'] = {
    revision: 'test-generation-rate-1',
    currencyCode: 'USD',
    inputPerMillion: '1.00000000',
    outputPerMillion: '2.00000000',
    cachedInputPerMillion: '0.50000000'
};
configuration.pricing.models['testProvider:test-embedding-model'] = {
    revision: 'test-embedding-rate-1',
    currencyCode: 'USD',
    embeddingPerMillion: '0.10000000'
};

const adapter = {
    capabilities: ['GENERATION', 'EMBEDDING'],
    estimateTokens: request => request.operation === 'generate' ?
        { inputTokens: 10, requestedOutputTokens: 2, optimizations: ['HISTORY_WINDOW'] } :
        { inputTokens: 0, requestedOutputTokens: 0, embeddingTokens: 2, optimizations: ['CONTENT_HASH_DEDUPLICATION'] },
    generate: request => ({ id: 'generation-1', model: request.model,
        text: request.request.messages[0].content, finishReason: 'STOP',
        usage: { inputTokens: 1, outputTokens: 1 } }),
    embed: request => ({ id: 'embedding-1', model: request.model,
        embeddings: request.request.inputs.map(() => [0.1, 0.2]),
        usage: { inputTokens: 0, outputTokens: 0, embeddingTokens: 2 } })
};
const ledgerEvents = [];
const circuitValues = new Map();
const tokenLedger = {
    reserve: input => {
        const reservation = {
            reservationId: 'reservation' + (ledgerEvents.length + 1),
            idempotencyKey: input.idempotencyKey,
            state: 'RESERVED',
            tokenPlan: input.tokenPlan,
            reservedAt: new Date().toISOString()
        };
        ledgerEvents.push({ operation: 'reserve', value: reservation });
        return reservation;
    },
    reconcile: input => {
        ledgerEvents.push({ operation: 'reconcile', value: input.reconciliation });
        return input.reconciliation;
    },
    release: input => {
        ledgerEvents.push({ operation: 'release', value: input });
        return true;
    },
    markUncertain: input => {
        ledgerEvents.push({ operation: 'uncertain', value: input });
        return true;
    }
};
const governedContext = {
    tenant: 'default',
    idempotencyKey: 'assistant-turn-0001',
    configurationRevision: 'revision-1',
    tokenLedger: tokenLedger,
    secretResolver: reference => Promise.resolve(reference === 'vault://test/ai/provider' ? 'test-secret' : undefined),
    rateLimitCache: {
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
    }
};

assert.strictEqual(gateway.register('testProvider', adapter), true);
assert.deepStrictEqual(gateway.registrations(), [{
    providerCode: 'testProvider',
    capabilities: ['EMBEDDING', 'GENERATION']
}]);

Promise.resolve()
    .then(() => gateway.execute('assistantGeneration', 'generate',
        { messages: [{ role: 'user', content: 'hello' }] }, governedContext, configuration))
    .then(result => {
        assert.strictEqual(result.provider, 'testProvider');
        assert.strictEqual(result.model, 'test-generation-model');
        assert.strictEqual(result.text, 'hello');
        assert.strictEqual(result.tokenPlan.estimatedInputTokens, 10);
        assert.strictEqual(result.tokenPlan.pricingRevision, 'test-generation-rate-1');
        assert.strictEqual(result.usageReconciliation.state, 'RECONCILED');
        return gateway.execute('knowledgeEmbedding', 'embed',
            { inputs: ['document'] }, Object.assign({}, governedContext, {
                idempotencyKey: 'knowledge-embed-0001'
            }), configuration);
    })
    .then(result => {
        assert.strictEqual(result.provider, 'testProvider');
        assert.strictEqual(result.embeddings.length, 1);
        assert.strictEqual(ledgerEvents.filter(event => event.operation === 'reserve').length, 2);
        assert.strictEqual(ledgerEvents.filter(event => event.operation === 'reconcile').length, 2);
        return assert.rejects(gateway.execute('assistantGeneration', 'generate',
            { provider: 'directBypass', messages: [] }, {}, configuration), /cannot override/);
    })
    .then(() => {
        const disabledProvider = JSON.parse(JSON.stringify(configuration));
        disabledProvider.providers.testProvider.enabled = false;
        return assert.rejects(gateway.execute('assistantGeneration', 'generate',
            { messages: [{ role: 'user', content: 'hello' }] }, {}, disabledProvider), /No configured AI provider/);
    })
    .then(() => {
        const unsafe = JSON.parse(JSON.stringify(configuration));
        unsafe.providers.testProvider.apiKey = 'must-not-be-here';
        assert.throws(() => configurationService.validate(unsafe), /forbidden inline secret/);
        const unsafeLedger = JSON.parse(JSON.stringify(configuration));
        unsafeLedger.ledger.failClosed = false;
        assert.throws(() => configurationService.validate(unsafeLedger), /persistent token ledger/);
        const snapshot = configurationService.snapshot(configuration, { 'profiles.assistantGeneration': 'partnerProject' });
        assert(Object.isFrozen(snapshot));
        assert.strictEqual(snapshot.effective.providers.testProvider.secretReference, '[SECRET_REFERENCE]');
        assert.strictEqual(gateway.unregister('testProvider'), true);
        console.log('AI provider gateway contract tests passed');
    })
    .catch(error => {
        gateway.unregister('testProvider');
        throw error;
    });
