/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/test/profileRuntimeBoundInternalToken
 * @description Validates runtime-bound service-token issuance from HTTP headers and rejects malformed or duplicate module declarations.
 * @layer test
 * @owner profile
 */
const assert = require('assert');

global.CONFIG = { get: key => key === 'authSecurity' ? { internalToken: {
    maxDeclaredModules: 3,
    moduleNamePattern: '^[A-Za-z][A-Za-z0-9_-]{0,127}$'
} } : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
} };
global.NODICS = { getInternalAuthToken: () => 'legacy-token' };
let issued;
global.SERVICE = { DefaultServiceTokenService: { issue: options => { issued = options; return Promise.resolve('bound-token'); } } };

const service = require('../src/service/authentication/defaultInternalAuthenticationProviderService');
const authData = {
    tenant: 'default', entCode: 'default', serviceId: 'apiAdmin', tokenType: 'service',
    userGroups: ['serviceAccountUserGroup'], permissions: ['auth.internal.token.read']
};

async function run() {
    let response = await service.getInternalAuthToken({
        tenant: 'default', authData: authData,
        httpRequest: { headers: {
            'x-nodics-runtime-instance': 'env:cmsServer:default:42',
            'x-nodics-modules': 'cms,workflowCore'
        } }
    });
    assert.strictEqual(response.result.authToken, 'bound-token');
    assert.strictEqual(issued.runtimeInstanceId, 'env:cmsServer:default:42');
    assert.deepStrictEqual(issued.modules, ['cms', 'workflowCore']);
    assert.strictEqual(issued.tenant, 'default');

    await assert.rejects(service.getInternalAuthToken({
        tenant: 'default', authData: authData,
        httpRequest: { headers: { 'x-nodics-runtime-instance': 'runtime', 'x-nodics-modules': 'cms,cms' } }
    }), /Invalid module identity declaration/);
    await assert.rejects(service.getInternalAuthToken({
        tenant: 'default', authData: authData,
        httpRequest: { headers: { 'x-nodics-runtime-instance': 'runtime', 'x-nodics-modules': 'cms,bad module' } }
    }), /Invalid module identity declaration/);
    await assert.rejects(service.getInternalAuthToken({
        tenant: 'default', authData: authData,
        httpRequest: { headers: { 'x-nodics-runtime-instance': 'runtime', 'x-nodics-modules': 'one,two,three,four' } }
    }), /Invalid module identity declaration/);
    console.log('Profile runtime-bound internal token contract validated');
}

run().catch(error => { console.error(error); process.exit(1); });
