/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/test/AiKnowledgeRuntimeOperationsContract
 * @description Verifies durable ingestion, replay, failure recording, readiness, and activation conflicts.
 * @layer test
 * @owner aiKnowledge
 */
const assert = require('assert');
const baseConfiguration = require('../config/properties').aiKnowledge;
const operations = require('../src/service/operations/defaultAiKnowledgeOperationsService');
const readiness = require('../src/service/operations/defaultAiKnowledgeReadinessService');
const lifecycle = require('../src/service/lifecycle/defaultAiKnowledgeIndexLifecycleService');
const ingestion = require('../src/service/ingestion/defaultAiKnowledgeIngestionService');

const configuration = Object.assign({}, baseConfiguration, { enabled: true });
const previousConfig = global.CONFIG;
global.CONFIG = { get: name => name === 'aiKnowledge' ? configuration : {} };

function runRepository() {
    const values = [];
    return {
        values: values,
        get: input => Promise.resolve({ result: values.filter(value =>
            Object.keys(input.query || {}).every(key => value[key] === input.query[key])) }),
        save: input => {
            values.push(Object.assign({}, input.model));
            return Promise.resolve({ result: input.model });
        },
        update: input => {
            const value = values.find(item => item.runCode === input.query.runCode);
            if (!value) return Promise.resolve({ result: { modifiedCount: 0 } });
            Object.assign(value, input.model || {});
            return Promise.resolve({ result: { modifiedCount: 1 } });
        }
    };
}

const repository = runRepository();
const indexed = [];
const services = {
    documents: { save: () => Promise.resolve(true) },
    chunks: { save: () => Promise.resolve(true) },
    search: {
        doSave: input => { indexed.push(input.model); return Promise.resolve({ result: [{}] }); },
        doRefresh: () => Promise.resolve(true)
    }
};
const request = {
    tenant: 'tenant-a', authData: { tokenType: 'service' }, idempotencyKey: 'run-accepted-001',
    runService: repository, ingestionService: ingestion, services: services,
    body: {
        indexVersion: 'candidate-1',
        source: {
            sourceCode: 'docs', corpusCode: 'nodics',
            sourceType: 'PARTNER_DOCUMENTATION', path: 'nodicsdocs/source/pages/ai'
        },
        documents: [{
            sourceIdentity: 'guide', title: 'Guide', locator: '/guide',
            content: '# Guide\nProvider-neutral Knowledge search.', audience: 'DEVELOPER',
            classification: 'PUBLIC', version: '1'
        }]
    }
};

operations.ingest(request)
    .then(result => {
        assert.strictEqual(result.state, 'COMPLETED');
        assert.strictEqual(repository.values[0].state, 'COMPLETED');
        assert.strictEqual(indexed.length, 1);
        return operations.ingest(request);
    })
    .then(replay => {
        assert.strictEqual(replay.replayed, true);
        assert.strictEqual(indexed.length, 1, 'idempotent replay must not re-index chunks');
        const failedRepository = runRepository();
        return assert.rejects(operations.ingest(Object.assign({}, request, {
            idempotencyKey: 'run-failed-001',
            runService: failedRepository,
            services: Object.assign({}, services, {
                search: { doSave: () => Promise.reject(new Error('search unavailable')) }
            })
        })), /search unavailable/).then(() => {
            assert.strictEqual(failedRepository.values[0].state, 'FAILED');
            assert.ok(failedRepository.values[0].errorMessage.includes('search unavailable'));
        });
    })
    .then(() => readiness.check({
        tenant: 'tenant-a', authData: {}, configuration: configuration, corpusCode: 'nodics',
        searchService: { doCheckHealth: () => Promise.resolve(true) },
        corpusService: { get: () => Promise.resolve({
            result: [{ corpusCode: 'nodics', state: 'ACTIVE', activeIndexVersion: 'candidate-1' }]
        }) }
    }))
    .then(result => {
        assert.strictEqual(result.ready, true);
        assert.strictEqual(result.activeIndexVersion, 'candidate-1');
        return lifecycle.activate({
            tenant: 'tenant-a', authData: {}, configuration: configuration,
            corpusCode: 'nodics', indexVersion: 'candidate-2',
            chunkService: { get: () => Promise.resolve({ result: [{ chunkCode: 'c1' }] }) },
            corpusService: {
                get: () => Promise.resolve({ result: [{
                    corpusCode: 'nodics', activeIndexVersion: 'candidate-1', revision: 7
                }] }),
                update: () => Promise.resolve({ result: { modifiedCount: 0 } })
            }
        });
    })
    .then(() => assert.fail('Expected optimistic activation conflict'))
    .catch(error => {
        assert.strictEqual(error.code, 'ERR_AIK_00002', error.stack);
        global.CONFIG = previousConfig;
        console.log('AI Knowledge runtime operations contract validated');
    });
