/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module kycCore/service/DefaultKycLifecycleProjectionService
 * @description Atomically projects provider and review outcomes, then continues external owners after commit.
 * @layer service
 * @owner kycCore
 * @override Later modules may replace decision projection, review creation, event, notification, or Workflow adapters while preserving atomic KYC authority.
 */
const crypto = require('crypto');
const code = prefix => `${prefix}-${crypto.randomUUID()}`;
const list = value => value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : [];
const affected = value => Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || value && value.result && value.result.modifiedCount || 0);
const error = (message, errorCode) => Object.assign(new Error(message), { code: errorCode });

module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the configuration operation within the kycCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    configuration: function () { return CONFIG.get('kyc') || {}; },
    /**
     * Resolves outcome within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    resolveOutcome: function (request) {
        if (request.transition && request.transition.status) return request.transition.status;
        const evidence = request.safeProviderEvidence || {};
        const value = String(evidence.decision || evidence.status || '').toUpperCase();
        if (['APPROVED', 'PASSED', 'SUCCESS'].includes(value)) return 'APPROVED';
        if (['REJECTED', 'FAILED', 'DECLINED'].includes(value)) return 'REJECTED';
        return 'MANUAL_REVIEW_REQUIRED';
    },
    /**
     * Loads one within the kycCore-owned layered contract.
     *
     * @param {*} service Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} label Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    loadOne: async function (service, input, label) {
        const values = list(await service.get(input, {}));
        if (values.length !== 1) throw error(`The scoped ${label} was not uniquely resolved.`, values.length ? 'KYC_STATE_CONFLICT' : 'KYC_CASE_NOT_FOUND');
        return values[0];
    },
    /**
     * Executes the project operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    project: async function (request) {
        const config = this.configuration(); const persistence = config.persistence || {};
        if (!SERVICE.DefaultDatabaseTransactionService || persistence.requireAtomicSubmission !== true) throw error('Atomic KYC lifecycle projection is unavailable.', 'KYC_PROVIDER_UNAVAILABLE');
        const outcome = this.resolveOutcome(request); const now = new Date(); const expiryDays = Number((config.policy || {}).expiryDays || 365);
        const result = await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: persistence.transactionModuleName || 'kycSchema', tenant: request.tenant, test: request.test === true }, async transactionContext => {
            const base = { tenant: request.tenant, authData: request.authData, transactionContext, options: { recursive: true } };
            const caseModel = request.caseModel || await this.loadOne(SERVICE.DefaultKycVerificationCaseService, Object.assign({}, base, { query: { caseCode: request.caseCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode }, searchOptions: { limit: 2 } }), 'KYC case');
            const profile = await this.loadOne(SERVICE.DefaultKycProfileService, Object.assign({}, base, { query: { profileCode: caseModel.profileCode, tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode }, searchOptions: { limit: 2 } }), 'KYC profile');
            let check = request.checkModel;
            if (!check && request.safeProviderEvidence) {
                check = { checkCode: code('kyc-check'), tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, caseCode: caseModel.caseCode, checkType: request.checkType || 'PROVIDER', mandatory: request.mandatory !== false, providerCode: request.safeProviderEvidence.providerCode, providerCheckRef: request.safeProviderEvidence.providerCheckRef, resultCode: outcome, reasonCode: request.safeProviderEvidence.reasonCode, safeEvidence: request.safeProviderEvidence, completedAt: now, status: 'COMPLETED', version: 1 };
                await SERVICE.DefaultKycCheckService.save(Object.assign({}, base, { model: check }));
            }
            const decision = request.decisionModel || { decisionCode: code('kyc-decision'), tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, caseCode: caseModel.caseCode, decision: outcome, reasonCode: request.reasonCode || (request.safeProviderEvidence || {}).reasonCode || 'KYC_OUTCOME', safeReason: request.safeReason || 'KYC outcome recorded', actorType: request.actorReference ? 'EMPLOYEE' : 'PROVIDER', actorReference: request.actorReference || (request.safeProviderEvidence || {}).providerCode || 'system', previousDecisionCode: caseModel.latestDecisionCode, policyCode: caseModel.policyCode, decidedAt: now, expiresAt: outcome === 'APPROVED' ? new Date(now.getTime() + expiryDays * 86400000) : undefined, status: outcome === 'MANUAL_REVIEW_REQUIRED' ? 'PENDING_REVIEW' : 'FINAL', version: 1 };
            if (!request.decisionModel) await SERVICE.DefaultKycDecisionService.save(Object.assign({}, base, { model: decision }));
            let reviewTask;
            if (outcome === 'MANUAL_REVIEW_REQUIRED') {
                const workflow = config.workflows || {};
                const openTasks = list(await SERVICE.DefaultKycReviewTaskService.get(Object.assign({}, base, { query: { caseCode: caseModel.caseCode, tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, status: 'OPEN' }, searchOptions: { limit: 2 } }), {}));
                if (openTasks.length > 1) throw error('Duplicate open KYC review tasks were found.', 'KYC_STATE_CONFLICT');
                reviewTask = openTasks[0];
                if (!reviewTask) {
                    reviewTask = { reviewTaskCode: code('kyc-review'), tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, caseCode: caseModel.caseCode, queueCode: request.queueCode || 'KYC_MANUAL_REVIEW', priority: request.priority || 'NORMAL', dueAt: new Date(now.getTime() + Number(workflow.reviewSlaHours || 24) * 3600000), makerCheckerRequired: true, requestedAction: 'REVIEW', escalationLevel: 0, status: 'OPEN', version: 1 };
                    await SERVICE.DefaultKycReviewTaskService.save(Object.assign({}, base, { model: reviewTask }));
                }
            } else {
                const openTasks = list(await SERVICE.DefaultKycReviewTaskService.get(Object.assign({}, base, { query: { caseCode: caseModel.caseCode, tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, status: { $in: ['OPEN', 'CLAIMED', 'ESCALATED', 'CHECKER_PENDING'] } }, searchOptions: { limit: 20 } }), {}));
                for (const task of openTasks) {
                    const completed = await SERVICE.DefaultKycReviewTaskService.update(Object.assign({}, base, { query: { reviewTaskCode: task.reviewTaskCode, version: task.version, status: task.status }, model: { $set: { status: outcome === 'APPROVED' ? 'COMPLETED' : 'CLOSED', requestedAction: outcome, version: Number(task.version) + 1 } } }));
                    if (affected(completed) !== 1) throw error('The KYC review task changed during lifecycle projection.', 'KYC_STATE_CONFLICT');
                    reviewTask = Object.assign({}, task, { status: outcome === 'APPROVED' ? 'COMPLETED' : 'CLOSED', requestedAction: outcome });
                }
            }
            const checkCodes = Array.from(new Set([...(caseModel.checkCodes || []), ...(check ? [check.checkCode] : [])]));
            const caseUpdate = await SERVICE.DefaultKycVerificationCaseService.update(Object.assign({}, base, { query: { caseCode: caseModel.caseCode, tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, version: caseModel.version }, model: { $set: { status: outcome, checkCodes, latestDecisionCode: decision.decisionCode, currentReviewer: reviewTask && reviewTask.assignedTo, expiresAt: decision.expiresAt, version: Number(caseModel.version) + 1 } } }));
            if (affected(caseUpdate) !== 1) throw error('The KYC case changed during lifecycle projection.', 'KYC_STATE_CONFLICT');
            const profileUpdate = await SERVICE.DefaultKycProfileService.update(Object.assign({}, base, { query: { profileCode: profile.profileCode, tenantCode: profile.tenantCode, enterpriseCode: profile.enterpriseCode, version: profile.version }, model: { $set: { kycStatus: outcome, latestCaseCode: caseModel.caseCode, latestDecisionCode: decision.decisionCode, verifiedAt: outcome === 'APPROVED' ? now : profile.verifiedAt, expiresAt: decision.expiresAt, requiresReview: outcome === 'MANUAL_REVIEW_REQUIRED', version: Number(profile.version) + 1 } } }));
            if (affected(profileUpdate) !== 1) throw error('The KYC profile changed during lifecycle projection.', 'KYC_STATE_CONFLICT');
            const audit = { auditEventCode: code('kyc-audit'), tenantCode: caseModel.tenantCode, enterpriseCode: caseModel.enterpriseCode, caseCode: caseModel.caseCode, subjectType: caseModel.subjectType, subjectCodeHash: SERVICE.DefaultKycPolicyService.hashSubjectCode(caseModel.subjectCode), operation: request.safeProviderEvidence ? 'PROVIDER_CALLBACK' : 'DECIDED', actorReference: decision.actorReference, permissionCode: request.safeProviderEvidence ? 'kyc.provider.callback' : `kyc.review.${String(request.action || 'decision').toLowerCase()}`, correlationId: caseModel.correlationId, outcome, safeEvidence: { checkCode: check && check.checkCode, decisionCode: decision.decisionCode, reviewTaskCode: reviewTask && reviewTask.reviewTaskCode }, occurredAt: now, status: 'RECORDED', version: 1 };
            await SERVICE.DefaultKycAuditEventService.save(Object.assign({}, base, { model: audit }));
            return { caseModel, profile, check, decision, reviewTask, audit, outcome };
        });
        await this.continueOwners(request, result);
        return { caseCode: result.caseModel.caseCode, profileCode: result.profile.profileCode, status: result.outcome, checkCode: result.check && result.check.checkCode, decisionCode: result.decision.decisionCode, reviewTaskCode: result.reviewTask && result.reviewTask.reviewTaskCode };
    },
    /**
     * Executes the continue owners operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} projection Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    continueOwners: async function (request, projection) {
        await SERVICE.DefaultKycWorkflowContinuationService.continue(request, projection);
        if (SERVICE.DefaultEventService && typeof SERVICE.DefaultEventService.handleEvent === 'function') await SERVICE.DefaultEventService.handleEvent({ tenant: request.tenant, event: { tenant: request.tenant, active: true, event: `kyc.${projection.outcome.toLowerCase()}`, sourceName: 'kyc', sourceId: projection.audit.auditEventCode, target: 'kycProfile', state: 'NEW', type: 'ASYNC', data: { eventCode: projection.audit.auditEventCode, caseCode: projection.caseModel.caseCode, profileCode: projection.profile.profileCode, subjectType: projection.caseModel.subjectType, decisionCode: projection.decision.decisionCode, status: projection.outcome, correlationId: projection.caseModel.correlationId, occurredAt: new Date() } } });
        if (SERVICE.DefaultNotifyDeliveryService && typeof SERVICE.DefaultNotifyDeliveryService.send === 'function') await SERVICE.DefaultNotifyDeliveryService.send(request, { scenarioCode: 'kycDecision', channelCode: 'inApp', messageTypeCode: 'transactional', recipientType: projection.caseModel.subjectType, recipientReference: projection.caseModel.subjectCode, ownerModule: 'kycCore', ownerReferenceType: 'KYC_CASE', ownerReferenceCode: projection.caseModel.caseCode, correlationId: projection.caseModel.correlationId, idempotencyKey: `kyc:${projection.decision.decisionCode}` });
    }
};
