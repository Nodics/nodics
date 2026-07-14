/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/test/profileAuthenticationServiceContract
 * @description Verifies profile password authentication, failed-login state updates, customer/employee lookup boundaries, refresh-token creation, security-stamp registration, audit events, and API-key authentication.
 * @layer test
 * @owner profile
 * @override Project authentication providers may override credential lookup or token delivery in later layers, but must preserve tenant resolution, principal policy, audit, state, and API-key boundaries.
 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            if (code instanceof Error) {
                super(message || code.message);
                this.code = code.code;
                this.cause = code;
            } else {
                super(message || code);
                this.code = code;
            }
        }
    }
};

const configValues = {
    attemptsToLockAccount: 2,
    profileModuleName: 'profile',
    authSecurity: {
        refreshToken: {
            expiresInSeconds: 900
        },
        audit: {
            failClosed: true
        }
    }
};

global.CONFIG = {
    get: function (key) {
        return configValues[key];
    }
};

global.UTILS = {
    compareHash: function (candidate, stored) {
        compareCalls.push({ candidate, stored });
        return Promise.resolve(candidate === stored);
    },
    getUserGroupCodes: function (groups) {
        return (groups || []).map(group => group.code || group);
    },
    getUserGroupPermissions: function (groups) {
        return (groups || []).reduce((permissions, group) => permissions.concat(group.permissions || []), []);
    }
};

const compareCalls = [];
const auditEvents = [];
const stateSaves = [];
const tokenAdds = [];
const generatedTokens = [];
const stampRegistrations = [];
const lookups = [];

const enterprise = {
    code: 'electronics',
    tenant: {
        code: 'tenantA'
    }
};

const employee = {
    _id: 'employee-id',
    loginId: 'employee@example.com',
    active: true,
    principalType: 'human',
    authVersion: 3,
    password: {
        active: true,
        password: 'correct-password'
    },
    userGroups: [{
        code: 'employeeUserGroup',
        permissions: ['profile.employee.read']
    }]
};

const customer = {
    _id: 'customer-id',
    loginId: 'customer@example.com',
    active: true,
    principalType: 'customer',
    authVersion: 5,
    password: {
        active: true,
        password: 'customer-password'
    },
    userGroups: [{
        code: 'customerUserGroup',
        permissions: ['profile.customer.read']
    }]
};

global.SERVICE = {
    DefaultEnterpriseService: {
        retrieveEnterprise: function (entCode) {
            lookups.push({ service: 'enterprise', entCode });
            return Promise.resolve(enterprise);
        }
    },
    DefaultEmployeeService: {
        findByLoginId: function (request) {
            lookups.push({ service: 'employeeLogin', request });
            return Promise.resolve(employee);
        },
        findByAPIKey: function (request) {
            lookups.push({ service: 'employeeApiKey', request });
            return Promise.resolve({
                loginId: 'service-account',
                principalType: 'service',
                apiKeyStatus: 'active',
                active: true
            });
        }
    },
    DefaultCustomerService: {
        findByLoginId: function (request) {
            lookups.push({ service: 'customerLogin', request });
            return Promise.resolve(customer);
        }
    },
    DefaultUserStateService: {
        findUserState: function (request) {
            lookups.push({ service: 'userState', request });
            return Promise.resolve({
                loginId: request.loginId,
                attempts: request.loginId === 'failed-user' ? 1 : 4,
                locked: false
            });
        },
        save: function (request) {
            stateSaves.push(request);
            return Promise.resolve({ code: 'SUC_STATE_SAVED' });
        }
    },
    DefaultPrincipalSecurityStampService: {
        register: function (tenant, principalId, version) {
            stampRegistrations.push({ tenant, principalId, version });
            return Promise.resolve(true);
        }
    },
    DefaultAuthAuditService: {
        record: function (event) {
            auditEvents.push(event);
            return Promise.resolve(true);
        }
    }
};

const service = require('../src/service/authentication/defaultAuthenticationProviderService');
service.LOG = { debug: function () {}, error: function () {} };
service.addToken = function (moduleName, isExpirable, key, value, ttl) {
    tokenAdds.push({ moduleName, isExpirable, key, value, ttl });
    return Promise.resolve(true);
};
service.generateAuthToken = function (options) {
    generatedTokens.push(options);
    return 'access-token-' + options.loginId;
};

function resetCalls() {
    compareCalls.length = 0;
    auditEvents.length = 0;
    stateSaves.length = 0;
    tokenAdds.length = 0;
    generatedTokens.length = 0;
    stampRegistrations.length = 0;
    lookups.length = 0;
}

(async function run() {
    resetCalls();
    const employeeResult = await service.authenticateEmployee({
        entCode: 'electronics',
        loginId: 'employee@example.com',
        password: 'correct-password'
    });
    assert.strictEqual(employeeResult.code, 'SUC_AUTH_00001');
    assert.strictEqual(employeeResult.result.authToken, 'access-token-employee@example.com');
    assert(employeeResult.result.refreshToken, 'Employee authentication must return a refresh token');
    assert.deepStrictEqual(lookups.slice(0, 3).map(item => item.service), ['enterprise', 'employeeLogin', 'userState']);
    assert.deepStrictEqual(lookups[1].request, { tenant: 'tenantA', loginId: 'employee@example.com' });
    assert.strictEqual(stateSaves[0].tenant, 'tenantA');
    assert.strictEqual(stateSaves[0].model.attempts, 0);
    assert.strictEqual(tokenAdds[0].moduleName, 'profile');
    assert.strictEqual(tokenAdds[0].isExpirable, true);
    assert.strictEqual(tokenAdds[0].value.loginId, 'employee@example.com');
    assert.strictEqual(tokenAdds[0].value.type, 'Employee');
    assert.strictEqual(tokenAdds[0].value.authVersion, 3);
    assert.deepStrictEqual(tokenAdds[0].value.userGroups, ['employeeUserGroup']);
    assert.deepStrictEqual(tokenAdds[0].value.permissions, ['profile.employee.read']);
    assert.strictEqual(tokenAdds[0].ttl, 900);
    assert.strictEqual(generatedTokens[0].tenant, 'tenantA');
    assert.strictEqual(generatedTokens[0].loginId, 'employee@example.com');
    assert.deepStrictEqual(generatedTokens[0].permissions, ['profile.employee.read']);
    assert.deepStrictEqual(stampRegistrations[0], { tenant: 'tenantA', principalId: 'employee@example.com', version: 3 });
    assert.strictEqual(auditEvents[0].eventType, 'password.authentication');
    assert.strictEqual(auditEvents[0].outcome, 'success');

    resetCalls();
    const customerResult = await service.authenticateCustomer({
        entCode: 'electronics',
        loginId: 'customer@example.com',
        password: 'customer-password'
    });
    assert.strictEqual(customerResult.code, 'SUC_AUTH_00001');
    assert.strictEqual(customerResult.result.authToken, 'access-token-customer@example.com');
    assert.deepStrictEqual(lookups.slice(0, 3).map(item => item.service), ['enterprise', 'customerLogin', 'userState']);
    assert.strictEqual(tokenAdds[0].value.type, 'Customer');
    assert.deepStrictEqual(tokenAdds[0].value.userGroups, ['customerUserGroup']);
    assert.deepStrictEqual(tokenAdds[0].value.permissions, ['profile.customer.read']);

    resetCalls();
    await assert.rejects(() => service.authenticate({
        request: {
            password: 'wrong-password'
        },
        enterprise: enterprise,
        person: Object.assign({}, employee, { loginId: 'failed-user', password: { active: true, password: 'correct-password' } }),
        type: 'Employee'
    }), error => error.code === 'ERR_AUTH_00002');
    assert.strictEqual(stateSaves[0].model.attempts, 2);
    assert.strictEqual(stateSaves[0].model.locked, true);
    assert(stateSaves[0].model.lockedTime instanceof Date);
    assert.strictEqual(auditEvents[0].eventType, 'password.authentication');
    assert.strictEqual(auditEvents[0].outcome, 'failure');
    assert.strictEqual(auditEvents[0].reasonCode, 'INVALID_CREDENTIALS');

    resetCalls();
    const apiKeyResult = await service.authenticateAPIKey({
        entCode: 'electronics',
        apiKey: 'client-generated-key-value-1234567890'
    });
    assert.strictEqual(apiKeyResult.tenant, 'tenantA');
    assert.strictEqual(apiKeyResult.enterprise.code, 'electronics');
    assert.strictEqual(apiKeyResult.person.loginId, 'service-account');
    assert.deepStrictEqual(lookups.map(item => item.service), ['enterprise', 'employeeApiKey']);
    assert.deepStrictEqual(lookups[1].request, {
        tenant: 'tenantA',
        apiKey: 'client-generated-key-value-1234567890'
    });
    assert.strictEqual(auditEvents[0].eventType, 'api_key.authentication');
    assert.strictEqual(auditEvents[0].outcome, 'success');
    assert.strictEqual(auditEvents[0].principalId, 'service-account');

    console.log('Profile authentication service contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
