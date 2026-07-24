/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const path = require('path');
const schemas = require('../src/schemas/schemas').backoffice;

assert.strictEqual(schemas.backofficeAxisPolicy.definition.screenLockEnabled.type, 'bool',
    'persistent BackOffice boolean fields must use the MongoDB BSON bool type');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
};
global.CONFIG = {
    get: key => key === 'backofficeAxisPolicy' ? {
        code: 'axisEmployeeExperiencePolicy',
        contractVersion: 1,
        screenLockEnabled: true,
        idleTimeoutSeconds: 900,
        minimumIdleTimeoutSeconds: 60,
        maximumIdleTimeoutSeconds: 86400
    } : key === 'defaultTenant' ? 'default' : undefined
};

let persisted;
let audit;
global.SERVICE = {
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ tokenType: 'service' }) },
    DefaultBackofficeAxisPolicyService: {
        get: async () => ({ result: persisted ? [persisted] : [] }),
        save: async request => {
            persisted = Object.assign({}, request.model);
            return { result: [persisted] };
        },
        update: async request => {
            if (!persisted || persisted.revision !== request.query.revision) return { result: { modifiedCount: 0 } };
            persisted = Object.assign({}, persisted, request.model);
            return { result: { modifiedCount: 1 } };
        }
    },
    DefaultBackofficeAuditService: {
        record: async event => {
            audit = event;
            return true;
        }
    }
};

const service = require(path.resolve(__dirname, '../src/service/policy/defaultAxisExperiencePolicyService'));

(async () => {
    let fallback = await service.getEffective({ tenant: 'tenantA' });
    assert.deepStrictEqual(fallback, {
        contractVersion: 1,
        screenLockEnabled: true,
        idleTimeoutSeconds: 900,
        revision: 0,
        source: 'DEFAULT'
    });

    let created = await service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 600, expectedRevision: 0 }
    });
    assert.strictEqual(created.data.revision, 1);
    assert.strictEqual(persisted.idleTimeoutSeconds, 600);
    assert.strictEqual(audit.eventType, 'backoffice.axis.policy.updated');

    let effective = await service.getEffective({ tenant: 'tenantA' });
    assert.strictEqual(effective.source, 'PERSISTED');
    assert.strictEqual(effective.idleTimeoutSeconds, 600);

    let updated = await service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: false, idleTimeoutSeconds: 1200, expectedRevision: 1 }
    });
    assert.strictEqual(updated.data.revision, 2);
    assert.strictEqual(updated.data.screenLockEnabled, false);

    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 59, expectedRevision: 2 }
    }), /Invalid Axis employee screen-lock policy/);
    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 900, expectedRevision: 1 }
    }), /revision conflict/);
    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'service', principalId: 'module' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 900, expectedRevision: 2 }
    }), /human employee principal/);

    console.log('BackOffice Axis policy service tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
