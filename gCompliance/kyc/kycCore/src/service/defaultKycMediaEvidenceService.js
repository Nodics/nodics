/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module kycCore/service/DefaultKycMediaEvidenceService @description Delegates KYC document validation and delivery to nMedia with purpose-bound policy and audit. @layer service @owner kycCore @override Later modules may strengthen document requirements while preserving nMedia storage and delivery authority. */
const fail = (message, code) => Object.assign(new Error(message), { code });
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the config operation within the kycCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return CONFIG.get('kyc.documents') || {}; },
    /**
     * Validates the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} document Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validate: async function (request, document) {
        if (!SERVICE.DefaultMediaReferenceLookupService || typeof SERVICE.DefaultMediaReferenceLookupService.validatePurposeBound !== 'function') throw fail('nMedia purpose-bound validation is unavailable.', 'KYC_EVIDENCE_REJECTED');
        const config = this.config(); const requirement = document.requirement || {};
        return SERVICE.DefaultMediaReferenceLookupService.validatePurposeBound({ tenant: request.tenant, authData: request.authData, mediaCode: document.mediaCode, requiredAccess: config.requirePrivateVisibility === false ? undefined : 'PRIVATE', businessPurpose: config.mediaPurpose || 'kycDocuments', enterpriseCode: request.enterpriseCode, allowedMimeTypes: requirement.acceptedMimeTypes || config.allowedMimeTypes, maximumSizeBytes: requirement.maxSizeBytes || config.maximumSizeBytes, ownerReference: request.subjectCode });
    },
    /**
     * Executes the deliver operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    deliver: async function (request) {
        const permissions = (request.authData || {}).permissions || []; if (!permissions.includes('kyc.document.deliver')) throw fail('KYC document delivery is not authorized.', 'KYC_OPERATION_FORBIDDEN');
        await SERVICE.DefaultKycRateLimitService.enforce('documentAccess', request);
        const documents = await SERVICE.DefaultKycDocumentService.get({ tenant: request.tenant, authData: request.authData, query: { documentCode: request.documentCode, caseCode: request.caseCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode }, searchOptions: { limit: 2 } }, {});
        const items = documents && documents.result || []; if (items.length !== 1) throw fail('The scoped KYC document was not found.', 'KYC_CASE_NOT_FOUND');
        const document = items[0]; await this.validate(request, { mediaCode: document.mediaCode });
        await SERVICE.DefaultKycAuditService.record(request, { tenantCode: document.tenantCode, enterpriseCode: document.enterpriseCode, caseCode: document.caseCode, operation: 'MEDIA_DELIVERED', permissionCode: 'kyc.document.deliver', correlationId: request.correlationId || document.documentCode, outcome: request.deliveryIntent || 'PREVIEW', safeEvidence: { documentCode: document.documentCode, mediaCode: document.mediaCode } });
        return SERVICE.DefaultMediaDeliveryService.deliver({ tenant: request.tenant, authData: request.authData, mediaCode: document.mediaCode });
    }
};
