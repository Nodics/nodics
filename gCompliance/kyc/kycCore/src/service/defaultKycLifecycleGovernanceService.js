/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/service/DefaultKycLifecycleGovernanceService @description Executes bounded, retry-safe expiry, re-verification, retention, legal-hold, notification, event, and nMedia coordination under CronJob ownership. @layer service @owner kycCore @override Customer modules may replace timing, batch size, notification scenarios, or lifecycle selection while retaining KYC and nMedia ownership boundaries. */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the config operation within the kycCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return CONFIG.get('kyc.lifecycle') || {}; },
    rows: value => value && Array.isArray(value.result) ? value.result : [],
    serviceAuthData: enterpriseCode => ({ tokenType: 'service', principalId: 'kycLifecycleScheduler', serviceName: 'kycCore', enterpriseCode, permissions: ['kyc.system.lifecycle'] }),
    /**
     * Executes the run operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    run: async function (request) {
        const definition = request.definition || {}; const body = (definition.jobDetail || {}).body || request.body || {};
        const tenant = body.tenant || definition.tenant || request.tenant || 'default'; const enterpriseCode = body.enterpriseCode || definition.enterpriseCode || request.enterpriseCode || 'default';
        const scoped = { tenant, tenantCode: tenant.code || tenant, enterpriseCode, authData: this.serviceAuthData(enterpriseCode), correlationId: request.correlationId || `${definition.code || 'kycLifecycle'}:${new Date().toISOString().slice(0, 13)}` };
        const now = new Date(request.now || Date.now()); const result = { inspected: 0, expiredProfiles: 0, reverificationNotices: 0, deletedDocuments: 0, heldDocuments: 0, failures: [] };
        await this.processProfiles(scoped, now, result); await this.processDocuments(scoped, now, result);
        return Object.assign(result, { retryRequired: result.failures.length > 0, completedAt: new Date() });
    },
    /**
     * Executes the process profiles operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} now Value defined by the surrounding Nodics operation contract.
     * @param {*} result Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    processProfiles: async function (request, now, result) {
        const policy = this.config(); const limit = Number(policy.batchSize || 100); const noticeAt = new Date(now.getTime() + Number(policy.reverificationNoticeDays || 30) * 86400000);
        const profiles = this.rows(await SERVICE.DefaultKycProfileService.get({ tenant: request.tenant, authData: request.authData, query: { tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, status: 'ACTIVE', expiresAt: { $lte: noticeAt } }, searchOptions: { limit, sort: { expiresAt: 1 } } }, {}));
        for (const profile of profiles) { result.inspected += 1; try { if (new Date(profile.expiresAt).getTime() <= now.getTime()) await this.expireProfile(request, profile, result); else await this.requestReverification(request, profile, result); } catch (error) { result.failures.push({ type: 'PROFILE', code: profile.profileCode, errorCode: error.code || 'KYC_LIFECYCLE_FAILED' }); } }
    },
    /**
     * Executes the expire profile operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} profile Value defined by the surrounding Nodics operation contract.
     * @param {*} result Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    expireProfile: async function (request, profile, result) {
        if (profile.kycStatus === 'EXPIRED') return;
        await SERVICE.DefaultKycProfileService.update({ tenant: request.tenant, authData: request.authData, query: { profileCode: profile.profileCode, version: profile.version }, model: { $set: { kycStatus: 'EXPIRED', requiresReview: true, version: Number(profile.version) + 1 } } });
        await this.afterStateChange(request, profile, 'KYC_EXPIRED', 'EXPIRED'); result.expiredProfiles += 1;
    },
    /**
     * Executes the request reverification operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} profile Value defined by the surrounding Nodics operation contract.
     * @param {*} result Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    requestReverification: async function (request, profile, result) {
        if (profile.kycStatus === 'REVERIFICATION_REQUIRED') return;
        await SERVICE.DefaultKycProfileService.update({ tenant: request.tenant, authData: request.authData, query: { profileCode: profile.profileCode, version: profile.version }, model: { $set: { kycStatus: 'REVERIFICATION_REQUIRED', requiresReview: true, version: Number(profile.version) + 1 } } });
        await this.afterStateChange(request, profile, 'KYC_REVERIFICATION_REQUIRED', 'REVERIFICATION_REQUIRED'); result.reverificationNotices += 1;
    },
    /**
     * Executes the process documents operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} now Value defined by the surrounding Nodics operation contract.
     * @param {*} result Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    processDocuments: async function (request, now, result) {
        const limit = Number(this.config().batchSize || 100); const documents = this.rows(await SERVICE.DefaultKycDocumentService.get({ tenant: request.tenant, authData: request.authData, query: { tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, retentionUntil: { $lte: now }, status: { $ne: 'DELETED' } }, searchOptions: { limit, sort: { retentionUntil: 1 } } }, {}));
        for (const document of documents) { result.inspected += 1; try { if (document.legalHold === true) { await SERVICE.DefaultMediaLifecycleCoordinationService.setLegalHold(Object.assign({}, request, { mediaCode: document.mediaCode, legalHold: true })); await SERVICE.DefaultKycAuditService.record(request, { caseCode: document.caseCode, operation: 'LEGAL_HOLD_ENFORCED', outcome: 'HELD', correlationId: `${request.correlationId}:${document.documentCode}:hold`, safeEvidence: { documentCode: document.documentCode, mediaCode: document.mediaCode } }); result.heldDocuments += 1; continue; } await SERVICE.DefaultMediaLifecycleCoordinationService.deleteExpired(Object.assign({}, request, { mediaCode: document.mediaCode, now, legalHold: false })); await SERVICE.DefaultKycDocumentService.update({ tenant: request.tenant, authData: request.authData, query: { documentCode: document.documentCode, version: document.version }, model: { $set: { status: 'DELETED', version: Number(document.version) + 1 } } }); await SERVICE.DefaultKycAuditService.record(request, { caseCode: document.caseCode, operation: 'DOCUMENT_DELETED', outcome: 'DELETED', correlationId: `${request.correlationId}:${document.documentCode}`, safeEvidence: { documentCode: document.documentCode, mediaCode: document.mediaCode, retentionUntil: document.retentionUntil } }); result.deletedDocuments += 1; } catch (error) { result.failures.push({ type: 'DOCUMENT', code: document.documentCode, errorCode: error.code || 'KYC_LIFECYCLE_FAILED' }); await SERVICE.DefaultKycAuditService.record(request, { caseCode: document.caseCode, operation: 'LIFECYCLE_RETRY_REQUIRED', outcome: 'FAILED', correlationId: `${request.correlationId}:${document.documentCode}:failure`, safeEvidence: { documentCode: document.documentCode, errorCode: error.code || 'KYC_LIFECYCLE_FAILED' } }); } }
    },
    /**
     * Executes the after state change operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} profile Value defined by the surrounding Nodics operation contract.
     * @param {*} eventType Value defined by the surrounding Nodics operation contract.
     * @param {*} status Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    afterStateChange: async function (request, profile, eventType, status) {
        const data = { eventCode: `${eventType}:${profile.profileCode}:${new Date(profile.expiresAt).toISOString()}`, eventType, profileCode: profile.profileCode, subjectType: profile.subjectType, subjectCode: profile.subjectCode, status, correlationId: request.correlationId, notificationIntent: { templateCode: eventType === 'KYC_EXPIRED' ? 'kyc-expired' : 'kyc-reverification-required', templateVariables: { profileCode: profile.profileCode, expiresAt: profile.expiresAt } } };
        await SERVICE.DefaultKycAuditService.record(request, { caseCode: profile.latestCaseCode, subjectType: profile.subjectType, operation: eventType, outcome: status, correlationId: data.eventCode, safeEvidence: { profileCode: profile.profileCode, expiresAt: profile.expiresAt } });
        if (SERVICE.DefaultEventService) await SERVICE.DefaultEventService.publish({ tenant: request.tenant, authData: request.authData, event: { eventType, data } });
        if (SERVICE.DefaultNotifyDeliveryService) await SERVICE.DefaultNotifyDeliveryService.send(request, { idempotencyKey: data.eventCode, scenarioCode: 'kycLifecycle', channelCode: 'email', messageTypeCode: 'transactional', templateCode: data.notificationIntent.templateCode, recipientType: profile.subjectType, recipientReference: `${profile.subjectType.toLowerCase()}:${profile.subjectCode}`, ownerModule: 'kycCore', ownerReferenceType: 'KYC_PROFILE', ownerReferenceCode: profile.profileCode, correlationId: request.correlationId, values: data.notificationIntent.templateVariables });
        if (SERVICE.DefaultWorkflowService) await SERVICE.DefaultWorkflowService.initCarrierItem({ tenant: request.tenant, authData: request.authData, workflowCode: (this.config().reverificationWorkflowCode || 'kycReverificationWorkflow'), code: data.eventCode, item: data, event: { enabled: true }, sourceDetail: { moduleName: 'kycSchema', schemaName: 'kycProfile' } });
    },
    /**
     * Executes the bind documents operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} documents Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    bindDocuments: async function (request, documents) {
        return Promise.all((documents || []).map(document => SERVICE.DefaultMediaLifecycleCoordinationService.bind({ tenant: request.tenant, authData: request.authData, mediaCode: document.mediaCode, businessPurpose: (CONFIG.get('kyc.documents') || {}).mediaPurpose || 'kycDocuments', enterpriseCode: request.enterpriseCode, ownerType: 'KYC_SUBJECT', ownerReference: request.subjectCode, reusable: false, retentionUntil: document.retentionUntil, legalHold: document.legalHold === true })));
    }
};
