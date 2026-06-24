const assert = require('assert');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const repositoryRoot = path.resolve(__dirname, '../../..');
const authSecurity = require('../src/utils/authSecurity');

function configuration(values) {
    return {
        get: function (key) {
            return values[key];
        }
    };
}

const strongSecret = 'test-only-strong-secret-with-more-than-thirty-two-characters';
const secureConfiguration = configuration({
    authSecurity: {
        jwt: {
            secret: strongSecret,
            issuer: 'contract-test',
            audience: 'contract-services',
            algorithms: ['HS256'],
            accessTokenExpiresIn: '5m',
            serviceTokenExpiresIn: '2m'
        }
    },
    profile: {
        jwtSignOptions: { algorithm: 'HS256' },
        jwtVerifyOptions: { algorithm: ['HS256'] }
    }
});

assert.throws(() => authSecurity.getJwtSecret(configuration({})), /strong JWT secret/);
assert.throws(() => authSecurity.getJwtSecret(configuration({ jwtSecretKey: 'nodics' })), /strong JWT secret/);
assert.throws(() => authSecurity.getSignOptions(secureConfiguration, { lifetime: true }), /Non-expiring/);
assert.deepStrictEqual(authSecurity.getVerifyOptions(secureConfiguration).algorithms, ['HS256']);
assert.strictEqual(authSecurity.getVerifyOptions(secureConfiguration).algorithm, undefined);

global.CONFIG = secureConfiguration;
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error) {
            super(error && error.message || String(error));
        }
    },
    CacheError: class CacheError extends Error {}
};

const provider = require('../src/service/authentication/defaultAuthenticationProviderService');
const accessToken = provider.generateAuthToken({
    entCode: 'enterprise-a',
    tenant: 'tenant-a',
    loginId: 'user-a',
    principalType: 'customer',
    authVersion: 7,
    refreshToken: 'must-not-leak',
    apiKey: 'must-not-leak',
    userGroups: ['userGroup'],
    permissions: ['profile.read']
});
const payload = jwt.verify(accessToken, strongSecret, authSecurity.getVerifyOptions(secureConfiguration));
assert.strictEqual(payload.entCode, 'enterprise-a');
assert.strictEqual(payload.tenant, 'tenant-a');
assert.strictEqual(payload.tokenType, 'access');
assert.strictEqual(payload.principalType, 'customer');
assert.strictEqual(payload.iss, 'contract-test');
assert.strictEqual(payload.aud, 'contract-services');
assert.ok(payload.exp > payload.iat);
assert.ok(payload.jti);
assert.strictEqual(payload.refreshToken, undefined);
assert.strictEqual(payload.apiKey, undefined);
assert.strictEqual(payload.password, undefined);
assert.strictEqual(payload.authVersion, 7);

const serviceToken = provider.generateAuthToken({
    entCode: 'enterprise-a',
    tenant: 'tenant-a',
    tokenType: 'service',
    serviceId: 'module-a'
});
const servicePayload = jwt.verify(serviceToken, strongSecret, authSecurity.getVerifyOptions(secureConfiguration));
assert.strictEqual(servicePayload.tokenType, 'service');
assert.strictEqual(servicePayload.serviceId, 'module-a');
assert.ok(servicePayload.exp > servicePayload.iat);

const passwordInterceptor = require(path.join(repositoryRoot, 'gCore/profile/src/service/interceptors/defaultPasswordSaveInterceptorService'));
let hashCalls = 0;
global.UTILS = {
    encryptPassword: function (password) {
        hashCalls += 1;
        return Promise.resolve('$2a$10$generated-for-' + password);
    }
};

async function validateAsyncContracts() {
    const longPasswordRequest = { model: { password: 'a-plain-text-password-longer-than-the-old-limit' } };
    await passwordInterceptor.encryptPassword(longPasswordRequest, {});
    assert.strictEqual(hashCalls, 1, 'Long plaintext passwords must be hashed');
    assert.ok(longPasswordRequest.model.password.startsWith('$2a$10$'));

    const existingHashRequest = { model: { password: '$2a$10$1234567890123456789012existinghashvalue' } };
    await passwordInterceptor.encryptPassword(existingHashRequest, {});
    assert.strictEqual(hashCalls, 1, 'Existing bcrypt hashes must not be hashed again');

    let persistedState;
    global.SERVICE = {
        DefaultUserStateService: {
            save: function (request) {
                persistedState = request.model;
                return Promise.resolve(true);
            }
        }
    };
    global.CONFIG = configuration({ attemptsToLockAccount: 5 });
    const profileProvider = require(path.join(repositoryRoot, 'gCore/profile/src/service/authentication/defaultAuthenticationProviderService'));
    profileProvider.LOG = { debug: function () {}, error: function () {} };
    await profileProvider.updateFailedAuthData({ tenant: 'tenant-a', state: { attempts: 4, locked: false } });
    assert.strictEqual(persistedState.attempts, 5);
    assert.strictEqual(persistedState.locked, true, 'The threshold attempt must lock the account');

    let refreshSessions = {
        'old-refresh-token': {
            entCode: 'enterprise-a', tenant: 'tenant-a', loginId: 'user-a',
            principalType: 'human', authVersion: 7, userGroups: ['userGroup'], permissions: ['profile.read']
        }
    };
    profileProvider.findToken = function (moduleName, token) {
        return refreshSessions[token] ? Promise.resolve(refreshSessions[token]) : Promise.reject(new Error('missing'));
    };
    profileProvider.consumeToken = function (moduleName, token) {
        if (!refreshSessions[token]) return Promise.reject(new Error('missing'));
        let session = refreshSessions[token];
        delete refreshSessions[token];
        return Promise.resolve(session);
    };
    profileProvider.removeToken = function (moduleName, token) {
        delete refreshSessions[token];
        return Promise.resolve(true);
    };
    profileProvider.addToken = function (moduleName, expirable, token, value) {
        refreshSessions[token] = value;
        return Promise.resolve(true);
    };
    profileProvider.generateAuthToken = function () { return 'rotated-access-token'; };
    profileProvider.recordAuthEvent = function () { return Promise.resolve(true); };
    global.SERVICE.DefaultEnterpriseService = {
        retrieveEnterprise: function () {
            return Promise.resolve({ active: true, tenant: { code: 'tenant-a', active: true } });
        }
    };
    global.SERVICE.DefaultEmployeeService = {
        findByLoginId: function () {
            return Promise.resolve({ active: true, principalType: 'human', authVersion: 7, userGroupCodes: ['userGroup'], userGroupPermissions: ['profile.read'] });
        }
    };
    global.CONFIG = configuration({ profileModuleName: 'profile', authSecurity: { refreshToken: { expiresInSeconds: 3600 } } });
    const rotated = await profileProvider.rotateRefreshToken({ refreshToken: 'old-refresh-token' });
    assert.strictEqual(rotated.authToken, 'rotated-access-token');
    assert.notStrictEqual(rotated.refreshToken, 'old-refresh-token');
    assert.strictEqual(refreshSessions['old-refresh-token'], undefined, 'Refresh tokens must be single-use');
    await assert.rejects(profileProvider.rotateRefreshToken({ refreshToken: 'old-refresh-token' }));

    let atomicSession = { tenant: 'tenant-a' };
    let consumes = 0;
    global.SERVICE.DefaultCacheService = {
        consume: function () {
            consumes += 1;
            if (consumes > 1) return Promise.reject(new Error('already consumed'));
            return Promise.resolve(atomicSession);
        }
    };
    const baseProvider = require(path.join(repositoryRoot, 'gFramework/nService/src/service/authentication/defaultAuthenticationProviderService'));
    assert.strictEqual(await baseProvider.consumeToken('profile', 'single-use-token'), atomicSession);
    await assert.rejects(baseProvider.consumeToken('profile', 'single-use-token'));

    let localValues = new Map([['auth_profile_refresh-token', { tenant: 'tenant-a' }]]);
    let localClient = {
        get: key => localValues.get(key),
        del: key => localValues.delete(key)
    };
    const localCache = require(path.join(repositoryRoot, 'gFramework/nCache/nodeCache/src/service/cache/defaultLocalCacheService'));
    global.SERVICE.DefaultCacheConfigurationService = require(path.join(repositoryRoot, 'gFramework/nCache/cache/src/service/config/defaultCacheConfigurationService'));
    let localOptions = {
        key: 'refresh-token',
        channel: { channelName: 'auth', engineOptions: { options: { prefix: 'profile' } }, client: localClient }
    };
    assert.strictEqual((await localCache.consume(localOptions)).tenant, 'tenant-a');
    await assert.rejects(localCache.consume(localOptions), 'A locally consumed refresh session must not be reusable');

    global.NODICS = { getInternalAuthToken: function () { return 'internal-token'; } };
    const InternalError = class InternalError extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    };
    global.CLASSES = { NodicsError: InternalError };
    const internalProviderPath = path.join(repositoryRoot, 'gCore/profile/src/service/authentication/defaultInternalAuthenticationProviderService');
    delete require.cache[require.resolve(internalProviderPath)];
    const internalProvider = require(internalProviderPath);
    await assert.rejects(
        internalProvider.getInternalAuthToken({ tenant: 'tenant-b', authData: { tenant: 'tenant-a', permissions: [] } }),
        error => error.code === 'ERR_AUTH_00003'
    );
    const allowed = await internalProvider.getInternalAuthToken({
        tenant: 'tenant-b',
        authData: { tenant: 'tenant-a', permissions: ['auth.internal.token.read.anyTenant'] }
    });
    assert.strictEqual(allowed.result.authToken, 'internal-token');
}

function read(relativePath) {
    return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

const coreProperties = read('gFramework/nConfig/config/properties.js');
const authProviderSource = read('gFramework/nAuth/src/service/authentication/defaultAuthenticationProviderService.js');
const securedPipelineSource = read('gFramework/nRouter/src/service/request/defaultSecuredRequestPipelineService.js');
const moduleServiceSource = read('gFramework/nService/src/service/module/defaultModuleService.js');
const profileProviderSource = read('gCore/profile/src/service/authentication/defaultAuthenticationProviderService.js');
const apiKeyInterceptorSource = read('gCore/profile/src/service/interceptors/defaultAPIKeyInterceptorService.js');
const employeeServiceSource = read('gCore/profile/src/service/employee/defaultEmployeeService.js');
const auditService = require('../src/service/audit/defaultAuthAuditService');
assert.ok(!coreProperties.includes("jwtSecretKey: 'nodics'"));
assert.ok(!coreProperties.includes("apiKey: '944515ac"));
assert.ok(!authProviderSource.includes("|| 'nodics'"));
assert.ok(!securedPipelineSource.includes("'Authorizing auth token : ' + request.authToken"));
assert.ok(!securedPipelineSource.includes("'Authorizing api key : ' + request.apiKey"));
assert.ok(!moduleServiceSource.includes("JSON.stringify(requestUrl)"));
assert.ok(!moduleServiceSource.includes('rejectUnauthorized: false'));
assert.ok(moduleServiceSource.includes('requestPromise(requestUrl.uri, fetchOptions)'));
assert.ok(!profileProviderSource.includes('password: options.password'));
assert.ok(profileProviderSource.includes('rotateRefreshToken'));
assert.ok(profileProviderSource.includes('revokeSession'));
assert.ok(apiKeyInterceptorSource.includes('Server-generated API-key rotation is disabled'));
assert.ok(employeeServiceSource.includes('apiKeyExpiresAt'));
assert.ok(employeeServiceSource.includes("status !== 'active'"));
global.CONFIG = configuration({ nodeId: 'node-test' });
const sanitizedAudit = auditService.sanitize({
    eventType: 'password.authentication',
    outcome: 'failure',
    tenant: 'tenant-a',
    password: 'must-not-leak',
    authToken: 'must-not-leak',
    refreshToken: 'must-not-leak',
    apiKey: 'must-not-leak'
});
assert.strictEqual(sanitizedAudit.password, undefined);
assert.strictEqual(sanitizedAudit.authToken, undefined);
assert.strictEqual(sanitizedAudit.refreshToken, undefined);
assert.strictEqual(sanitizedAudit.apiKey, undefined);

validateAsyncContracts().then(() => {
    console.log('nAuth security contracts validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
