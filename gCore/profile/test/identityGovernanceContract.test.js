/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'identityGovernance') {
            return {
                administrativeGroups: ['adminGroup', 'serviceAccountUserGroup'],
                systemAccessGroups: ['serviceAccountUserGroup'],
                permissionCatalog: ['profile.read', 'profile.write'],
                customerRegistration: { group: 'customerUserGroup', active: true }
            };
        }
        if (key === 'forceAPIKeyGenerate') return false;
        if (key === 'authSecurity') return { apiKey: { defaultLifetimeSeconds: 3600, pepper: 'test-api-key-pepper-with-more-than-thirty-two-characters' } };
        if (key === 'accessPoints') return { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3, fullAccessPoint: 10 };
        return undefined;
    }
};
global.UTILS = {
    isObject: value => value !== null && typeof value === 'object' && !Array.isArray(value),
    isBlank: value => value === undefined || value === null || (typeof value === 'object' && Object.keys(value).length === 0)
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    }
};
global.ENUMS = { ContactType: { EMAIL: { key: 'EMAIL' }, PHONE: { key: 'PHONE' }, FAX: { key: 'FAX' }, PAGER: { key: 'PAGER' } } };

const identityService = require('../../../gFramework/nAuth/src/service/identity/defaultIdentityGovernanceService');
const groupGovernance = require('../src/service/group/defaultUserGroupGovernanceService');
const principalGovernance = require('../src/service/identity/defaultPrincipalGovernanceService');
const registration = require('../src/service/customer/defaultCustomerRegistrationService');
const apiKeyInterceptor = require('../src/service/interceptors/defaultAPIKeyInterceptorService');
const apiKeyCredential = require('../../../gFramework/nAuth/src/service/identity/defaultAPIKeyCredentialService');
const employeeService = require('../src/service/employee/defaultEmployeeService');
const profileSchemas = require('../src/schemas/schemas').profile;
const schemaAccessHandler = require('../../../gFramework/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
registration.LOG = { debug: function () {} };

global.SERVICE = { DefaultIdentityGovernanceService: identityService, DefaultAPIKeyCredentialService: apiKeyCredential };

assert.strictEqual(identityService.hasAdministrativeAccess({ userGroups: ['adminGroup'] }), true);
assert.strictEqual(identityService.hasAdministrativeAccess({ userGroups: ['customerUserGroup'] }), false);
assert.deepStrictEqual(identityService.getSystemAuthData().userGroups, ['serviceAccountUserGroup']);

assert.throws(() => groupGovernance.validatePermissions([{ permissions: ['unknown.permission'] }]), /Unknown permission/);
assert.throws(() => groupGovernance.validateGraph([
    { code: 'one', active: true, parentGroups: ['two'] },
    { code: 'two', active: true, parentGroups: ['one'] }
], []), /Cyclic/);
assert.throws(() => groupGovernance.validateGraph([
    { code: 'active', active: true, parentGroups: ['inactive'] },
    { code: 'inactive', active: false }
], []), /Inactive parent/);

let registrationRequest = {
    model: {
        loginId: 'customer@example.com',
        userGroups: ['adminGroup'],
        apiKey: 'forbidden',
        permissions: ['profile.write']
    },
    defaultCustomerService: {}
};
let registrationState = { success: false, error: undefined };
registration.validateRequest(registrationRequest, {}, {
    nextSuccess: () => { registrationState.success = true; },
    error: (request, response, error) => { registrationState.error = error; }
});
assert.strictEqual(registrationState.success, true);
assert.deepStrictEqual(registrationRequest.model.userGroups, ['customerUserGroup']);
assert.strictEqual(registrationRequest.model.principalType, 'customer');
assert.strictEqual(registrationRequest.model.ownerId, 'customer@example.com');
assert.strictEqual(registrationRequest.model.ownerType, 'customer');
assert.strictEqual(registrationRequest.model.apiKey, undefined);
assert.strictEqual(registrationRequest.model.permissions, undefined);

['tenant', 'address', 'contact', 'enterprise', 'userState', 'userGroup', 'password', 'employee', 'customer'].forEach(schemaName => {
    assert(profileSchemas[schemaName].accessGroups, schemaName + ' must define explicit access groups');
    assert.strictEqual(profileSchemas[schemaName].accessGroups.adminGroup, 10);
    assert.strictEqual(profileSchemas[schemaName].accessGroups.serviceAccountUserGroup, 10);
});
assert.strictEqual(schemaAccessHandler.getAccessPoint({ userGroups: ['customerUserGroup'] }, profileSchemas.employee.accessGroups), 0);
assert.strictEqual(schemaAccessHandler.getAccessPoint({ userGroups: ['adminGroup'] }, profileSchemas.employee.accessGroups), 10);

(async function () {
    await assert.rejects(principalGovernance.validate({ model: {
        principalType: 'human', userGroups: ['serviceAccountUserGroup']
    } }), /Only service principals/);
    await assert.rejects(principalGovernance.validate({ model: {
        principalType: 'human', userGroups: ['employeeUserGroup'], apiKey: 'forbidden'
    } }), /API keys are restricted/);
    await assert.rejects(principalGovernance.validate({ model: {
        principalType: 'service', userGroups: ['serviceAccountUserGroup'], apiKey: 'too-short'
    } }), /at least 32 characters/);

    let groupLookupCount = 0;
    global.SERVICE.DefaultUserGroupService = {
        get: request => {
            groupLookupCount++;
            return Promise.resolve({ result: request.query.code.$in.map(code => ({ code: code, active: true })) });
        }
    };
    global.SERVICE.DefaultEmployeeService = {
        get: () => Promise.resolve({ result: [] })
    };
    await principalGovernance.validateSave({
        tenant: 'default',
        schemaModel: { schemaName: 'employee' },
        query: { code: 'newEmployee' },
        model: { code: 'newEmployee', principalType: 'human', userGroups: ['employeeUserGroup'] }
    });
    assert.strictEqual(groupLookupCount, 1, 'Save idempotency query must not be treated as a persisted-principal update');
    await assert.rejects(principalGovernance.validateUpdate({
        tenant: 'default',
        schemaModel: { schemaName: 'employee' },
        query: { code: 'missingEmployee' },
        model: { userGroups: ['employeeUserGroup'] }
    }), /requires an existing record/);

    let humanRequest = { tenant: 'default', model: { principalType: 'human', loginId: 'human' } };
    await apiKeyInterceptor.generateAPIKey(humanRequest, {});
    assert.strictEqual(humanRequest.model.apiKey, undefined, 'Human updates must not create API keys');

    let serviceRequest = { tenant: 'default', model: { principalType: 'service', loginId: 'service', apiKey: 'client-generated-key-value-1234567890' } };
    await apiKeyInterceptor.generateAPIKey(serviceRequest, {});
    assert.strictEqual(serviceRequest.model.apiKey, undefined);
    assert.strictEqual(serviceRequest.model.apiKeyHash, apiKeyCredential.digest('client-generated-key-value-1234567890'));
    assert.strictEqual(serviceRequest.model.apiKeyPrefix, 'client-g');
    assert.strictEqual(serviceRequest.model.apiKeyStatus, 'active');
    await assert.rejects(apiKeyInterceptor.generateAPIKey({ model: { apiKeyHash: 'caller-supplied-digest' }, authData: { loginId: 'admin' } }, {}), /governed credential service/);
    await assert.rejects(apiKeyInterceptor.generateAPIKey({ tenant: 'default', model: { principalType: 'service', rotateAPIKey: true } }, {}), /Server-generated API-key rotation is disabled/);

    let lookupQuery;
    employeeService.get = request => {
        lookupQuery = request.query;
        return Promise.resolve({ result: [{ loginId: 'service', principalType: 'service', apiKeyStatus: 'active', active: true }] });
    };
    let servicePrincipal = await employeeService.findByAPIKey({ tenant: 'default', apiKey: 'client-generated-key-value-1234567890' });
    assert.strictEqual(servicePrincipal.loginId, 'service');
    assert.strictEqual(lookupQuery.apiKeyHash, apiKeyCredential.digest('client-generated-key-value-1234567890'));
    assert.strictEqual(lookupQuery.apiKey, undefined);

    console.log('Profile identity governance contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
