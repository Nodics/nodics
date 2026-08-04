/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const calls = [];
global.CONFIG = { get: key => ({
    'kyc.rateLimit': { moduleName: 'cache', channelName: 'rateLimit', requireDistributedInProduction: true, operations: { submit: { limit: 5, windowSeconds: 3600, identityFields: ['tenantCode', 'subjectCode'] }, documentAccess: { limit: 30, windowSeconds: 60, identityFields: ['tenantCode', 'documentCode', 'actorReference'] } } },
    environment: 'production'
}[key]) };
global.SERVICE = { DefaultRateLimitService: { enforce: options => { calls.push(options); return Promise.resolve({ allowed: true }); } } };
const service = require('../src/service/defaultKycRateLimitService');

(async () => {
    await service.enforce('submit', { tenantCode: 'tenant-a', subjectCode: 'subject-a' });
    assert.deepStrictEqual(calls[0], { tenant: 'tenant-a', capability: 'kyc', operation: 'submit', identity: 'tenant-a|subject-a', limit: 5, windowSeconds: 3600, moduleName: 'cache', channelName: 'rateLimit', requireDistributed: true });
    await service.enforce('documentAccess', { tenantCode: 'tenant-a', documentCode: 'document-a', authData: { principalId: 'reviewer-a' } });
    assert.strictEqual(calls[1].identity, 'tenant-a|document-a|reviewer-a');
    assert.strictEqual((await service.enforce('provider', { tenantCode: 'tenant-a' })).disabled, true, 'Unconfigured operations are explicitly disabled');
    console.log('KYC rate limit contract tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
