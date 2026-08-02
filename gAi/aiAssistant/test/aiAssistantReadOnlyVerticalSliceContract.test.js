/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantReadOnlyVerticalSliceContract
 * @description Verifies employee ownership, redaction, prompt governance, Knowledge evidence, provider isolation, and event persistence.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const orchestration = require('../src/service/turn/defaultAiAssistantTurnOrchestrationService');
const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
const store = { conversations: [], messages: [], turns: [], events: [] };

function matches(value, query) {
    return Object.keys(query || {}).every(key => value[key] === query[key]);
}

function service(name) {
    return {
        save: input => { store[name].push(input.model); return Promise.resolve({ result: [input.model] }); },
        get: input => {
            let result = store[name].filter(value => matches(value, input.query));
            if (input.searchOptions && input.searchOptions.sort) {
                const key = Object.keys(input.searchOptions.sort)[0];
                const direction = input.searchOptions.sort[key];
                result.sort((left, right) => direction * (left[key] > right[key] ? 1 : -1));
            }
            return Promise.resolve({ result: result });
        },
        update: input => {
            assert.strictEqual(Object.prototype.hasOwnProperty.call(input.model, '$set'), false,
                'Generated schema services require plain update models');
            const target = store[name].find(value => matches(value, input.query));
            if (target) Object.assign(target, input.model);
            return Promise.resolve({ result: target ? [target] : [] });
        }
    };
}

const services = {
    conversations: service('conversations'), messages: service('messages'),
    turns: service('turns'), events: service('events')
};
const request = {
    tenant: 'default', definitionCode: 'axisAssistant', promptCode: 'axis-readonly',
    idempotencyKey: 'assistant-turn-00000001', message: 'Find admin@example.com documentation',
    authData: { loginId: 'admin', principalType: 'human', userGroups: ['employeeUserGroup'], permissions: ['enterprise.read'] },
    knowledge: {
        corpusCode: 'nodics', audience: 'DEVELOPER',
        allowedClassifications: ['PUBLIC'], query: 'enterprise'
    }
};
let providerRequest;
const runtime = {
    configuration: configuration, configurationRevision: 'assistant-config-1',
    services: services,
    promptService: {
        get: () => Promise.resolve({ result: [{
            promptCode: 'axis-readonly', version: 1, status: 'ACTIVE',
            instructions: 'Use only governed evidence.'
        }] })
    },
    knowledgeOperations: {
        retrieve: input => {
            assert.strictEqual(input.tenant, 'default');
            assert.strictEqual(input.body.scope.tenant, 'default');
            assert.strictEqual(input.body.scope.audience, 'DEVELOPER');
            assert.strictEqual(input.body.mode, 'INDEXED');
            return Promise.resolve({
                contractVersion: 1, mode: 'INDEXED', searchMode: 'LEXICAL',
            sufficientEvidence: true,
            evidence: [{
                evidenceId: 'e1', documentId: 'd1', chunkId: 'c1', score: 1,
                content: 'Enterprise records are Profile-owned.',
                citation: {
                    citationId: 'c1', documentId: 'd1', sourceId: 'nodicsdocs',
                    title: 'Profile', locator: '/profile', version: 'v1'
                }
            }]
            });
        }
    },
    providerGateway: {
        execute: (profile, operation, providerInput) => {
            providerRequest = { profile: profile, operation: operation, input: providerInput };
            return Promise.resolve({
                text: 'Enterprise documentation found.', finishReason: 'STOP',
                providerRequestId: 'provider-1', usage: { inputTokens: 10, outputTokens: 3 },
                usageReconciliation: { reservationId: 'reservation-1', state: 'RECONCILED' }
            });
        }
    }
};

orchestration.process(request, runtime)
    .then(result => {
        assert.strictEqual(result.result.text, 'Enterprise documentation found.');
        assert.strictEqual(providerRequest.profile, 'assistantGeneration');
        assert.strictEqual(providerRequest.input.messages[0].content.includes('admin@example.com'), false);
        assert(providerRequest.input.instructions.includes('governed knowledge evidence'));
        assert(providerRequest.input.instructions.includes('Enterprise records are Profile-owned.'));
        assert.strictEqual(result.knowledgeContext.scope.tenant, 'default');
        assert.strictEqual(result.knowledgeContext.citations[0].citationId, 'c1');
        assert(Object.isFrozen(result.knowledgeContext));
        assert(store.messages.some(message => message.redactionMetadata && message.redactionMetadata.redacted));
        assert(store.events.some(event => event.eventType === 'CITATIONS'));
        assert(store.events.some(event => event.eventType === 'COMPLETED'));
        assert.strictEqual(store.turns[0].state, 'COMPLETED');
        return assert.rejects(orchestration.process(Object.assign({}, request, {
            idempotencyKey: 'assistant-turn-00000002',
            authData: { loginId: 'customer', principalType: 'customer', userGroups: ['customerUserGroup'] }
        }), runtime), /human employee|customer/);
    })
    .then(() => {
        const providerError = new Error('AI_PROVIDER_QUOTA_EXCEEDED');
        providerError.code = 'AI_PROVIDER_QUOTA_EXCEEDED';
        providerError.retryable = false;
        providerError.aiProviderNormalized = true;
        providerError.providerDiagnostics = {
            category: 'QUOTA', retryable: false, status: 429
        };
        runtime.providerGateway.execute = () => Promise.reject(providerError);
        return assert.rejects(orchestration.process(Object.assign({}, request, {
            idempotencyKey: 'assistant-turn-00000003'
        }), runtime), error => error.code === 'AI_PROVIDER_QUOTA_EXCEEDED');
    })
    .then(() => {
        const failedEvent = store.events.filter(event => event.eventType === 'FAILED').pop();
        assert.strictEqual(failedEvent.data.code, 'AI_PROVIDER_QUOTA_EXCEEDED');
        assert.deepStrictEqual(failedEvent.data.providerFailure, {
            category: 'QUOTA', retryable: false, status: 429
        });
        assert.strictEqual(JSON.stringify(failedEvent).includes('provider billing'), false);
        assert.strictEqual(store.turns.filter(turn => turn.state === 'FAILED').pop().failureCode,
            'AI_PROVIDER_QUOTA_EXCEEDED');
        runtime.providerGateway.execute = () => {
            const turn = store.turns.find(value =>
                value.idempotencyKey === 'assistant-turn-00000004');
            turn.state = 'CANCELLATION_REQUESTED';
            turn.cancellationReason = 'EMPLOYEE_REQUEST';
            return Promise.resolve({
                text: 'Response completed during cancellation race.', finishReason: 'STOP',
                providerRequestId: 'provider-race', usage: { inputTokens: 8, outputTokens: 2 },
                usageReconciliation: { reservationId: 'reservation-race', state: 'RECONCILED' }
            });
        };
        return assert.rejects(orchestration.process(Object.assign({}, request, {
            idempotencyKey: 'assistant-turn-00000004'
        }), runtime), error => error.code === 'EMPLOYEE_CANCELLED');
    })
    .then(() => {
        const cancelled = store.turns.find(turn =>
            turn.idempotencyKey === 'assistant-turn-00000004');
        assert.strictEqual(cancelled.state, 'CANCELLED');
        assert(store.events.some(event =>
            event.turnCode === cancelled.turnCode && event.eventType === 'USAGE'));
        assert.strictEqual(store.events.filter(event =>
            event.turnCode === cancelled.turnCode && event.eventType === 'CANCELLED').length, 1);
    })
    .then(() => console.log('AI Assistant read-only vertical slice validated'));
