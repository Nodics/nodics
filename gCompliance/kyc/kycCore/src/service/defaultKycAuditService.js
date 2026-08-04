/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/** @module kycCore/service/DefaultKycAuditService @description Appends idempotent, redacted KYC compliance evidence for every governed operation. @layer service @owner kycCore @override Later modules may enrich safe evidence while raw PII, secrets, payloads, and document content remain forbidden. */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Records the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    record: async function (request, input) {
        const correlationId = input.correlationId || request.correlationId || input.caseCode || input.operation;
        const identity = [request.tenantCode || request.tenant, request.enterpriseCode || '', input.operation, correlationId, input.outcome].join('|');
        const auditEventCode = input.auditEventCode || `kyc-audit-${crypto.createHash('sha256').update(identity).digest('hex').substring(0, 32)}`;
        const rows = await SERVICE.DefaultKycAuditEventService.get({ tenant: request.tenant, authData: request.authData, query: { auditEventCode }, searchOptions: { limit: 1 } }, {});
        if (rows && rows.result && rows.result.length) return rows.result[0];
        const model = {
            auditEventCode,
            tenantCode: input.tenantCode || request.tenantCode,
            enterpriseCode: input.enterpriseCode || request.enterpriseCode,
            caseCode: input.caseCode || request.caseCode,
            subjectType: input.subjectType || request.subjectType || 'UNKNOWN',
            subjectCodeHash: input.subjectCodeHash || request.subjectCodeHash || 'scope-bound',
            operation: input.operation,
            actorReference: input.actorReference || request.authData && (request.authData.principalId || request.authData.loginId || request.authData.serviceName) || 'service',
            permissionCode: input.permissionCode || 'kyc.system.lifecycle',
            correlationId,
            outcome: input.outcome,
            safeEvidence: this.redact(input.safeEvidence || {}),
            occurredAt: input.occurredAt || new Date(),
            status: 'RECORDED', version: 1
        };
        return SERVICE.DefaultKycAuditEventService.save({ tenant: request.tenant, authData: request.authData, model });
    },
    /**
     * Executes the redact operation within the kycCore-owned layered contract.
     *
     * @param {*} value Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    redact: function (value) {
        const forbidden = /secret|token|password|authorization|documentnumber|raw|payload|content|biometric|ocr|path|url/i;
        if (Array.isArray(value)) return value.slice(0, 50).map(item => this.redact(item));
        if (!value || typeof value !== 'object') return value;
        return Object.keys(value).slice(0, 50).reduce((result, key) => { if (!forbidden.test(key)) result[key] = this.redact(value[key]); return result; }, {});
    }
};
