/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Licensed under the root license. */
const crypto = require('crypto');
const code = prefix => `${prefix}-${crypto.randomUUID()}`;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const fail = (process, request, response, error) => process.error(request, response, error);
const ok = (process, request, response) => process.nextSuccess(request, response);
const records = value => value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : [];
const affected = value => Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || value && value.result && value.result.modifiedCount || 0);

/**
 * @module gCompliance/kyc/kycCore/src/service/defaultKycCasePipelineService
 * @description Defines the default kyc case pipeline service contract owned by kycCore within the Nodics layered runtime.
 * @layer service
 * @owner kycCore
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Validates submit request within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateSubmitRequest: function (request, response, process) {
        try {
            ['tenantCode', 'enterpriseCode', 'subjectType', 'subjectCode', 'entryPoint', 'idempotencyKey', 'correlationId'].forEach(field => { if (!request[field]) { const error = new Error(`Missing required KYC field: ${field}`); error.code = 'KYC_INVALID_REQUEST'; throw error; } });
            const authenticatedTenant = request.tenant && (request.tenant.code || request.tenant);
            if (authenticatedTenant && authenticatedTenant !== request.tenantCode) { const error = new Error('KYC tenant scope does not match the authenticated request.'); error.code = 'KYC_OPERATION_FORBIDDEN'; throw error; }
            const authenticatedEnterprise = request.authData && (request.authData.enterpriseCode || request.authData.entCode);
            if (authenticatedEnterprise && authenticatedEnterprise !== request.enterpriseCode) { const error = new Error('KYC enterprise scope does not match the authenticated request.'); error.code = 'KYC_OPERATION_FORBIDDEN'; throw error; }
            ok(process, request, response);
        } catch (error) { fail(process, request, response, error); }
    },
    /**
     * Resolves policy within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolvePolicy: function (request, response, process) {
        try { request.resolvedKycPolicy = SERVICE.DefaultKycPolicyService.resolvePolicy(request); ok(process, request, response); } catch (error) { fail(process, request, response, error); }
    },
    /**
     * Validates consent within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateConsent: function (request, response, process) {
        const consent = request.consent;
        if (request.resolvedKycPolicy.consent.required && (!consent || consent.consentVersion !== request.resolvedKycPolicy.consent.activeVersion || !consent.acceptedAt)) {
            const error = new Error('Active KYC consent evidence is required.'); error.code = 'KYC_CONSENT_REQUIRED'; return fail(process, request, response, error);
        }
        ok(process, request, response);
    },
    /**
     * Validates documents within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateDocuments: function (request, response, process) {
        try {
            const documents = request.documents || [];
            documents.forEach(document => SERVICE.DefaultKycLifecycleService.assertPrivateMediaReference(document));
            const submitted = new Set(documents.map(document => document.documentType));
            request.missingDocumentTypes = request.resolvedKycPolicy.requiredDocumentTypes.filter(type => !submitted.has(type));
            Promise.all(documents.map(document => SERVICE.DefaultKycMediaEvidenceService.validate(request, document))).then(projections => { request.mediaEvidence = projections; ok(process, request, response); }).catch(error => fail(process, request, response, error));
        } catch (error) { fail(process, request, response, error); }
    },
    /**
     * Builds case evidence within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    buildCaseEvidence: function (request, response, process) {
        const now = new Date(); const expiry = new Date(now.getTime() + request.resolvedKycPolicy.retention.documentDays * 86400000);
        const profileCode = request.profileCode || code('kyc-profile');
        request.profileIdentityHash = hash([request.tenantCode, request.enterpriseCode, request.subjectType, request.subjectCode].join('|'));
        request.submissionIdentityHash = hash([request.tenantCode, request.enterpriseCode, request.idempotencyKey].join('|'));
        request.caseModel = { caseCode: code('kyc-case'), tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, idempotencyKey: request.idempotencyKey, submissionIdentityHash: request.submissionIdentityHash, profileCode, subjectType: request.subjectType, subjectCode: request.subjectCode, caseType: request.resolvedKycPolicy.caseType, verificationLevel: request.resolvedKycPolicy.verificationLevel, policyCode: request.resolvedKycPolicy.policyCode, status: request.missingDocumentTypes.length ? 'DOCUMENTS_REQUIRED' : 'SUBMITTED', requiredDocumentCodes: request.resolvedKycPolicy.requiredDocumentTypes, submittedDocumentCodes: (request.documents || []).map(document => document.mediaCode), checkCodes: [], workflowCode: null, createdReason: request.entryPoint, correlationId: request.correlationId, submittedAt: now, version: 1 };
        request.caseModel.workflowCode = request.caseModel.caseCode;
        request.profileModel = { profileCode, profileIdentityHash: request.profileIdentityHash, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, subjectType: request.subjectType, subjectCode: request.subjectCode, kycStatus: request.caseModel.status, riskLevel: 'UNKNOWN', latestCaseCode: request.caseModel.caseCode, requiresReview: false, policyCode: request.resolvedKycPolicy.policyCode, status: 'ACTIVE', version: 1 };
        request.consentModel = request.consent && Object.assign({ consentCode: code('kyc-consent'), tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, subjectType: request.subjectType, subjectCode: request.subjectCode, consentType: request.resolvedKycPolicy.consent.type, jurisdiction: request.consent.jurisdiction || 'UNSPECIFIED', source: request.consent.source || request.entryPoint, status: 'ACTIVE', version: 1 }, request.consent);
        request.documentModels = (request.documents || []).map(document => ({ documentCode: code('kyc-document'), tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, caseCode: request.caseModel.caseCode, documentType: document.documentType, mediaCode: document.mediaCode, status: 'UPLOADED', maskedDocumentNumber: document.documentNumber ? SERVICE.DefaultKycPolicyService.maskDocumentNumber(document.documentNumber, request.resolvedKycPolicy.masking.documentNumberVisibleSuffix) : undefined, issuingCountry: document.issuingCountry, expiryDate: document.expiryDate, retentionUntil: expiry, legalHold: false, version: 1 }));
        request.auditModel = { auditEventCode: code('kyc-audit'), tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, caseCode: request.caseModel.caseCode, subjectType: request.subjectType, subjectCodeHash: SERVICE.DefaultKycPolicyService.hashSubjectCode(request.subjectCode, request.resolvedKycPolicy.masking.subjectCodeHashAlgorithm), operation: 'SUBMITTED', actorReference: request.authData && (request.authData.principalId || request.authData.loginId || request.authData.userId) || 'service', permissionCode: 'kyc.case.submit', correlationId: request.correlationId, outcome: request.caseModel.status, safeEvidence: { policyCode: request.caseModel.policyCode, verificationLevel: request.caseModel.verificationLevel, documentCount: request.documentModels.length }, occurredAt: now, status: 'RECORDED', version: 1 };
        ok(process, request, response);
    },
    /**
     * Executes the persist case evidence operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    persistCaseEvidence: function (request, response, process) {
        const persistence = (CONFIG.get('kyc.persistence') || {});
        if (persistence.requireAtomicSubmission !== true || !SERVICE.DefaultDatabaseTransactionService) {
            const error = new Error('Atomic KYC submission persistence is unavailable.'); error.code = 'KYC_PROVIDER_UNAVAILABLE'; return fail(process, request, response, error);
        }
        SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: persistence.transactionModuleName || 'kycSchema', tenant: request.tenant, test: request.test === true }, async transactionContext => {
            const base = { tenant: request.tenant, authData: request.authData, options: { recursive: true }, transactionContext };
            const existingCases = records(await SERVICE.DefaultKycVerificationCaseService.get(Object.assign({}, base, { query: { submissionIdentityHash: request.submissionIdentityHash }, searchOptions: { limit: 2 } }), {}));
            if (existingCases.length > 1) throw Object.assign(new Error('Duplicate KYC idempotency evidence was found.'), { code: 'KYC_STATE_CONFLICT' });
            if (existingCases.length === 1) { request.caseModel = existingCases[0]; request.idempotent = true; return; }
            const profiles = records(await SERVICE.DefaultKycProfileService.get(Object.assign({}, base, { query: { profileIdentityHash: request.profileIdentityHash }, searchOptions: { limit: 2 } }), {}));
            if (profiles.length > 1) throw Object.assign(new Error('Duplicate scoped KYC profiles were found.'), { code: 'KYC_STATE_CONFLICT' });
            if (profiles.length === 1) {
                const profile = profiles[0]; request.caseModel.profileCode = profile.profileCode; request.profileModel.profileCode = profile.profileCode;
                const result = await SERVICE.DefaultKycProfileService.update(Object.assign({}, base, { query: { profileCode: profile.profileCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, version: profile.version }, model: { $set: { latestCaseCode: request.caseModel.caseCode, kycStatus: request.caseModel.status, policyCode: request.caseModel.policyCode, requiresReview: false, version: Number(profile.version) + 1 } } }));
                if (affected(result) !== 1) throw Object.assign(new Error('The KYC profile changed during submission.'), { code: 'KYC_STATE_CONFLICT' });
            } else {
                await SERVICE.DefaultKycProfileService.save(Object.assign({}, base, { model: request.profileModel }));
            }
            if (request.consentModel) await SERVICE.DefaultKycConsentService.save(Object.assign({}, base, { model: request.consentModel }));
            await SERVICE.DefaultKycVerificationCaseService.save(Object.assign({}, base, { model: request.caseModel }));
            for (const model of request.documentModels) await SERVICE.DefaultKycDocumentService.save(Object.assign({}, base, { model }));
            await SERVICE.DefaultKycAuditEventService.save(Object.assign({}, base, { model: request.auditModel }));
            request.idempotent = false;
        }).then(() => ok(process, request, response)).catch(error => fail(process, request, response, error));
    },
    /**
     * Executes the start verification workflow operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    startVerificationWorkflow: function (request, response, process) {
        if (request.idempotent === true) { response.success.data = { caseCode: request.caseModel.caseCode, status: request.caseModel.status, idempotent: true }; return ok(process, request, response); }
        SERVICE.DefaultKycLifecycleGovernanceService.bindDocuments(request, request.documentModels).then(() => {
            if (request.caseModel.status === 'DOCUMENTS_REQUIRED') { response.success.data = { caseCode: request.caseModel.caseCode, status: request.caseModel.status, missingDocumentTypes: request.missingDocumentTypes }; return ok(process, request, response); }
            const workflowCode = (CONFIG.get('kyc.workflows') || {}).verificationWorkflowCode || 'kycVerificationWorkflow';
            return SERVICE.DefaultWorkflowService.initCarrierItem({ tenant: request.tenant, authData: request.authData, workflowCode, code: request.caseModel.caseCode, item: { caseCode: request.caseModel.caseCode, subjectType: request.subjectType, subjectCode: request.subjectCode }, event: { enabled: true }, sourceDetail: { schemaName: 'kycVerificationCase', moduleName: 'kycSchema' } }).then(result => { response.success.data = { caseCode: request.caseModel.caseCode, status: request.caseModel.status, workflow: result }; ok(process, request, response); });
        }).catch(error => fail(process, request, response, error));
    },
    /**
     * Validates review request within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateReviewRequest: function (request, response, process) { if (!request.caseCode || !request.action || !request.reasonCode) { const error = new Error('Case, action, and reason are required.'); error.code = 'KYC_INVALID_REQUEST'; return fail(process, request, response, error); } ok(process, request, response); },
    /**
     * Authorizes action within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    authorizeAction: function (request, response, process) {
        const permissions = request.authData && Array.isArray(request.authData.permissions) ? request.authData.permissions : [];
        const actionPermissions = (CONFIG.get('kyc.policy') || {}).actionPermissions || {};
        const requiredPermission = actionPermissions[request.action];
        if (!requiredPermission || !permissions.includes(requiredPermission)) { const error = new Error('The authenticated principal cannot perform this KYC action.'); error.code = 'KYC_OPERATION_FORBIDDEN'; return fail(process, request, response, error); }
        request.actorReference = request.authData.principalId || request.authData.loginId || request.authData.userId;
        if (!request.actorReference) { const error = new Error('Authenticated KYC actor identity is unavailable.'); error.code = 'KYC_OPERATION_FORBIDDEN'; return fail(process, request, response, error); }
        ok(process, request, response);
    },
    /**
     * Loads case within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    loadCase: function (request, response, process) {
        SERVICE.DefaultKycVerificationCaseService.get({ tenant: request.tenant, authData: request.authData, searchOptions: { pageSize: 1 }, query: { caseCode: request.caseCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode } }, {}).then(result => {
            const records = result && result.result || [];
            if (records.length !== 1) { const error = new Error('The scoped KYC case was not found.'); error.code = 'KYC_CASE_NOT_FOUND'; return fail(process, request, response, error); }
            request.caseModel = records[0]; request.currentStatus = request.caseModel.status; request.policyCode = request.caseModel.policyCode; request.previousDecisionCode = request.caseModel.latestDecisionCode; ok(process, request, response);
        }).catch(error => fail(process, request, response, error));
    },
    /**
     * Resolves transition within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolveTransition: function (request, response, process) { try { request.transition = SERVICE.DefaultKycLifecycleService.resolveAction(request.action, request.currentStatus, { makerChecker: request.makerChecker }); ok(process, request, response); } catch (error) { fail(process, request, response, error); } },
    /**
     * Executes the append decision operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    appendDecision: function (request, response, process) {
        const model = { decisionCode: code('kyc-decision'), tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, caseCode: request.caseCode, decision: request.transition.status, reasonCode: request.reasonCode, safeReason: request.safeReason || request.reasonCode, actorType: 'EMPLOYEE', actorReference: request.actorReference, previousDecisionCode: request.previousDecisionCode, makerReference: request.makerChecker && request.makerChecker.makerReference, checkerReference: request.makerChecker && request.makerChecker.checkerReference, policyCode: request.policyCode, decidedAt: new Date(), status: 'FINAL', version: 1 };
        SERVICE.DefaultKycDecisionService.save({ tenant: request.tenant, authData: request.authData, options: { recursive: true }, model }).then(() => { request.decisionModel = model; ok(process, request, response); }).catch(error => fail(process, request, response, error));
    },
    /**
     * Updates case within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    updateCase: function (request, response, process) {
        SERVICE.DefaultKycVerificationCaseService.update({ tenant: request.tenant, authData: request.authData, query: { caseCode: request.caseCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, version: request.caseModel.version }, model: { $set: { status: request.transition.status, latestDecisionCode: request.decisionModel.decisionCode, version: request.caseModel.version + 1 } } }).then(result => {
            const value = result && result.result !== undefined ? result.result : result;
            const affected = Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || 0);
            if (affected !== 1) { const error = new Error('The KYC case changed before this decision completed.'); error.code = 'KYC_STATE_CONFLICT'; return fail(process, request, response, error); }
            ok(process, request, response);
        }).catch(error => fail(process, request, response, error));
    },
    /**
     * Validates webhook envelope within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateWebhookEnvelope: function (request, response, process) { try { const proof = request.webhookVerification || {}; const verified = Object.assign({}, request.webhookEnvelope || {}, { providerCode: request.providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, signatureVerified: proof.signatureVerified === true, replayed: proof.replayed === true, idempotencyAccepted: proof.idempotencyAccepted === true }); SERVICE.DefaultKycLifecycleService.verifyWebhookEnvelope(verified); request.webhookEnvelope = verified; ok(process, request, response); } catch (error) { fail(process, request, response, error); } },
    /**
     * Normalizes webhook evidence within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    normalizeWebhookEvidence: function (request, response, process) { request.safeProviderEvidence = SERVICE.DefaultKycLifecycleService.normalizeProviderEvidence(request.providerEvidence); ok(process, request, response); },
    /**
     * Executes the append provider check operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    appendProviderCheck: function (request, response, process) { const model = { checkCode: code('kyc-check'), tenantCode: request.webhookEnvelope.tenantCode, enterpriseCode: request.webhookEnvelope.enterpriseCode, caseCode: request.caseCode, checkType: request.checkType, mandatory: request.mandatory !== false, providerCode: request.safeProviderEvidence.providerCode, providerCheckRef: request.safeProviderEvidence.providerCheckRef, resultCode: request.safeProviderEvidence.decision || request.safeProviderEvidence.status, reasonCode: request.safeProviderEvidence.reasonCode, safeEvidence: request.safeProviderEvidence, completedAt: new Date(), status: 'COMPLETED', version: 1 }; SERVICE.DefaultKycCheckService.save({ tenant: request.tenant, authData: request.authData, options: { recursive: true }, model }).then(() => { request.checkModel = model; ok(process, request, response); }).catch(error => fail(process, request, response, error)); },
    /**
     * Executes the continue workflow operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    continueWorkflow: function (request, response, process) {
        SERVICE.DefaultKycLifecycleProjectionService.project(request).then(result => { response.success.data = result; ok(process, request, response); }).catch(error => fail(process, request, response, error));
    }
};
