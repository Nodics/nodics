/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficeContractLifecycleService
 * @description Validates safe projections, comparisons, bounded decisions, optimistic revision forwarding, and sanitized decision audit.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');
const hash = 'a'.repeat(64);
const active = { moduleName: 'cms', contractType: 'OPENAPI', contractVersion: 1, contractHash: 'b'.repeat(64),
    operations: [{ operationId: 'read' }], schemas: ['cmsPage'], state: 'ACTIVE', revision: 1, activationRevision: 4 };
const candidate = { moduleName: 'cms', contractType: 'OPENAPI', contractVersion: 1, contractHash: hash,
    operations: [{ operationId: 'read' }, { operationId: 'create' }], schemas: ['cmsPage'], state: 'PENDING_APPROVAL',
    changeClassification: 'BREAKING', revision: 0 };
let calls = [];
let audits = [];
let historyRequest;
const repository = {
    getActiveSnapshot: async () => active,
    getHistory: async (moduleName, request) => { historyRequest = request; return [candidate, active]; },
    getSnapshot: async () => candidate,
    getActor: () => 'admin',
    approve: async (moduleName, value, request) => { calls.push(['approve', moduleName, value, request]); return { snapshot: Object.assign({}, candidate, { state: 'ACTIVE' }), activation: { revision: 5 } }; },
    reject: async (moduleName, value, request) => { calls.push(['reject', moduleName, value, request]); return Object.assign({}, candidate, { state: 'REJECTED' }); },
    rollback: async (moduleName, value, request) => { calls.push(['rollback', moduleName, value, request]); return { snapshot: active, activation: { revision: 5 } }; }
};
global.SERVICE = { DefaultBackofficeContractRepositoryService: repository,
    DefaultBackofficeAuditService: { record: async event => { audits.push(event); return event; } } };
global.CONFIG = { get: key => key === 'backofficeRegistry' ? { contractHistory: { historyLimit: 50 } } : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error {} };
const service = require('../src/service/contract/defaultBackofficeContractLifecycleService');
const request = operation => ({ params: { moduleName: 'cms', hash: hash }, body: {
    reason: operation + ' after review', expectedRevision: 4
}, authData: { principalId: 'admin' } });

async function run() {
    assert.strictEqual((await service.current({ params: { moduleName: 'cms' } })).data.snapshot.contractHash, active.contractHash);
    assert.strictEqual((await service.history({ params: { moduleName: 'cms' }, query: { limit: '2' } })).data.snapshots.length, 2);
    assert.strictEqual(historyRequest.limit, 2);
    let comparison = await service.compare({ params: { moduleName: 'cms', hash: hash } });
    assert.deepStrictEqual(comparison.data.addedOperations, ['create']);
    assert.deepStrictEqual(comparison.data.removedOperations, []);
    await service.approve(request('approve'));
    await service.reject(request('reject'));
    await service.rollback(request('rollback'));
    assert.strictEqual(calls.length, 3);
    assert.strictEqual(calls[0][3].expectedRevision, 4);
    assert.strictEqual(audits.length, 3);
    assert.strictEqual(audits[0].candidateHash, hash);
    await assert.rejects(() => service.approve({ params: { moduleName: 'cms', hash: hash }, body: { reason: '', expectedRevision: 4 } }));
    await assert.rejects(() => service.approve({ params: { moduleName: 'cms', hash: hash }, body: { reason: 'valid', expectedRevision: -1 } }));
    await assert.rejects(() => service.current({ params: { moduleName: '../cms' } }));
    await assert.rejects(() => service.compare({ params: { moduleName: 'cms', hash: 'not-a-hash' } }));
    await assert.rejects(() => service.history({ params: { moduleName: 'cms' }, query: { limit: '0' } }));
    console.log('BackOffice contract lifecycle service validated');
}

run().catch(error => { console.error(error); process.exit(1); });
