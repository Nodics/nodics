/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/test/AiKnowledgeVerticalSliceContract
 * @description Verifies explicit documentation-pack ingestion, nSearch delegation, citations, isolation, and root-doc rejection.
 * @layer test
 * @owner aiKnowledge
 */
const assert = require('assert');
const configuration = require('../config/properties').aiKnowledge;
const ingestion = require('../src/service/ingestion/defaultAiKnowledgeIngestionService');
const retrieval = require('../src/service/retrieval/defaultAiKnowledgeRetrievalService');
assert.deepStrictEqual(retrieval.citationNavigation('//evil.example/path'), {
    navigationType: 'NONE'
});
assert.deepStrictEqual(retrieval.citationNavigation('javascript:alert(1)'), {
    navigationType: 'NONE'
});
const lifecycle = require('../src/service/lifecycle/defaultAiKnowledgeIndexLifecycleService');
const stored = { documents: [], chunks: [], indexed: [] };
const service = target => ({ save: input => { stored[target].push(input.model); return Promise.resolve(true); } });
const services = {
    documents: service('documents'), chunks: service('chunks'),
    search: { doSave: input => { stored.indexed.push(input.model); return Promise.resolve(true); } }
};
const input = {
    tenant: 'default', authData: { tokenType: 'service' }, configuration: configuration,
    source: {
        sourceCode: 'nodics-docs', corpusCode: 'nodics',
        sourceType: 'PARTNER_DOCUMENTATION', path: 'nodicsdocs/source/pages/ai'
    },
    indexVersion: 'candidate-1', services: services,
    documents: [{
        sourceIdentity: 'ai/providers', title: 'AI Providers', locator: '/ai/providers',
        content: '# Providers\nUse the provider-neutral gateway.', audience: 'DEVELOPER',
        classification: 'PUBLIC', version: '1'
    }]
};

ingestion.ingest(input)
    .then(result => {
        assert.strictEqual(result.documents, 1);
        assert.strictEqual(result.chunks, 1);
        assert.strictEqual(stored.indexed[0].locator, '/ai/providers');
        return retrieval.retrieve({
            tenant: 'default', authData: {}, configuration: configuration, corpusCode: 'nodics',
            audience: 'DEVELOPER', allowedClassifications: ['PUBLIC'], query: 'provider gateway',
            corpusService: {
                get: () => Promise.resolve({
                    result: [{ corpusCode: 'nodics', activeIndexVersion: 'candidate-1', state: 'ACTIVE' }]
                })
            },
            searchService: {
                doSearch: request => {
                    assert.strictEqual(request.moduleName, 'aiKnowledge');
                    assert.strictEqual(request.searchRequest.filters.tenantCode, 'default');
                    assert.strictEqual(request.searchRequest.filters.indexVersion, 'candidate-1');
                    return Promise.resolve({
                        result: {
                            hits: {
                                hits: [{
                                    _score: 0.9,
                                    _source: stored.indexed[0]
                                }]
                            }
                        }
                    });
                }
            }
        });
    })
    .then(result => {
        assert.strictEqual(result.sufficientEvidence, true);
        assert.strictEqual(result.evidence[0].citation.locator, '/ai/providers');
        assert.strictEqual(result.evidence[0].citation.navigationType, 'INTERNAL_ROUTE');
        assert.strictEqual(result.evidence[0].citation.navigationTarget, '/ai/providers');
        return lifecycle.activate({
            tenant: 'default', authData: {}, configuration: configuration,
            corpusCode: 'nodics', indexVersion: 'candidate-1',
            chunkService: { get: () => Promise.resolve({ result: [stored.chunks[0]] }) },
            corpusService: {
                get: () => Promise.resolve({
                    result: [{
                        corpusCode: 'nodics', activeIndexVersion: 'v0',
                        state: 'ACTIVE', revision: 3
                    }]
                }),
                update: request => {
                    assert.strictEqual(request.query.revision, 3);
                    assert.strictEqual(request.model.revision, 4);
                    assert.strictEqual(request.model.activeIndexVersion, 'candidate-1');
                    return Promise.resolve({ result: { modifiedCount: 1 } });
                }
            }
        });
    })
    .then(activation => {
        assert.strictEqual(activation.activeVersion, 'candidate-1');
        return assert.rejects(ingestion.ingest(Object.assign({}, input, {
            source: Object.assign({}, input.source, { path: 'docs/planned.md' })
        })), /Temporary root docs/);
    })
    .then(() => assert.rejects(retrieval.retrieve({
        tenant: 'default', authData: {}, configuration: configuration, corpusCode: 'nodics',
        audience: 'DEVELOPER', allowedClassifications: ['SECRET'], query: 'provider gateway',
        scope: { tenant: 'default' }
    }), error => {
        assert.strictEqual(error.code, 'ERR_AIK_00004');
        return true;
    }))
    .then(() => assert.rejects(retrieval.retrieve({
        tenant: 'default', authData: {}, configuration: configuration, corpusCode: 'nodics',
        audience: 'DEVELOPER', allowedClassifications: ['PUBLIC'], query: 'provider gateway',
        scope: { tenant: 'other-tenant' }
    }), error => {
        assert.strictEqual(error.code, 'ERR_AIK_00004');
        return true;
    }))
    .then(() => console.log('AI Knowledge documentation vertical slice validated'));
