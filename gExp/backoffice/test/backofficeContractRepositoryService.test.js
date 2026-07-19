/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficeContractRepositoryService
 * @description Validates durable history, automatic activation, pending decisions, replica CAS conflicts, rollback, retention, and restart recovery.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');

function generatedService(rows) {
    const matches = (row, query) => Object.keys(query || {}).every(key => row[key] === query[key]);
    return {
        get: async request => {
            let result = rows.filter(row => matches(row, request.query)).map(row => Object.assign({}, row));
            if (request.searchOptions && request.searchOptions.sort && request.searchOptions.sort.discoveredAt) {
                result.sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
            }
            if (request.searchOptions && request.searchOptions.limit) result = result.slice(0, request.searchOptions.limit);
            return { result: result };
        },
        save: async request => {
            if (rows.some(row => row.code === request.model.code)) throw new Error('duplicate code');
            rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        },
        update: async request => {
            let row = rows.find(item => matches(item, request.query));
            if (!row) return { result: { modifiedCount: 0 } };
            Object.assign(row, request.model);
            return { result: { modifiedCount: 1 } };
        },
        remove: async request => {
            let index = rows.findIndex(item => matches(item, request.query));
            if (index >= 0) rows.splice(index, 1);
            return { result: { deletedCount: index >= 0 ? 1 : 0 } };
        }
    };
}

let snapshots = [];
let activations = [];
global.CONFIG = { get: key => key === 'backofficeRegistry' ? { contractHistory: {
    historyLimit: 50, retentionPerModule: 3, automaticClassifications: ['INITIAL', 'UNCHANGED', 'NON_BREAKING'],
    approvalClassifications: ['POTENTIALLY_BREAKING', 'BREAKING']
} } : key === 'defaultTenant' ? 'default' : undefined };
global.SERVICE = {
    DefaultBackofficeContractSnapshotService: generatedService(snapshots),
    DefaultBackofficeContractActivationService: generatedService(activations)
};
global.CLASSES = { NodicsError: class NodicsError extends Error {} };
const definition = require('../src/service/contract/defaultBackofficeContractRepositoryService');
const repository = Object.assign({}, definition);

const snapshot = (hash, classification, operations) => ({ moduleName: 'cms', contractType: 'OPENAPI', contractVersion: 1,
    hash: hash.repeat(64).slice(0, 64), operations: (operations || []).map(id => ({ operationId: id })), schemas: [],
    changeClassification: classification, discoveredAt: new Date(Date.now() + snapshots.length).toISOString() });

async function run() {
    let first = snapshot('a', 'INITIAL', ['read']);
    await repository.recordDiscovery(first, {});
    let active = await repository.getActiveSnapshot('cms', {});
    assert.strictEqual(active.contractHash, first.hash);
    assert.strictEqual(active.activationRevision, 1);

    let second = snapshot('b', 'NON_BREAKING', ['read', 'create']);
    await repository.recordDiscovery(second, {});
    active = await repository.getActiveSnapshot('cms', {});
    assert.strictEqual(active.contractHash, second.hash);
    assert.strictEqual(active.activationRevision, 2);
    assert.strictEqual((await repository.getSnapshot('cms', first.hash, {})).state, 'SUPERSEDED');

    let breaking = snapshot('c', 'BREAKING', ['read']);
    let pending = await repository.recordDiscovery(breaking, {});
    assert.strictEqual(pending.state, 'PENDING_APPROVAL');
    assert.strictEqual((await repository.getActiveSnapshot('cms', {})).contractHash, second.hash);

    let decision = { reason: 'Reviewed compatibility impact', expectedRevision: 2, authData: { principalId: 'admin' } };
    let outcomes = await Promise.allSettled([
        repository.approve('cms', breaking.hash, decision),
        repository.approve('cms', breaking.hash, decision)
    ]);
    assert.strictEqual(outcomes.filter(item => item.status === 'fulfilled').length, 1, 'one replica decision must win the CAS race');
    assert.strictEqual(outcomes.filter(item => item.status === 'rejected').length, 1, 'stale replica decision must conflict');
    active = await repository.getActiveSnapshot('cms', {});
    assert.strictEqual(active.contractHash, breaking.hash);
    assert.strictEqual(active.activationRevision, 3);

    let rejectedCandidate = snapshot('d', 'POTENTIALLY_BREAKING', ['read', 'change']);
    await repository.recordDiscovery(rejectedCandidate, {});
    await assert.rejects(() => repository.reject('cms', rejectedCandidate.hash, { reason: 'Stale review', expectedRevision: 2,
        authData: { principalId: 'admin' } }));
    let rejected = await repository.reject('cms', rejectedCandidate.hash, { reason: 'Permission contract changed', expectedRevision: 3,
        authData: { principalId: 'admin' } });
    assert.strictEqual(rejected.state, 'REJECTED');

    let rolledBack = await repository.rollback('cms', second.hash, { reason: 'Restore known safe contract', expectedRevision: 3,
        authData: { principalId: 'admin' } });
    assert.strictEqual(rolledBack.activation.activeHash, second.hash);
    assert.strictEqual(rolledBack.activation.revision, 4);

    let restartedRepository = Object.assign({}, definition);
    assert.strictEqual((await restartedRepository.getActiveSnapshot('cms', {})).contractHash, second.hash,
        'a new repository instance must recover the durable active pointer');
    assert((await repository.getHistory('cms', { limit: 50 })).length <= 3, 'retention must remove old inactive history');
    console.log('BackOffice durable contract repository validated');
}

run().catch(error => { console.error(error); process.exit(1); });
