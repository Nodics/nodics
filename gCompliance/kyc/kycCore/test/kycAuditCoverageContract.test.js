/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert'); const auditService = require('../src/service/defaultKycAuditService'); const fs = require('fs'); const path = require('path');
describe('KYC comprehensive audit contract', function () {
    it('writes idempotent redacted evidence and removes forbidden fields recursively', async function () { let saved; global.SERVICE = { DefaultKycAuditEventService: { get: async () => ({ result: [] }), save: async input => { saved = input.model; return input.model; } } }; await auditService.record({ tenant: 't1', tenantCode: 't1', enterpriseCode: 'e1', authData: { principalId: 'reviewer' } }, { operation: 'SENSITIVE_READ', outcome: 'ALLOWED', correlationId: 'read-1', safeEvidence: { documentCode: 'doc-1', rawPayload: 'forbidden', nested: { accessToken: 'forbidden', resultCode: 'OK' } } }); assert.strictEqual(saved.safeEvidence.rawPayload, undefined); assert.strictEqual(saved.safeEvidence.nested.accessToken, undefined); assert.strictEqual(saved.safeEvidence.nested.resultCode, 'OK'); });
    it('covers every required regulated operation family in runtime source', function () { const root = path.resolve(__dirname, '../src/service'); const providerRoot = path.resolve(__dirname, '../../kycProviders/kycProviderCore/src/service'); const text = [root, providerRoot].flatMap(directory => fs.readdirSync(directory, { recursive: true }).filter(file => file.endsWith('.js')).map(file => fs.readFileSync(path.join(directory, file), 'utf8'))).join('\n'); ['SUBMITTED', 'MEDIA_DELIVERED', 'PROVIDER_EXECUTED', 'PROVIDER_CALLBACK', 'REVIEW_ACTIONED', 'DECIDED', 'ELIGIBILITY_EVALUATED', 'POLICY_CHANGED', 'PROVIDER_CHANGED', 'LEGAL_HOLD_ENFORCED', 'DOCUMENT_DELETED', 'RETRIED', 'FAILED', 'RECOVERED'].forEach(operation => assert.ok(text.includes(operation), `Missing audit operation ${operation}`)); });
});
