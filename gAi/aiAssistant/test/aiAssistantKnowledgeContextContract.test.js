/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantKnowledgeContextContract
 * @description Verifies authoritative Knowledge delegation, trusted scope, immutable evidence, bounded token estimates, and failure behavior.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const service = require('../src/service/context/defaultAiAssistantKnowledgeContextService');

const identity = {
    tenantCode: 'tenant-a',
    enterpriseCode: 'enterprise-a',
    applicationCode: 'axis'
};
const knowledge = {
    corpusCode: 'nodicsDocumentation',
    audience: 'DEVELOPER',
    allowedClassifications: ['PUBLIC'],
    query: 'How do I create an enterprise?',
    mode: 'INDEXED',
    searchMode: 'LEXICAL',
    locale: 'en'
};

let delegated;
service.retrieve({
    identity: identity,
    authData: { loginId: 'employee-a' },
    knowledge: Object.assign({ tenant: 'tenant-b' }, knowledge),
    knowledgeOperations: {
        retrieve: request => {
            delegated = request;
            return Promise.resolve({
                contractVersion: 1,
                mode: 'INDEXED',
                searchMode: 'LEXICAL',
                sufficientEvidence: true,
                evidence: [{
                    evidenceId: 'chunk-1',
                    documentId: 'document-1',
                    chunkId: 'chunk-1',
                    score: 1.5,
                    content: 'Enterprise is owned by Profile.',
                    citation: {
                        citationId: 'chunk-1',
                        documentId: 'document-1',
                        sourceId: 'nodicsdocs',
                        title: 'Enterprise guide',
                        locator: '/profile/enterprise',
                        version: 'v2'
                    }
                }]
            });
        }
    }
}).then(context => {
    assert.strictEqual(delegated.tenant, 'tenant-a');
    assert.strictEqual(delegated.body.scope.tenant, 'tenant-a');
    assert.strictEqual(delegated.body.scope.enterprise, 'enterprise-a');
    assert.strictEqual(delegated.body.scope.project, 'axis');
    assert.strictEqual(delegated.body.scope.locale, 'en');
    assert.strictEqual(context.activeIndexVersion, 'v2');
    assert(context.estimatedTokens > 0);
    assert(Object.isFrozen(context));
    assert(Object.isFrozen(context.evidence));
    assert(Object.isFrozen(context.evidence[0].citation));
    assert(service.providerInstructions(context).includes('"citationId":"chunk-1"'));
    return assert.rejects(service.retrieve({
        identity: identity,
        authData: { loginId: 'employee-a' },
        knowledge: knowledge,
        knowledgeOperations: {}
    }), /operations authority is unavailable/);
}).then(() => {
    const empty = service.empty();
    assert.strictEqual(empty.requested, false);
    assert.strictEqual(empty.sufficientEvidence, true);
    assert.strictEqual(service.providerInstructions(empty), '');
    console.log('AI Assistant Knowledge context contract validated');
});
