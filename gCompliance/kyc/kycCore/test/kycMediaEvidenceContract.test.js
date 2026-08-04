/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const service = require('../src/service/defaultKycMediaEvidenceService');
describe('KYC nMedia evidence contract', function () {
    const originalConfig = global.CONFIG; const originalService = global.SERVICE; afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });
    it('delegates private purpose, MIME, size, and owner validation to nMedia', async function () {
        let validation;
        global.CONFIG = { get: key => key === 'kyc.documents' ? { mediaPurpose: 'kycDocuments', requirePrivateVisibility: true, allowedMimeTypes: ['image/jpeg'], maximumSizeBytes: 1000 } : {} };
        global.SERVICE = { DefaultMediaReferenceLookupService: { validatePurposeBound: async input => { validation = input; return { code: input.mediaCode, access: 'PRIVATE' }; } } };
        await service.validate({ tenant: 't1', authData: {}, subjectCode: 'customer-1' }, { mediaCode: 'media-1' });
        assert.strictEqual(validation.requiredAccess, 'PRIVATE'); assert.strictEqual(validation.businessPurpose, 'kycDocuments'); assert.deepStrictEqual(validation.allowedMimeTypes, ['image/jpeg']); assert.strictEqual(validation.ownerReference, 'customer-1');
    });
    it('audits and delegates delivery without returning storage authority', async function () {
        let audit; let delivered;
        global.CONFIG = { get: key => key === 'kyc.documents' ? { mediaPurpose: 'kycDocuments', requirePrivateVisibility: true } : {} };
        global.SERVICE = {
            DefaultKycDocumentService: { get: async () => ({ result: [{ documentCode: 'doc-1', caseCode: 'case-1', mediaCode: 'media-1', tenantCode: 't1', enterpriseCode: 'e1' }] }) },
            DefaultKycRateLimitService: { enforce: async () => ({ allowed: true }) },
            DefaultMediaReferenceLookupService: { validatePurposeBound: async () => ({ code: 'media-1', access: 'PRIVATE' }) },
            DefaultKycAuditService: { record: async (request, input) => { audit = input; } },
            DefaultMediaDeliveryService: { deliver: async input => { delivered = input; return { stream: true }; } }
        };
        const result = await service.deliver({ tenant: 't1', tenantCode: 't1', enterpriseCode: 'e1', caseCode: 'case-1', documentCode: 'doc-1', authData: { principalId: 'reviewer-1', permissions: ['kyc.document.deliver'] } });
        assert.strictEqual(result.stream, true); assert.strictEqual(delivered.mediaCode, 'media-1'); assert.strictEqual(audit.operation, 'MEDIA_DELIVERED'); assert.strictEqual(audit.safeEvidence.mediaCode, 'media-1');
    });
});
