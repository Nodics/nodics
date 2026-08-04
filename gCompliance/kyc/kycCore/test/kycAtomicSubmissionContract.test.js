/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const schemas = require('../../kycSchema/src/schemas/schemas').kycSchema;
const pipelineService = require('../src/service/defaultKycCasePipelineService');

describe('KYC atomic submission contract', function () {
    const originalConfig = global.CONFIG;
    const originalService = global.SERVICE;

    afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });

    it('enables transaction-safe persistence and scoped uniqueness', function () {
        ['kycProfile', 'kycVerificationCase', 'kycConsent', 'kycDocument', 'kycAuditEvent'].forEach(name => {
            assert.deepStrictEqual(schemas[name].transaction, { enabled: true, sideEffects: 'none' });
            assert.strictEqual(schemas[name].cache.enabled, false);
            assert.strictEqual(schemas[name].event.enabled, false);
        });
        assert.strictEqual(schemas.kycProfile.indexes.individual.profileIdentityHash.options.unique, true);
        assert.strictEqual(schemas.kycVerificationCase.indexes.individual.submissionIdentityHash.options.unique, true);
    });

    it('commits profile, consent, case, documents, and audit through one transaction context', async function () {
        const saved = []; const transactionContext = Object.freeze({ transactionId: 'tx-1' });
        global.CONFIG = { get: key => key === 'kyc.persistence' ? { requireAtomicSubmission: true, transactionModuleName: 'kycSchema' } : {} };
        const repository = name => ({
            get: async () => ({ result: [] }),
            save: async input => { assert.strictEqual(input.transactionContext, transactionContext); saved.push(name); return { result: input.model }; }
        });
        global.SERVICE = Object.assign({
            DefaultDatabaseTransactionService: { execute: async (scope, work) => { assert.deepStrictEqual(scope, { moduleName: 'kycSchema', tenant: 'tenant-a', test: false }); return work(transactionContext); } }
        }, {
            DefaultKycVerificationCaseService: repository('case'), DefaultKycProfileService: repository('profile'),
            DefaultKycConsentService: repository('consent'), DefaultKycDocumentService: repository('document'),
            DefaultKycAuditEventService: repository('audit')
        });
        const request = { tenant: 'tenant-a', authData: {}, submissionIdentityHash: 'submission-hash', profileIdentityHash: 'profile-hash', caseModel: { caseCode: 'case-1' }, profileModel: { profileCode: 'profile-1' }, consentModel: { consentCode: 'consent-1' }, documentModels: [{ documentCode: 'document-1' }], auditModel: { auditEventCode: 'audit-1' } };
        await new Promise((resolve, reject) => pipelineService.persistCaseEvidence(request, {}, { nextSuccess: resolve, error: (req, res, error) => reject(error) }));
        assert.deepStrictEqual(saved, ['profile', 'consent', 'case', 'document', 'audit']);
        assert.strictEqual(request.idempotent, false);
    });

    it('returns the existing scoped case without duplicate writes', async function () {
        const existing = { caseCode: 'case-existing', status: 'SUBMITTED' }; let writes = 0;
        global.CONFIG = { get: key => key === 'kyc.persistence' ? { requireAtomicSubmission: true, transactionModuleName: 'kycSchema' } : {} };
        global.SERVICE = {
            DefaultDatabaseTransactionService: { execute: async (scope, work) => work({ transactionId: 'tx-2' }) },
            DefaultKycVerificationCaseService: { get: async () => ({ result: [existing] }), save: async () => { writes += 1; } },
            DefaultKycProfileService: { get: async () => ({ result: [] }), save: async () => { writes += 1; } },
            DefaultKycConsentService: { save: async () => { writes += 1; } },
            DefaultKycDocumentService: { save: async () => { writes += 1; } },
            DefaultKycAuditEventService: { save: async () => { writes += 1; } }
        };
        const request = { tenant: 'tenant-a', authData: {}, submissionIdentityHash: 'same', profileIdentityHash: 'profile', caseModel: {}, profileModel: {}, documentModels: [], auditModel: {} };
        await new Promise((resolve, reject) => pipelineService.persistCaseEvidence(request, {}, { nextSuccess: resolve, error: (req, res, error) => reject(error) }));
        assert.strictEqual(request.caseModel, existing);
        assert.strictEqual(request.idempotent, true);
        assert.strictEqual(writes, 0);
    });
});
