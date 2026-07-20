/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates tenant isolation, boundaries, idempotency, failure recovery, and concurrency for audit reconciliation. */
const assert = require('assert');
const properties = require('../config/properties').publish;

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}

global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'publish' ? properties : undefined };
global.SERVICE = {};

const journal = code => [
    { publicationCode: code, fromState: null, toState: 'STAGED', revision: 0 },
    { publicationCode: code, fromState: 'STAGED', toState: 'VALIDATING', revision: 1 }
];
const publications = [
    { code: 'page-a', auditTrail: journal('page-a') },
    { code: 'page-b', auditTrail: journal('page-b') }
];
const projections = new Set(['page-a_0_STAGED']);
let requestedTenant;
let requestedLimit;
let failCode;
const repository = {
    list: async (request, limit) => {
        requestedTenant = request.tenant;
        requestedLimit = limit;
        let selected = request.publicationCode ? publications.filter(item => item.code === request.publicationCode) : publications;
        return selected.slice(0, limit);
    },
    getAuditCodes: async code => new Set([...projections].filter(item => item.startsWith(code + '_'))),
    appendAudit: async entry => {
        let code = entry.publicationCode + '_' + entry.revision + '_' + entry.toState;
        if (code === failCode) throw new NodicsError('PROJECTION_FAILED', 'projection unavailable');
        projections.add(code);
        return entry;
    }
};
properties.providers.repositoryProvider = repository;
const service = require('../src/service/defaultPublicationAuditReconciliationService');

(async () => {
    let first = await service.reconcile({ tenant: 'tenant-a', batchSize: 1 });
    assert.strictEqual(requestedTenant, 'tenant-a');
    assert.strictEqual(requestedLimit, 1, 'configured batch boundaries must reach the repository query');
    assert.deepStrictEqual({ scanned: first.scanned, missing: first.missing, restored: first.restored, failed: first.failed },
        { scanned: 1, missing: 1, restored: 1, failed: 0 });

    let replay = await service.reconcile({ tenant: 'tenant-a', publicationCode: 'page-a' });
    assert.strictEqual(replay.missing, 0, 'complete projections must not be written again');

    failCode = 'page-b_1_VALIDATING';
    let partialFailure = await service.reconcile({ tenant: 'tenant-a', publicationCode: 'page-b' });
    assert.deepStrictEqual({ missing: partialFailure.missing, restored: partialFailure.restored, failed: partialFailure.failed },
        { missing: 2, restored: 1, failed: 1 });
    assert.deepStrictEqual(partialFailure.failures[0], {
        publicationCode: 'page-b', revision: 1, errorCode: 'PROJECTION_FAILED'
    }, 'failure summaries must remain sanitized');

    failCode = undefined;
    let recovered = await service.reconcile({ tenant: 'tenant-a', publicationCode: 'page-b' });
    assert.deepStrictEqual({ missing: recovered.missing, restored: recovered.restored, failed: recovered.failed },
        { missing: 1, restored: 1, failed: 0 });

    projections.delete('page-b_1_VALIDATING');
    let concurrent = await Promise.all([
        service.reconcile({ tenant: 'tenant-a', publicationCode: 'page-b' }),
        service.reconcile({ tenant: 'tenant-a', publicationCode: 'page-b' })
    ]);
    assert.strictEqual(projections.has('page-b_1_VALIDATING'), true);
    assert.strictEqual(concurrent.reduce((count, result) => count + result.failed, 0), 0,
        'concurrent reconcilers must rely on deterministic idempotent projection writes');

    let originalNow = Date.now;
    let clock = 0;
    Date.now = () => ++clock;
    let timed = await service.reconcile({ tenant: 'tenant-a', maxDurationMs: 1 });
    Date.now = originalNow;
    assert.strictEqual(timed.timedOut, true, 'execution must stop at the configured duration boundary');
    assert.strictEqual(timed.scanned, 0);

    console.log('nPublish audit projection reconciliation validated');
})().catch(error => { console.error(error); process.exit(1); });
