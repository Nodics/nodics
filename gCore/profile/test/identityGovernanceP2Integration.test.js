/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/test/IdentityGovernanceP2Integration
 * @description Exercises preview, persisted apply, idempotent repeat, service
 * credential rotation, failure audit, and rollback using an isolated durable
 * test repository.
 * @layer test
 * @owner profile
 * @override Project identity modules may reuse this lifecycle against their
 * dedicated integration database without changing framework migration code.
 */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const p2Configuration = require('../../../gFramework/nAuth/test/integration/authP2TestConfiguration').load();

class NodicsError extends Error {
    constructor(code, message) { super(message || code && code.message || String(code)); this.code = typeof code === 'string' ? code : code && code.code; }
}
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => ({
    defaultTenant: p2Configuration.tenant,
    authSecurity: { apiKey: { pepper: 'auth-p2-migration-pepper-with-more-than-thirty-two-characters', minimumPepperLength: 32, defaultLifetimeSeconds: 3600 } },
    identityGovernance: {
        permissionCatalog: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant'],
        migration: {
            version: 2,
            servicePrincipalCodes: ['apiAdmin'],
            servicePrincipalScopes: { apiAdmin: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant'] },
            administratorCodes: ['admin'],
            serviceGroup: 'serviceAccountUserGroup',
            administratorGroups: ['adminGroup', 'runtimeConfigAdminUserGroup'],
            humanDefaultGroup: 'employeeUserGroup',
            customerGroup: 'customerUserGroup',
            groupTargets: {
                userGroup: { parentGroups: [] },
                adminGroup: { parentGroups: ['userGroup'] },
                serviceAccountUserGroup: { parentGroups: ['userGroup'], permissions: ['auth.internal.token.read'] }
            }
        }
    }
})[key] };

function clone(value) { return JSON.parse(JSON.stringify(value)); }

class PersistentIdentityRepository {
    constructor(file, initial) {
        this.file = file;
        this.failureCode = null;
        fs.writeFileSync(file, JSON.stringify(initial, null, 2));
    }
    read() { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    write(state) { fs.writeFileSync(this.file, JSON.stringify(state, null, 2)); }
    service(collection) {
        return {
            get: request => {
                let state = this.read();
                let query = request.query || {};
                let result = (state[collection] || []).filter(record => Object.keys(query).every(key => record[key] === query[key]));
                return Promise.resolve({ result: clone(result), success: true });
            },
            save: request => {
                let state = this.read();
                state[collection] = state[collection] || [];
                state[collection].push(clone(request.model));
                this.write(state);
                return Promise.resolve(true);
            },
            update: request => {
                let state = this.read();
                let query = request.query || {};
                let index = (state[collection] || []).findIndex(record => Object.keys(query).every(key => record[key] === query[key]));
                if (index < 0) return Promise.reject(new NodicsError('ERR_AUTH_00003', 'Fixture record not found'));
                if (this.failureCode && state[collection][index].code === this.failureCode) return Promise.reject(new NodicsError('ERR_AUTH_00000', 'Injected migration persistence failure'));
                let record = state[collection][index];
                Object.keys(request.model.$set || {}).forEach(key => {
                    if (request.model.$set[key] === undefined) delete record[key];
                    else record[key] = clone(request.model.$set[key]);
                });
                Object.keys(request.model.$unset || {}).forEach(key => delete record[key]);
                this.write(state);
                return Promise.resolve(true);
            }
        };
    }
}

function fixture() {
    return {
        userGroups: [
            { code: 'userGroup', parentGroups: ['adminGroup'], permissions: [] },
            { code: 'adminGroup', parentGroups: [], permissions: [] },
            { code: 'serviceAccountUserGroup', parentGroups: ['adminGroup'], permissions: [] }
        ],
        employees: [
            { code: 'admin', loginId: 'admin', active: true, userGroups: ['adminGroup'], apiKey: 'legacy-human-secret' },
            { code: 'apiAdmin', loginId: 'apiAdmin', active: true, userGroups: ['adminGroup'], apiKey: 'legacy-service-secret' }
        ],
        customers: [{ code: 'customer-a', loginId: 'customer-a', active: true, userGroups: ['userGroup'], apiKey: 'legacy-customer-secret', addresses: ['address-a'], contacts: ['contact-a'] }],
        addresses: [{ code: 'address-a' }],
        contacts: [{ code: 'contact-a' }],
        audits: []
    };
}

function wire(repository) {
    global.SERVICE = {
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultAPIKeyCredentialService: require('../../../gFramework/nAuth/src/service/identity/defaultAPIKeyCredentialService'),
        DefaultUserGroupService: repository.service('userGroups'),
        DefaultEmployeeService: repository.service('employees'),
        DefaultCustomerService: repository.service('customers'),
        DefaultAddressService: repository.service('addresses'),
        DefaultContactService: repository.service('contacts'),
        DefaultIdentityMigrationAuditService: repository.service('audits')
    };
}

async function run() {
    let directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-auth-p2-'));
    let file = path.join(directory, p2Configuration.database + '.json');
    let repository = new PersistentIdentityRepository(file, fixture());
    wire(repository);
    let migration = require('../src/service/identity/defaultIdentityGovernanceMigrationService');
    let request = { tenant: p2Configuration.tenant, authData: { loginId: 'migration-operator' }, correlationId: p2Configuration.correlationId };
    try {
        let beforePreview = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
        let preview = await migration.previewMigration(request);
        assert(preview.data.changeCount > 0);
        assert.strictEqual(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), beforePreview, 'Preview must not mutate persistence');

        let applied = await migration.applyMigration(request);
        assert.strictEqual(applied.data.status, 'APPLIED');
        let persisted = fs.readFileSync(file, 'utf8');
        ['legacy-human-secret', 'legacy-service-secret', 'legacy-customer-secret'].forEach(secret => assert.strictEqual(persisted.includes(secret), false));
        let repeat = await migration.applyMigration(request);
        assert.strictEqual(repeat.data.status, 'NO_CHANGES');
        assert.strictEqual(repeat.data.preview.idempotent, true);

        let replacement = 'auth-p2-client-generated-rotation-key-1234567890';
        let rotated = await migration.rotateServiceKey(Object.assign({}, request, { identityMigration: { principalCode: 'apiAdmin', newApiKey: replacement } }));
        assert.strictEqual(rotated.data.status, 'CREDENTIAL_ROTATED');
        persisted = fs.readFileSync(file, 'utf8');
        assert.strictEqual(persisted.includes(replacement), false);
        assert(repository.read().employees.find(item => item.code === 'apiAdmin').apiKeyHash);

        let rolledBack = await migration.rollbackMigration(Object.assign({}, request, { identityMigration: { auditCode: applied.data.code } }));
        assert.strictEqual(rolledBack.data.credentialsRestored, false);
        assert.strictEqual(fs.readFileSync(file, 'utf8').includes('legacy-service-secret'), false);
        let repeatedRollback = await migration.rollbackMigration(Object.assign({}, request, { identityMigration: { auditCode: applied.data.code } }));
        assert.strictEqual(repeatedRollback.data.idempotent, true);

        let failedFile = path.join(directory, p2Configuration.database + '-failure.json');
        let failedRepository = new PersistentIdentityRepository(failedFile, fixture());
        failedRepository.failureCode = 'apiAdmin';
        wire(failedRepository);
        await assert.rejects(migration.applyMigration(request), /Injected migration persistence failure/);
        let failedAudit = failedRepository.read().audits.find(audit => audit.status === 'FAILED');
        assert(failedAudit, 'Partial migration failure must be persisted for recovery');
        assert.strictEqual(JSON.stringify(failedAudit).includes('legacy-service-secret'), false);
        failedRepository.failureCode = null;
        let recovered = await migration.rollbackMigration(Object.assign({}, request, { identityMigration: { auditCode: failedAudit.code } }));
        assert.strictEqual(recovered.data.status, 'ROLLED_BACK');

        console.log('Profile identity governance P2 persisted integration validated');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

run().catch(error => { console.error(error); process.exit(1); });
