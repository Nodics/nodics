/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates publication lifecycle success, concurrency, idempotency, provider, boundary, failure, and rollback behavior. */
const assert = require('assert');
const properties = require('../config/properties').publish;

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'publish' ? properties : key === 'defaultTenant' ? 'default' : undefined };
global.SERVICE = {};

const records = new Map();
const audits = new Map();
const repository = {
    get: async code => records.get(code),
    create: async model => { if (!records.has(model.code)) records.set(model.code, Object.assign({}, model)); return records.get(model.code); },
    transition: async (publication, expected, patch) => {
        let current = records.get(publication.code);
        if (Number(current.revision) !== Number(expected)) throw new NodicsError('ERR_PUB_00004', 'Publication revision conflict');
        current = Object.assign({}, current, patch, { revision: Number(current.revision) + 1 });
        records.set(current.code, current);
        return current;
    },
    transitionWithAudit: async (publication, expected, patch, audit) => {
        let entry = Object.assign({}, audit, { revision: Number(publication.revision) + 1 });
        let updated = await repository.transition(publication, expected,
            Object.assign({}, patch, { auditTrail: [].concat(publication.auditTrail || [], [entry]) }));
        await repository.appendAudit(entry);
        return updated;
    },
    appendAudit: async audit => { audits.set(audit.publicationCode + '_' + audit.revision + '_' + audit.toState, audit); return audit; }
};
let activated = 0;
let rolledBack = 0;
let approvalRequests = 0;
const versionProvider = {
    getVersion: async publication => ({ code: publication.sourceVersion }),
    getOnlineVersion: async () => ({ version: 'v0' }),
    activate: async publication => { activated++; return { version: publication.sourceVersion, authorization: 'must-not-be-audited' }; },
    rollback: async (publication, target) => { rolledBack++; return { restored: target }; }
};
const adapter = {
    resolveDependencies: async () => ['component-a'],
    validate: async () => ({ valid: true, secret: 'must-not-be-audited' })
};
properties.providers.repositoryProvider = repository;
properties.providers.versionProvider = versionProvider;
properties.providers.domainAdapters = { cms: adapter };
properties.providers.workflowProvider = { requestApproval: async () => { approvalRequests++; } };

const service = require('../src/service/defaultPublicationLifecycleService');
const request = (revision, extra) => Object.assign({ tenant: 'tenant-a', publicationCode: 'page-home',
    expectedRevision: revision, authData: { principalId: 'editor-a' }, correlationId: 'correlation-a' }, extra || {});

(async () => {
    let created = await service.create(Object.assign(request(undefined), { publication: {
        code: 'page-home', domain: 'cms', rootType: 'page', rootCode: 'home', sourceVersion: 'v1'
    } }));
    assert.strictEqual(created.state, 'STAGED');
    assert.strictEqual(created.revision, 0);
    assert.strictEqual(created.auditTrail.length, 1);
    assert.strictEqual((await service.create(Object.assign(request(undefined), { publication: {
        code: 'page-home', domain: 'cms', rootType: 'page', rootCode: 'home', sourceVersion: 'v1'
    } }))).code, 'page-home', 'create must be idempotent');

    let validated = await service.validate(request(0));
    assert.strictEqual(validated.state, 'VALIDATED');
    assert.deepStrictEqual(validated.dependencies, ['component-a']);
    assert.strictEqual(validated.validation.secret, undefined, 'stored validation evidence must remove secrets');
    assert.strictEqual(validated.auditTrail.length, 3, 'state and authoritative audit journal must advance together');

    let pending = await service.requestApproval(request(2));
    assert.strictEqual((await service.requestApproval(request(pending.revision))).state, 'PENDING_APPROVAL');
    assert.strictEqual(approvalRequests, 2, 'approval retries must redeliver through an idempotent workflow provider');
    let approved = await service.approve(request(pending.revision));
    let online = await service.activate(request(approved.revision));
    assert.strictEqual(online.state, 'ONLINE');
    assert.strictEqual(online.previousOnlineVersion, 'v0');
    assert.strictEqual(activated, 1);
    assert.strictEqual((await service.activate(request(online.revision))).state, 'ONLINE');
    assert.strictEqual(activated, 1, 'online replay must not activate twice');

    let replay = await service.publishApproved(Object.assign(request(undefined), { publication: {
        code: 'page-home', domain: 'cms', rootType: 'page', rootCode: 'home', sourceVersion: 'v1'
    } }));
    assert.strictEqual(replay.state, 'ONLINE', 'approved workflow replay must return the existing Online release');
    assert.strictEqual(activated, 1, 'approved workflow replay must not deploy twice');

    let rollback = await service.rollback(request(online.revision));
    assert.strictEqual(rollback.state, 'ROLLED_BACK');
    assert.strictEqual(rolledBack, 1);
    assert.strictEqual((await service.rollback(request(rollback.revision))).state, 'ROLLED_BACK');
    assert.strictEqual(rolledBack, 1, 'rollback replay must be idempotent');
    assert([...audits.values()].every(audit => !JSON.stringify(audit).includes('must-not-be-audited')));

    records.set('invalid', { code: 'invalid', domain: 'cms', state: 'STAGED', revision: 0 });
    await assert.rejects(service.approve(request(0, { publicationCode: 'invalid' })), /Invalid publication transition/);
    await assert.rejects(service.validate(request(9, { publicationCode: 'invalid' })), /revision conflict/);

    records.set('failure', { code: 'failure', domain: 'cms', state: 'APPROVED', revision: 0, sourceVersion: 'bad' });
    let originalActivate = versionProvider.activate;
    versionProvider.activate = async () => { throw new NodicsError('PROVIDER_FAILED', 'Provider failed'); };
    await assert.rejects(service.activate(request(0, { publicationCode: 'failure' })), /Provider failed/);
    assert.strictEqual(records.get('failure').state, 'FAILED');
    versionProvider.activate = originalActivate;

    records.set('activation-recovery', { code: 'activation-recovery', domain: 'cms', state: 'ACTIVATING', revision: 4,
        sourceVersion: 'v2' });
    assert.strictEqual((await service.activate(request(4, { publicationCode: 'activation-recovery' }))).state, 'ONLINE',
        'activation retries must resume an in-progress provider operation');

    records.set('rollback-recovery', { code: 'rollback-recovery', domain: 'cms', state: 'ROLLING_BACK', revision: 7,
        sourceVersion: 'v2', previousOnlineVersion: 'v1' });
    assert.strictEqual((await service.rollback(request(7, { publicationCode: 'rollback-recovery' }))).state, 'ROLLED_BACK',
        'rollback retries must resume an in-progress provider operation');

    properties.lifecycle.maxDependencies = 0;
    records.set('bounded', { code: 'bounded', domain: 'cms', state: 'STAGED', revision: 0, sourceVersion: 'v1' });
    await assert.rejects(service.validate(request(0, { publicationCode: 'bounded' })), /dependency boundary/);
    assert.strictEqual(records.get('bounded').state, 'FAILED');
    properties.lifecycle.maxDependencies = 10000;

    console.log('nPublish lifecycle orchestration validated');
})().catch(error => { console.error(error); process.exit(1); });
