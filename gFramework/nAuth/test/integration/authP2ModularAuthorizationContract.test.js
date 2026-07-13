/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthP2ModularAuthorizationContract
 * @description Proves bounded internal service tokens survive a process
 * boundary while tenant, permission, bootstrap-header, and rotation contracts
 * remain enforced.
 * @layer test
 * @owner nAuth
 * @override Project modules may extend the process matrix with their own remote
 * services and permissions.
 */
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');
const configuration = require('./authP2TestConfiguration').load();

class NodicsError extends Error {
    constructor(code, message) { super(message || code && code.message || String(code)); this.code = typeof code === 'string' ? code : code && code.code; }
}
global.CLASSES = { NodicsError };
const secret = 'auth-p2-modular-jwt-secret-with-more-than-thirty-two-characters';
const values = {
    profileModuleName: 'profile',
    defaultTenant: configuration.tenant,
    defaultAuthDetail: { apiKey: 'auth-p2-bootstrap-key-12345678901234567890', entCode: 'enterprise-a' },
    authSecurity: {
        jwt: { secret: secret, issuer: 'nodics-p2', audience: 'nodics-p2-services', algorithms: ['HS256'], serviceTokenExpiresIn: '2m' },
        securityStamp: { enabled: true, failClosed: true, allowMissingStamp: false }
    }
};
global.CONFIG = { get: key => values[key] };

function runWorker(input) {
    return new Promise((resolve, reject) => {
        let worker = path.join(__dirname, 'authP2TokenWorker.js');
        let child = spawn(process.execPath, [worker, Buffer.from(JSON.stringify(input)).toString('base64url')]);
        let stdout = '', stderr = '';
        child.stdout.on('data', data => stdout += data.toString());
        child.stderr.on('data', data => stderr += data.toString());
        child.on('exit', code => code === 0 ? resolve(JSON.parse(stdout)) : reject(new Error(stderr || 'worker failed')));
    });
}

async function run() {
    const jwtProvider = require('../../src/service/authentication/defaultAuthenticationProviderService');
    const stampService = require('../../src/service/identity/defaultPrincipalSecurityStampService');
    const serviceTokenService = require('../../src/service/identity/defaultServiceTokenService');
    const remoteProvider = require('../../../nService/src/service/authentication/defaultInternalAuthenticationProviderService');
    let stamps = new Map();
    let capturedRequest;
    global.SERVICE = {
        DefaultAuthenticationProviderService: {
            generateAuthToken: options => jwtProvider.generateAuthToken(options),
            addToken: (moduleName, expirable, key, value) => { stamps.set(key, value); return Promise.resolve(value); }
        },
        DefaultPrincipalSecurityStampService: stampService,
        DefaultModuleService: {
            buildRequest: request => { capturedRequest = request; return { uri: 'http://profile.test/internal-token', source: request }; },
            fetch: request => Promise.resolve({ result: { authToken: issuedToken } })
        }
    };
    remoteProvider.LOG = { error: function () {} };
    let issuedToken = await serviceTokenService.issue({
        entCode: 'enterprise-a', tenant: configuration.tenant, serviceId: 'profile-service', authVersion: 5,
        userGroups: ['serviceAccountUserGroup'], permissions: ['profile.read']
    });
    let accepted = await runWorker({ token: issuedToken, secret: secret, issuer: 'nodics-p2', audience: 'nodics-p2-services', requestTenant: configuration.tenant, permission: 'profile.read', authVersion: 5 });
    assert.strictEqual(accepted.accepted, true);
    assert.strictEqual(accepted.serviceId, 'profile-service');
    await assert.rejects(runWorker({ token: issuedToken, secret: secret, issuer: 'nodics-p2', audience: 'nodics-p2-services', requestTenant: 'nodics_auth_other_test', permission: 'profile.read', authVersion: 5 }), /TOKEN_TENANT_MISMATCH/);
    await assert.rejects(runWorker({ token: issuedToken, secret: secret, issuer: 'nodics-p2', audience: 'nodics-p2-services', requestTenant: configuration.tenant, permission: 'runtime.config.activate', authVersion: 5 }), /TOKEN_PERMISSION_MISSING/);

    let fetched = await remoteProvider.fetchInternalAuthToken(configuration.tenant);
    assert.strictEqual(fetched.authToken, issuedToken);
    assert.strictEqual(capturedRequest.apiName, '/auth/token/' + configuration.tenant);
    assert.strictEqual(capturedRequest.header['x-api-key'], values.defaultAuthDetail.apiKey);
    assert.strictEqual(capturedRequest.header['x-enterprise-code'], values.defaultAuthDetail.entCode);
    assert.strictEqual(JSON.stringify(capturedRequest).includes('password'), false);

    let tokens = { [configuration.tenant]: 'old-token' };
    global.NODICS = {
        getInternalAuthTokens: () => tokens,
        addInternalAuthToken: (tenant, token) => { tokens[tenant] = token; }
    };
    remoteProvider.fetchInternalAuthToken = tenant => Promise.resolve({ authToken: 'rotated-' + tenant });
    await remoteProvider.refreshInternalAuthTokens();
    assert.strictEqual(tokens[configuration.tenant], 'rotated-' + configuration.tenant);
    console.log('nAuth P2 modular authorization contract validated');
}

run().catch(error => { console.error(error); process.exit(1); });
