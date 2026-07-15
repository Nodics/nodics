/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthP2IdentityIsolationContract
 * @description Proves tenant-scoped human and service security stamps, API-key
 * lifecycle policy, least-privilege scopes, and credential-free audit records.
 * @layer test
 * @owner nAuth
 * @override Project IAM modules may extend principal types and audit sinks while
 * preserving these isolation and redaction guarantees.
 */
const assert = require('assert');
const configuration = require('./authP2TestConfiguration').load();

class NodicsError extends Error {
    constructor(code, message) { super(message || code && code.message || String(code)); this.code = typeof code === 'string' ? code : code && code.code; }
}
global.CLASSES = { NodicsError };

const secret = 'auth-p2-test-jwt-secret-with-more-than-thirty-two-characters';
const pepper = 'auth-p2-test-api-key-pepper-with-more-than-thirty-two-characters';
const values = {
    profileModuleName: 'profile',
    nodeId: 'auth-p2-node-a',
    authSecurity: {
        jwt: { secret: secret, issuer: 'nodics-p2', audience: 'nodics-p2-services', algorithms: ['HS256'], requireJti: true, accessTokenExpiresIn: '5m', serviceTokenExpiresIn: '2m' },
        apiKey: { pepper: pepper, minimumPepperLength: 32, requireScopes: true, allowLegacyPlaintextLookup: false, allowLegacyHumanPrincipals: false },
        audit: { enabled: true },
        securityStamp: { enabled: true, failClosed: true, allowMissingStamp: false },
        internalToken: { crossTenantPermissions: ['auth.internal.token.read.anyTenant'], crossTenantGroups: [] }
    }
};
global.CONFIG = { get: key => values[key] };
global.UTILS = {
    getUserGroupCodes: groups => [].concat(groups || []).map(group => typeof group === 'string' ? group : group.code),
    getUserGroupPermissions: groups => [].concat(groups || []).reduce((all, group) => all.concat(group.permissions || []), [])
};

const stamps = new Map();
function stampKey(tenant, principalId) { return 'securityStamp:' + tenant + ':' + principalId; }

async function run() {
    const jwtProvider = require('../../src/service/authentication/defaultAuthenticationProviderService');
    const authSecurity = require('../../src/service/security/defaultAuthSecurityService');
    const stampService = require('../../src/service/identity/defaultPrincipalSecurityStampService');
    const serviceTokenService = require('../../src/service/identity/defaultServiceTokenService');
    const authorization = require('../../../nService/src/service/authorization/defaultAuthorizationProviderService');
    const credentialService = require('../../src/service/identity/defaultAPIKeyCredentialService');
    const employeeService = require('../../../../gCore/profile/src/service/employee/defaultEmployeeService');
    const auditService = require('../../src/service/audit/defaultAuthAuditService');
    const securedPipeline = require('../../../nRouter/src/service/request/defaultSecuredRequestPipelineService');

    global.SERVICE = {
        DefaultAuthenticationProviderService: {
            generateAuthToken: options => jwtProvider.generateAuthToken(options),
            addToken: (moduleName, expirable, key, value) => { stamps.set(key, Object.assign({}, value)); return Promise.resolve(value); },
            findToken: (moduleName, key) => stamps.has(key) ? Promise.resolve(Object.assign({}, stamps.get(key))) : Promise.reject(new NodicsError('ERR_CACHE_00001')),
            isTokenRevoked: () => Promise.resolve(false)
        },
        DefaultAuthSecurityService: authSecurity,
        DefaultPrincipalSecurityStampService: stampService,
        DefaultAPIKeyCredentialService: credentialService,
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) }
    };

    await stampService.register(configuration.tenant, 'human-a', 1);
    let humanToken = jwtProvider.generateAuthToken({ entCode: 'enterprise-a', tenant: configuration.tenant, loginId: 'human-a', principalType: 'human', authVersion: 1, userGroups: ['userGroup'], permissions: ['profile.read'] });
    assert.strictEqual((await authorization.authorizeToken({ authToken: humanToken })).result.tenant, configuration.tenant);

    await stampService.register('nodics_auth_other_test', 'human-a', 1);
    await stampService.register(configuration.tenant, 'human-a', 2);
    await assert.rejects(authorization.authorizeToken({ authToken: humanToken }), /stale/);

    let serviceToken = await serviceTokenService.issue({ entCode: 'enterprise-a', tenant: configuration.tenant, serviceId: 'service-a', authVersion: 3, userGroups: ['serviceAccountUserGroup'], permissions: ['profile.read'] });
    assert.strictEqual((await authorization.authorizeToken({ authToken: serviceToken })).result.serviceId, 'service-a');
    await serviceTokenService.revoke(configuration.tenant, 'service-a');
    await assert.rejects(authorization.authorizeToken({ authToken: serviceToken }), /stale/);

    let apiKey = 'auth-p2-client-generated-api-key-1234567890';
    let credential = credentialService.prepare(apiKey);
    assert.strictEqual(credential.apiKey, undefined);
    let principal = Object.assign({ code: 'service-a', loginId: 'service-a', active: true, principalType: 'service', apiKeyScopes: ['runtime.config.preview'] }, credential);
    employeeService.get = request => Promise.resolve({ result: request.query.apiKeyHash === principal.apiKeyHash ? [principal] : [] });
    assert.strictEqual((await employeeService.findByAPIKey({ tenant: configuration.tenant, apiKey: apiKey })).loginId, 'service-a');
    principal.apiKeyStatus = 'revoked';
    await assert.rejects(employeeService.findByAPIKey({ tenant: configuration.tenant, apiKey: apiKey }), /inactive, expired, or outside policy/);
    principal.apiKeyStatus = 'active';
    principal.apiKeyExpiresAt = new Date(Date.now() - 1000);
    await assert.rejects(employeeService.findByAPIKey({ tenant: configuration.tenant, apiKey: apiKey }), /inactive, expired, or outside policy/);
    principal.apiKeyExpiresAt = new Date(Date.now() + 60000);
    principal.apiKeyScopes = [];
    await assert.rejects(employeeService.findByAPIKey({ tenant: configuration.tenant, apiKey: apiKey }), /inactive, expired, or outside policy/);
    principal.apiKeyScopes = ['runtime.config.preview'];

    global.SERVICE.DefaultAuthAuditPublisher = { record: event => Promise.resolve(event) };
    values.authSecurity.audit.publisherService = 'DefaultAuthAuditPublisher';
    auditService.LOG = { info: function () {} };
    let audit = await auditService.record({
        eventType: 'api_key.authentication', outcome: 'success', tenant: configuration.tenant,
        principalId: 'service-a', correlationId: configuration.correlationId, requestId: 'request-a',
        apiKey: apiKey, authToken: humanToken, refreshToken: 'secret-refresh', password: 'secret-password'
    });
    assert.strictEqual(audit.correlationId, configuration.correlationId);
    assert.strictEqual(audit.requestId, 'request-a');
    ['apiKey', 'authToken', 'refreshToken', 'password'].forEach(property => assert.strictEqual(audit[property], undefined));

    let scopedRequest = { authData: { userGroups: ['serviceAccountUserGroup'], permissions: principal.apiKeyScopes }, router: { accessGroups: ['serviceAccountUserGroup'], permission: 'runtime.config.preview' } };
    securedPipeline.getRouteActionAuthorizationConfig = () => ({ enabled: true, strict: true, groupPermissions: {} });
    assert.strictEqual(securedPipeline.hasRoutePermission(scopedRequest), true);
    scopedRequest.router.permission = 'runtime.config.activate';
    assert.strictEqual(securedPipeline.hasRoutePermission(scopedRequest), false);

    assert(stamps.has(stampKey(configuration.tenant, 'human-a')));
    assert(stamps.has(stampKey(configuration.tenant, 'service-a')));
    console.log('nAuth P2 identity isolation contract validated');
}

run().catch(error => { console.error(error); process.exit(1); });
