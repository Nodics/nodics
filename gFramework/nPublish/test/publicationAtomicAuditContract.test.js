/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates atomic publication state/journal persistence and audit-projection failure isolation. */
const assert = require('assert');

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}

global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : undefined };

let updateRequest;
let projectionAttempts = 0;
global.SERVICE = {
    DefaultPublicationRequestService: {
        update: async request => {
            updateRequest = request;
            return { result: { modifiedCount: 1 } };
        }
    },
    DefaultPublicationAuditService: {
        save: async () => {
            projectionAttempts++;
            throw new Error('projection unavailable');
        },
        get: async () => ({ result: [] })
    }
};

const repository = require('../src/service/defaultPublicationRepositoryService');

(async () => {
    let publication = { code: 'page-home', state: 'APPROVED', revision: 4, auditTrail: [{ revision: 4 }] };
    let updated = await repository.transitionWithAudit(publication, 4, { state: 'ACTIVATING' }, {
        publicationCode: publication.code,
        fromState: 'APPROVED',
        toState: 'ACTIVATING',
        actor: 'publisher-a'
    }, { tenant: 'tenant-a' });

    assert.strictEqual(updated.state, 'ACTIVATING');
    assert.strictEqual(updated.revision, 5);
    assert.strictEqual(updated.auditTrail.length, 2);
    assert.strictEqual(updated.auditTrail[1].revision, 5);
    assert.strictEqual(updateRequest.query.revision, 4, 'state/journal write must retain optimistic compare-and-set');
    assert.strictEqual(updateRequest.tenant, 'tenant-a', 'publication CAS must remain scoped to the authenticated tenant');
    assert.strictEqual(updateRequest.model.state, 'ACTIVATING');
    assert.strictEqual(updateRequest.model.auditTrail[1].toState, 'ACTIVATING');
    assert.strictEqual(projectionAttempts, 1, 'projection must be attempted after the authoritative atomic write');

    SERVICE.DefaultPublicationRequestService.update = async () => ({ result: { modifiedCount: 0 } });
    await assert.rejects(repository.transitionWithAudit(publication, 3, { state: 'ACTIVATING' }, {
        publicationCode: publication.code, fromState: 'APPROVED', toState: 'ACTIVATING'
    }, { tenant: 'tenant-a' }), /revision conflict/);
    assert.strictEqual(projectionAttempts, 1, 'a failed CAS must not emit an audit projection');

    SERVICE.DefaultPublicationRequestService.get = async request => ({ result: [{ code: 'shared-code', tenantEvidence: request.tenant }] });
    assert.strictEqual((await repository.get('shared-code', { tenant: 'tenant-a' })).tenantEvidence, 'tenant-a');
    assert.strictEqual((await repository.get('shared-code', { tenant: 'tenant-b' })).tenantEvidence, 'tenant-b');

    console.log('nPublish atomic audit contract validated');
})().catch(error => { console.error(error); process.exit(1); });
