const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    }
};

const values = {
    defaultTenant: 'default',
    profileModuleName: 'profile',
    authSecurity: {
        apiKey: { defaultLifetimeSeconds: 3600, pepper: 'test-api-key-pepper-with-more-than-thirty-two-characters' },
        securityStamp: { enabled: true, failClosed: true, allowMissingStamp: false }
    },
    identityGovernance: {
        migration: {
            version: 1,
            servicePrincipalCodes: ['apiAdmin'],
            administratorCodes: ['admin'],
            serviceGroup: 'serviceAccountUserGroup',
            administratorGroups: ['adminGroup', 'runtimeConfigAdminUserGroup'],
            humanDefaultGroup: 'employeeUserGroup',
            customerGroup: 'customerUserGroup',
            groupTargets: {
                userGroup: { parentGroups: [] },
                adminGroup: { parentGroups: ['userGroup'] },
                serviceAccountUserGroup: { parentGroups: ['userGroup'], permissions: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant'] }
            }
        },
        separationOfDuties: {
            requireActor: true,
            preventSelfDecision: true,
            preventRequesterActivation: true,
            preventApproverActivation: true
        }
    }
};
global.CONFIG = { get: key => values[key] };
global.UTILS = {
    isObject: value => value !== null && typeof value === 'object' && !Array.isArray(value)
};

const ownership = require('../../../gFramework/nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService');
const ownedSchema = { rawSchema: { ownership: { enabled: true, ownerProperty: 'ownerId', principalTypes: ['customer'], subjectGroups: ['customerUserGroup'], bypassGroups: ['adminGroup'] } } };

async function validateOwnership() {
    let create = { schemaModel: ownedSchema, authData: { loginId: 'customer-a', principalType: 'customer', userGroups: ['customerUserGroup'] }, model: { code: 'record-a' } };
    await ownership.enforce(create, 'create');
    assert.strictEqual(create.model.ownerId, 'customer-a');
    assert.strictEqual(create.model.createdBy, 'customer-a');
    let read = { schemaModel: ownedSchema, authData: create.authData, query: { active: true } };
    await ownership.enforce(read, 'read');
    assert.strictEqual(read.query.ownerId, 'customer-a');
    let legacyRead = { schemaModel: ownedSchema, authData: { loginId: 'customer-a', userGroups: ['customerUserGroup'] }, query: {} };
    await ownership.enforce(legacyRead, 'read');
    assert.strictEqual(legacyRead.query.ownerId, 'customer-a', 'Missing principal type must not bypass ownership');
    let remove = { schemaModel: ownedSchema, authData: create.authData, codes: ['record-a'] };
    await ownership.enforce(remove, 'remove');
    assert.deepStrictEqual(remove.query, { code: { $in: ['record-a'] }, ownerId: 'customer-a' }, 'Owned deletes must preserve the requested record selector');
    let serviceSignup = { schemaModel: ownedSchema, authData: { serviceId: 'signup-service', userGroups: ['userGroup'] }, model: { ownerId: 'customer-a' } };
    await ownership.enforce(serviceSignup, 'create');
    assert.strictEqual(serviceSignup.model.ownerId, 'customer-a', 'Non-subject service flows must preserve explicit registration ownership');
    await assert.rejects(ownership.enforce({ schemaModel: ownedSchema, authData: create.authData, model: { ownerId: 'customer-b' } }, 'create'));
    let admin = { schemaModel: ownedSchema, authData: { loginId: 'admin', principalType: 'human', userGroups: ['adminGroup'] }, query: {} };
    await ownership.enforce(admin, 'read');
    assert.strictEqual(admin.query.ownerId, undefined);
}

async function validateSecurityStamp() {
    let cache = {};
    global.SERVICE = {
        DefaultAuthenticationProviderService: {
            addToken: (moduleName, expirable, key, value) => { cache[key] = value; return Promise.resolve(true); },
            findToken: (moduleName, key) => cache[key] ? Promise.resolve(cache[key]) : Promise.reject(new Error('missing'))
        }
    };
    const stamp = require('../../../gFramework/nAuth/src/service/identity/defaultPrincipalSecurityStampService');
    await stamp.register('default', 'user-a', 7);
    await stamp.validate({ tenant: 'default', loginId: 'user-a', authVersion: 7, tokenType: 'access' });
    await assert.rejects(stamp.validate({ tenant: 'default', loginId: 'user-a', authVersion: 6, tokenType: 'access' }));
    await assert.rejects(stamp.validate({ tenant: 'default', loginId: 'user-a', tokenType: 'access' }));
    await assert.rejects(stamp.validateConfiguration(), /shared auth cache/);
    values.cache = { profile: { channels: { auth: { engine: 'redis', fallback: false } } } };
    await stamp.validateConfiguration();
    delete values.cache;
}

async function validatePasswordStampTargeting() {
    let updates = [];
    global.SERVICE = {
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultEmployeeService: {
            get: () => Promise.resolve({ result: [] }),
            update: request => { updates.push({ schema: 'employee', request: request }); return Promise.resolve(true); }
        },
        DefaultCustomerService: {
            get: () => Promise.resolve({ result: [{ loginId: 'customer-a' }] }),
            update: request => { updates.push({ schema: 'customer', request: request }); return Promise.resolve(true); }
        }
    };
    const governance = require('../src/service/identity/defaultPrincipalSecurityStampGovernanceService');
    await governance.bumpLoginId({ tenant: 'default', query: { loginId: 'customer-a' }, model: { password: 'hash' } });
    assert.deepStrictEqual(updates.map(update => update.schema), ['customer'], 'Password changes must stamp only the resolved principal collection');
}

async function validateStableAndTransitiveStamping() {
    let registered = [];
    let principalUpdates = [];
    let employeeQueries = [];
    global.SERVICE = {
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultPrincipalSecurityStampService: {
            register: (tenant, principalId, version) => { registered.push({ tenant, principalId, version }); return Promise.resolve(true); }
        },
        DefaultEmployeeService: {
            get: request => {
                employeeQueries.push(request.query);
                if (request.query.code === 'employee-code') return Promise.resolve({ result: [{ code: 'employee-code', loginId: 'employee-login' }] });
                return Promise.resolve({ result: [{ loginId: 'inherited-user' }] });
            },
            update: request => { principalUpdates.push(request); return Promise.resolve(true); }
        },
        DefaultCustomerService: { get: () => Promise.resolve({ result: [] }), update: () => Promise.resolve(true) },
        DefaultUserGroupService: {
            get: () => Promise.resolve({ result: [
                { code: 'baseGroup', parentGroups: [] },
                { code: 'childGroup', parentGroups: ['baseGroup'] },
                { code: 'grandchildGroup', parentGroups: ['childGroup'] }
            ] })
        }
    };
    const governance = require('../src/service/identity/defaultPrincipalSecurityStampGovernanceService');
    let request = { tenant: 'default', schemaModel: { schemaName: 'employee' }, query: { code: 'employee-code' }, model: { $set: { active: false } } };
    await governance.preparePrincipalUpdate(request);
    await governance.registerPreparedPrincipalUpdate(request);
    assert.strictEqual(registered[0].principalId, 'employee-login', 'Stamp cache must use the token loginId rather than record code');
    assert.strictEqual(request.model.$set.authVersion, registered[0].version);

    await governance.bumpGroupMembers({ tenant: 'default', query: { code: 'baseGroup' }, model: { $set: { permissions: ['changed'] } } });
    let membershipQuery = employeeQueries.find(query => query.userGroups);
    assert.deepStrictEqual(membershipQuery.userGroups.$in.sort(), ['baseGroup', 'childGroup', 'grandchildGroup']);
    assert(principalUpdates.some(update => update.query.loginId === 'inherited-user'));
}

async function validateEffectivePartialUpdates() {
    const principalGovernance = require('../src/service/identity/defaultPrincipalGovernanceService');
    const groupGovernance = require('../src/service/group/defaultUserGroupGovernanceService');
    global.SERVICE = {
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultEmployeeService: {
            get: () => Promise.resolve({ result: [{ code: 'service-a', principalType: 'service', userGroups: ['serviceAccountUserGroup'] }] })
        },
        DefaultUserGroupService: {
            get: () => Promise.resolve({ result: [
                { code: 'parent', active: true, parentGroups: [] },
                { code: 'child', active: true, parentGroups: ['parent'], permissions: [] },
                { code: 'serviceAccountUserGroup', active: true, parentGroups: [] }
            ] })
        }
    };
    await assert.rejects(principalGovernance.validate({
        tenant: 'default', schemaModel: { schemaName: 'employee' }, query: { code: 'service-a' }, model: { $set: { principalType: 'human' } }
    }), /Only service principals/);
    await groupGovernance.validate({ tenant: 'default', query: { code: 'child' }, model: { $set: { permissions: [] } } });
}

async function validateMigration() {
    global.SERVICE = {
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultAPIKeyCredentialService: require('../../../gFramework/nAuth/src/service/identity/defaultAPIKeyCredentialService')
    };
    const migration = require('../src/service/identity/defaultIdentityGovernanceMigrationService');
    let state = {
        groups: [{ code: 'userGroup', parentGroups: ['adminGroup'] }, { code: 'adminGroup', parentGroups: [] }, { code: 'serviceAccountUserGroup', parentGroups: ['adminGroup'], permissions: [] }],
        employees: [
            { code: 'admin', loginId: 'admin', principalType: undefined, userGroups: ['adminGroup'], apiKey: 'legacy-human-key' },
            { code: 'apiAdmin', loginId: 'apiAdmin', principalType: undefined, userGroups: ['adminGroup'], apiKey: 'legacy-service-key' },
            { code: 'customService', loginId: 'customService', principalType: 'service', userGroups: ['customServiceGroup'], apiKey: 'custom-service-key' },
            { code: 'migratedService', loginId: 'migratedService', principalType: 'service', userGroups: ['serviceAccountUserGroup'], apiKey: 'migrated-service-key', identityMigrationVersion: 1 }
        ],
        customers: [{ code: 'customer-a', loginId: 'customer-a', principalType: undefined, userGroups: ['userGroup'], apiKey: 'legacy-customer-key', addresses: ['address-a'], contacts: ['contact-a'] }],
        addresses: [{ code: 'address-a' }],
        contacts: [{ code: 'contact-a' }]
    };
    let preview = migration.buildPreview(state);
    assert.strictEqual(preview.changeCount, 10);
    assert.strictEqual(preview.changes.find(change => change.code === 'admin').to.revokeAPIKey, true);
    assert.strictEqual(preview.changes.find(change => change.code === 'apiAdmin').to.rotationRequired, true);
    let customServiceChange = preview.changes.find(change => change.code === 'customService');
    assert.strictEqual(customServiceChange.to.principalType, 'service');
    assert(customServiceChange.to.userGroups.includes('customServiceGroup'));
    assert.strictEqual(customServiceChange.to.revokeAPIKey, false);
    assert.strictEqual(customServiceChange.to.revokeLegacyAPIKey, true);
    assert.strictEqual(preview.changes.find(change => change.code === 'migratedService').to.revokeLegacyAPIKey, true, 'Migration version alone must not preserve plaintext credentials');
    let snapshot = migration.snapshot(preview);
    assert.strictEqual(JSON.stringify(snapshot).includes('legacy-human-key'), false);
    assert.strictEqual(JSON.stringify(snapshot).includes('legacy-service-key'), false);
    let writes = [];
    let savedAudit;
    let auditUpdates = [];
    global.SERVICE.DefaultUserGroupService = { update: request => { writes.push({ schema: 'userGroup', request: request }); return Promise.resolve(true); } };
    global.SERVICE.DefaultEmployeeService = {
        update: request => { writes.push({ schema: 'employee', request: request }); return Promise.resolve(true); },
        get: request => Promise.resolve({ result: [{ code: request.query.code, loginId: request.query.code, principalType: 'service', userGroups: ['serviceAccountUserGroup'] }] })
    };
    global.SERVICE.DefaultCustomerService = { update: request => { writes.push({ schema: 'customer', request: request }); return Promise.resolve(true); } };
    global.SERVICE.DefaultAddressService = { update: request => { writes.push({ schema: 'address', request: request }); return Promise.resolve(true); } };
    global.SERVICE.DefaultContactService = { update: request => { writes.push({ schema: 'contact', request: request }); return Promise.resolve(true); } };
    global.SERVICE.DefaultIdentityMigrationAuditService = {
        save: request => { savedAudit = request.model; return Promise.resolve(true); },
        update: request => { auditUpdates.push(request); return Promise.resolve(true); },
        get: () => Promise.resolve({ result: [Object.assign({}, savedAudit, { status: 'APPLIED' })] })
    };
    migration.loadState = () => Promise.resolve(state);
    let applied = await migration.applyMigration({ tenant: 'default', authData: { loginId: 'admin' }, correlationId: 'migration-test' });
    assert.deepStrictEqual(applied.data.result.serviceKeyRotationsRequired.sort(), ['apiAdmin', 'customService', 'migratedService']);
    assert.strictEqual(applied.rotatedSecrets, undefined, 'Migration must never generate or return credential material');
    assert.strictEqual(JSON.stringify(savedAudit).includes('legacy-human-key'), false);
    let revokedHumanWrite = writes.find(write => write.schema === 'employee' && write.request.query.code === 'admin');
    assert.strictEqual(revokedHumanWrite.request.model.$unset.apiKey, 1);
    let rollback = await migration.rollbackMigration({ tenant: 'default', authData: { loginId: 'admin' }, identityMigration: { auditCode: savedAudit.code } });
    assert.strictEqual(rollback.data.credentialsRestored, false);
    assert(auditUpdates.some(update => update.model.$set.status === 'ROLLED_BACK'));
    assert(writes.some(write => write.request.query && write.request.query.code === 'migratedService'), 'Plaintext credentials must be migrated even when the structural migration version is current');
    let customServiceWrites = writes.filter(write => write.schema === 'employee' && write.request.query.code === 'customService');
    assert.strictEqual(customServiceWrites[customServiceWrites.length - 1].request.model.$unset.apiKey, 1, 'Rollback must never restore a legacy plaintext service credential');
    let clientKey = 'client-generated-service-key-value-1234567890';
    let rotation = await migration.rotateServiceKey({ tenant: 'default', authData: { loginId: 'admin' }, identityMigration: { principalCode: 'apiAdmin', newApiKey: clientKey } });
    assert.strictEqual(rotation.data.status, 'CREDENTIAL_ROTATED');
    assert.strictEqual(rotation.data.newApiKey, undefined);
    assert(writes.some(write => write.schema === 'employee' && write.request.model.$set.apiKeyHash === global.SERVICE.DefaultAPIKeyCredentialService.digest(clientKey)));
    assert.strictEqual(writes.some(write => write.schema === 'employee' && write.request.model.$set.apiKey === clientKey), false);
    assert.strictEqual(JSON.stringify(savedAudit).includes(clientKey), false, 'Credential audit must never contain the supplied key');
    state.employees = state.employees.map(principal => {
        let target = migration.targetPrincipal(principal, 'employee');
        return Object.assign({}, principal, target, {
            apiKey: undefined,
            apiKeyHash: target.principalType === 'service' ? 'migrated-key-digest' : undefined,
            identityMigrationVersion: values.identityGovernance.migration.version
        });
    });
    state.customers = state.customers.map(principal => Object.assign({}, principal, migration.targetPrincipal(principal, 'customer'), { apiKey: undefined }));
    state.groups = state.groups.map(group => Object.assign({}, group, values.identityGovernance.migration.groupTargets[group.code] || {}));
    state.addresses = state.addresses.map(record => Object.assign({}, record, { ownerId: 'customer-a', ownerType: 'customer', createdBy: 'customer-a', updatedBy: 'customer-a' }));
    state.contacts = state.contacts.map(record => Object.assign({}, record, { ownerId: 'customer-a', ownerType: 'customer', createdBy: 'customer-a', updatedBy: 'customer-a' }));
    assert.strictEqual(migration.buildPreview(state).idempotent, true, 'A completed migration must be safe to rerun');
}

function validateSeparationOfDuties() {
    const service = require('../../../gFramework/nDynamo/src/service/audit/defaultRuntimeConfigurationActivationRequestService');
    assert.throws(() => service.createRequestModel({}, { configurationType: 'routerConfiguration' }, {}), /authenticated actor/);
    assert.throws(() => service.assertDecisionSeparation({ requestedBy: 'same-user' }, 'same-user'), /cannot approve or reject/);
    assert.throws(() => service.assertActivationSeparation({ requestedBy: 'requester', approvedBy: 'approver' }, 'requester'), /requester cannot activate/i);
    assert.throws(() => service.assertActivationSeparation({ requestedBy: 'requester', approvedBy: 'approver' }, 'approver'), /approver cannot activate/i);
    assert.doesNotThrow(() => service.assertActivationSeparation({ requestedBy: 'requester', approvedBy: 'approver' }, 'operator'));
}

Promise.resolve()
    .then(validateOwnership)
    .then(validateSecurityStamp)
    .then(validatePasswordStampTargeting)
    .then(validateStableAndTransitiveStamping)
    .then(validateEffectivePartialUpdates)
    .then(validateMigration)
    .then(validateSeparationOfDuties)
    .then(() => console.log('Profile identity governance P1 contract validated'))
    .catch(error => { console.error(error); process.exit(1); });
