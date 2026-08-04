/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycSchema/src/schemas/schemas
 * @description Private, scoped KYC lifecycle and immutable compliance-evidence schemas.
 * @layer schemas
 * @owner kyc
 * @override Later project/customer modules may extend fields and indexes while preserving scope, reference-only evidence, and private mutation.
 */
const model = (definition, indexes, immutable) => ({
    super: 'base',
    model: true,
    service: { enabled: true },
    router: { enabled: false },
    cache: { enabled: false },
    search: { enabled: false },
    event: { enabled: false },
    transaction: { enabled: true, sideEffects: 'none' },
    immutable: immutable === true,
    definition,
    indexes: indexes || {}
});

const scoped = () => ({
    tenantCode: { type: 'string', required: true, searchOptions: { enabled: true } },
    enterpriseCode: { type: 'string', required: true, searchOptions: { enabled: true } }
});
const identity = (name, description) => ({
    [name]: { type: 'string', required: true, searchOptions: { enabled: true }, description }
});
const lifecycle = () => ({
    status: { type: 'string', required: true, searchOptions: { enabled: true } },
    version: { type: 'int', required: true, default: 1 }
});
const common = {
    tenantCode: { enabled: true, name: 'tenantCode' },
    enterpriseCode: { enabled: true, name: 'enterpriseCode' },
    status: { enabled: true, name: 'status' }
};
const unique = name => ({ individual: { [name]: { enabled: true, name, options: { unique: true } } } });
const indexes = (extra, identityName) => ({
    common: Object.assign({}, common, extra || {}),
    individual: identityName ? unique(identityName).individual : {}
});

module.exports = { kycSchema: {
    // Compatibility record for existing email/mobile verification journeys.
    kyc: model(Object.assign({}, scoped(), identity('code', 'Stable legacy verification reference'), lifecycle(), {
        refId: { type: 'string', required: true, searchOptions: { enabled: true } },
        description: { type: 'string', required: false },
        opsType: { type: 'string', required: true },
        type: { type: 'string', required: true }
    }), indexes({ refId: { enabled: true, name: 'refId' } }, 'code')),

    kycProfile: model(Object.assign({}, scoped(), identity('profileCode', 'Stable KYC profile identity'), lifecycle(), {
        profileIdentityHash: { type: 'string', required: true, description: 'Unique hash of tenant, enterprise, subject type, and subject code' },
        subjectType: { type: 'string', required: true, searchOptions: { enabled: true } },
        subjectCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        kycStatus: { type: 'string', required: true, default: 'NOT_STARTED', searchOptions: { enabled: true } },
        riskLevel: { type: 'string', required: true, default: 'UNKNOWN' },
        latestCaseCode: { type: 'string', required: false },
        latestDecisionCode: { type: 'string', required: false },
        verifiedAt: { type: 'date', required: false },
        expiresAt: { type: 'date', required: false },
        requiresReview: { type: 'bool', required: true, default: false },
        policyCode: { type: 'string', required: true }
    }), { common: Object.assign({}, common, { subjectType: { enabled: true, name: 'subjectType' }, subjectCode: { enabled: true, name: 'subjectCode' } }), individual: { profileCode: { enabled: true, name: 'profileCode', options: { unique: true } }, profileIdentityHash: { enabled: true, name: 'profileIdentityHash', options: { unique: true } } } }),

    kycVerificationCase: model(Object.assign({}, scoped(), identity('caseCode', 'One governed KYC verification attempt'), lifecycle(), {
        idempotencyKey: { type: 'string', required: true, searchOptions: { enabled: true } },
        submissionIdentityHash: { type: 'string', required: true, description: 'Unique hash of tenant, enterprise, and submission idempotency key' },
        profileCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        subjectType: { type: 'string', required: true, searchOptions: { enabled: true } },
        subjectCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        caseType: { type: 'string', required: true },
        verificationLevel: { type: 'string', required: true },
        policyCode: { type: 'string', required: true },
        providerCode: { type: 'string', required: false },
        providerCaseRef: { type: 'string', required: false, description: 'Safe provider reference only' },
        requiredDocumentCodes: { type: 'array', required: true },
        submittedDocumentCodes: { type: 'array', required: true },
        checkCodes: { type: 'array', required: true },
        latestDecisionCode: { type: 'string', required: false },
        workflowCode: { type: 'string', required: false },
        currentReviewer: { type: 'string', required: false },
        createdReason: { type: 'string', required: true },
        correlationId: { type: 'string', required: true },
        submittedAt: { type: 'date', required: false },
        expiresAt: { type: 'date', required: false }
    }), { common: Object.assign({}, common, { profileCode: { enabled: true, name: 'profileCode' }, subjectCode: { enabled: true, name: 'subjectCode' }, idempotencyKey: { enabled: true, name: 'idempotencyKey' } }), individual: { caseCode: { enabled: true, name: 'caseCode', options: { unique: true } }, submissionIdentityHash: { enabled: true, name: 'submissionIdentityHash', options: { unique: true } } } }),

    kycDocumentRequirement: model(Object.assign({}, scoped(), identity('requirementCode', 'Policy-owned document requirement'), lifecycle(), {
        policyCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        subjectTypes: { type: 'array', required: true },
        documentType: { type: 'string', required: true },
        mandatory: { type: 'bool', required: true },
        acceptedMimeTypes: { type: 'array', required: true },
        maxSizeBytes: { type: 'int', required: true },
        issuingCountries: { type: 'array', required: false },
        minValidityDays: { type: 'int', required: false },
        mediaPurpose: { type: 'string', required: true, default: 'kycDocuments' }
    }), indexes({ policyCode: { enabled: true, name: 'policyCode' } }, 'requirementCode')),

    kycDocument: model(Object.assign({}, scoped(), identity('documentCode', 'Safe KYC document evidence identity'), lifecycle(), {
        caseCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        documentType: { type: 'string', required: true },
        mediaCode: { type: 'string', required: true, description: 'Private nMedia reference; paths and binary content are prohibited' },
        maskedDocumentNumber: { type: 'string', required: false },
        issuingCountry: { type: 'string', required: false },
        expiryDate: { type: 'date', required: false },
        providerDocumentRef: { type: 'string', required: false },
        verificationResultCode: { type: 'string', required: false },
        retentionUntil: { type: 'date', required: true },
        legalHold: { type: 'bool', required: true, default: false }
    }), indexes({ caseCode: { enabled: true, name: 'caseCode' } }, 'documentCode')),

    kycConsent: model(Object.assign({}, scoped(), identity('consentCode', 'Versioned subject consent evidence'), lifecycle(), {
        subjectType: { type: 'string', required: true },
        subjectCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        consentType: { type: 'string', required: true },
        consentVersion: { type: 'string', required: true },
        jurisdiction: { type: 'string', required: true },
        acceptedAt: { type: 'date', required: true },
        revokedAt: { type: 'date', required: false },
        source: { type: 'string', required: true },
        ipHash: { type: 'string', required: false },
        userAgentHash: { type: 'string', required: false }
    }), indexes({ subjectCode: { enabled: true, name: 'subjectCode' } }, 'consentCode'), true),

    kycCheck: model(Object.assign({}, scoped(), identity('checkCode', 'One normalized provider or manual check'), lifecycle(), {
        caseCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        checkType: { type: 'string', required: true, searchOptions: { enabled: true } },
        mandatory: { type: 'bool', required: true },
        providerCode: { type: 'string', required: false },
        providerCheckRef: { type: 'string', required: false },
        resultCode: { type: 'string', required: true },
        reasonCode: { type: 'string', required: false },
        safeEvidence: { type: 'object', required: false, description: 'Bounded normalized evidence; raw provider payloads and PII are prohibited' },
        completedAt: { type: 'date', required: false }
    }), indexes({ caseCode: { enabled: true, name: 'caseCode' }, checkType: { enabled: true, name: 'checkType' } }, 'checkCode'), true),

    kycDecision: model(Object.assign({}, scoped(), identity('decisionCode', 'Append-only KYC decision evidence'), lifecycle(), {
        caseCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        decision: { type: 'string', required: true, searchOptions: { enabled: true } },
        reasonCode: { type: 'string', required: true },
        safeReason: { type: 'string', required: true },
        actorType: { type: 'string', required: true },
        actorReference: { type: 'string', required: true },
        previousDecisionCode: { type: 'string', required: false },
        makerReference: { type: 'string', required: false },
        checkerReference: { type: 'string', required: false },
        policyCode: { type: 'string', required: true },
        decidedAt: { type: 'date', required: true },
        expiresAt: { type: 'date', required: false }
    }), indexes({ caseCode: { enabled: true, name: 'caseCode' }, decision: { enabled: true, name: 'decision' } }, 'decisionCode'), true),

    kycReviewTask: model(Object.assign({}, scoped(), identity('reviewTaskCode', 'Manual compliance review work item'), lifecycle(), {
        caseCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        assignedTo: { type: 'string', required: false, searchOptions: { enabled: true } },
        queueCode: { type: 'string', required: true },
        priority: { type: 'string', required: true },
        dueAt: { type: 'date', required: true },
        makerCheckerRequired: { type: 'bool', required: true },
        requestedAction: { type: 'string', required: false },
        escalationLevel: { type: 'int', required: true, default: 0 },
        makerReference: { type: 'string', required: false },
        checkerReference: { type: 'string', required: false },
        claimedAt: { type: 'date', required: false },
        completedAt: { type: 'date', required: false },
        slaStatus: { type: 'string', required: true, default: 'ON_TIME' },
        safeNotes: { type: 'array', required: false, description: 'Bounded redacted operational note evidence only' }
    }), indexes({ caseCode: { enabled: true, name: 'caseCode' }, assignedTo: { enabled: true, name: 'assignedTo' } }, 'reviewTaskCode')),

    kycAuditEvent: model(Object.assign({}, scoped(), identity('auditEventCode', 'Append-only redacted compliance audit evidence'), lifecycle(), {
        caseCode: { type: 'string', required: false, searchOptions: { enabled: true } },
        subjectType: { type: 'string', required: true },
        subjectCodeHash: { type: 'string', required: true },
        operation: { type: 'string', required: true, searchOptions: { enabled: true } },
        actorReference: { type: 'string', required: true },
        permissionCode: { type: 'string', required: true },
        correlationId: { type: 'string', required: true },
        outcome: { type: 'string', required: true },
        safeEvidence: { type: 'object', required: false },
        occurredAt: { type: 'date', required: true }
    }), indexes({ caseCode: { enabled: true, name: 'caseCode' }, operation: { enabled: true, name: 'operation' } }, 'auditEventCode'), true),

    kycProvider: model(Object.assign({}, scoped(), identity('providerCode', 'Provider-neutral KYC adapter registration'), lifecycle(), {
        label: { type: 'string', required: true },
        adapterService: { type: 'string', required: true },
        supportedCheckTypes: { type: 'array', required: true },
        supportedSubjectTypes: { type: 'array', required: true },
        sandboxSupported: { type: 'bool', required: true },
        productionReady: { type: 'bool', required: true },
        webhookSupported: { type: 'bool', required: true },
        webhookVerifierService: { type: 'string', required: false },
        healthStatus: { type: 'string', required: true },
        secretReference: { type: 'string', required: false, description: 'Governed secret reference only' }
    }), indexes({}, 'providerCode')),

    kycProviderExecutionPolicy: model(Object.assign({}, scoped(), identity('providerPolicyCode', 'Scoped provider execution governance'), lifecycle(), {
        providerCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        liveCallsEnabled: { type: 'bool', required: true, default: false },
        timeoutMs: { type: 'int', required: true },
        maxAttempts: { type: 'int', required: true },
        backoffMs: { type: 'int', required: true },
        failoverProviderCodes: { type: 'array', required: false },
        retryableErrorCodes: { type: 'array', required: false },
        nonRetryableErrorCodes: { type: 'array', required: false },
        circuitFailureThreshold: { type: 'int', required: true, default: 5 },
        circuitResetMs: { type: 'int', required: true, default: 60000 },
        circuitOpenUntil: { type: 'date', required: false },
        webhookToleranceSeconds: { type: 'int', required: true },
        replayWindowSeconds: { type: 'int', required: true }
    }), indexes({ providerCode: { enabled: true, name: 'providerCode' } }, 'providerPolicyCode')),

    kycProviderExecutionAttempt: model(Object.assign({}, scoped(), identity('executionAttemptCode', 'Bounded provider execution attempt evidence'), lifecycle(), {
        executionIdentityHash: { type: 'string', required: true, searchOptions: { enabled: true } },
        caseCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        providerCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        providerAccountCode: { type: 'string', required: true },
        operation: { type: 'string', required: true },
        attemptNumber: { type: 'int', required: true },
        executionMode: { type: 'string', required: true },
        resultCode: { type: 'string', required: false },
        safeEvidence: { type: 'object', required: false },
        retryable: { type: 'bool', required: true, default: false },
        reconciliationPerformed: { type: 'bool', required: true, default: false },
        startedAt: { type: 'date', required: true },
        completedAt: { type: 'date', required: false },
        latencyMs: { type: 'int', required: false }
    }), indexes({ executionIdentityHash: { enabled: true, name: 'executionIdentityHash' }, caseCode: { enabled: true, name: 'caseCode' }, providerCode: { enabled: true, name: 'providerCode' } }, 'executionAttemptCode')),

    kycProviderAccount: model(Object.assign({}, scoped(), identity('providerAccountCode', 'Scoped provider account and secret-reference binding'), lifecycle(), {
        providerCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        environment: { type: 'string', required: true },
        secretReference: { type: 'string', required: true, description: 'Governed secret reference only; raw credentials are prohibited' },
        webhookEnabled: { type: 'bool', required: true, default: false },
        liveCallsEnabled: { type: 'bool', required: true, default: false },
        approvedByPrincipalId: { type: 'string', required: false },
        updatedByPrincipalId: { type: 'string', required: false }
    }), indexes({ providerCode: { enabled: true, name: 'providerCode' } }, 'providerAccountCode')),

    kycProviderWebhookEvent: model(Object.assign({}, scoped(), identity('webhookEventCode', 'Durable provider callback replay identity'), lifecycle(), {
        eventIdentityHash: { type: 'string', required: true, description: 'Unique hash of provider, tenant, account, and provider event id' },
        providerCode: { type: 'string', required: true, searchOptions: { enabled: true } },
        providerAccountCode: { type: 'string', required: true },
        providerEventId: { type: 'string', required: true },
        bodyHash: { type: 'string', required: true },
        signatureVersion: { type: 'string', required: true },
        receivedAt: { type: 'date', required: true },
        processedAt: { type: 'date', required: false },
        attemptCount: { type: 'int', required: true, default: 1 },
        safeErrorCode: { type: 'string', required: false }
    }), { common: Object.assign({}, common, { providerCode: { enabled: true, name: 'providerCode' }, providerEventId: { enabled: true, name: 'providerEventId' } }), individual: { webhookEventCode: { enabled: true, name: 'webhookEventCode', options: { unique: true } }, eventIdentityHash: { enabled: true, name: 'eventIdentityHash', options: { unique: true } } } })
} };
