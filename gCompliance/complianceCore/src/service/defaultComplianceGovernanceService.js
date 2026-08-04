/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module complianceCore/service/DefaultComplianceGovernanceService
 * @description Provides shared fail-closed authorization, masking, retention, and bounded audit helpers.
 * @layer service
 * @owner complianceCore
 * @override Later project or customer modules may strengthen policy without exposing protected evidence or weakening tenant isolation.
 */

const denied = function (message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
};

const auditEvidenceFields = Object.freeze([
    'actionCode', 'resultCode', 'reasonCode', 'subjectType', 'subjectReference',
    'caseCode', 'providerCode', 'policyCode', 'correlationId', 'eventTime'
]);

module.exports = {
    init: () => Promise.resolve(true),
    postInit: () => Promise.resolve(true),

    /**

     * Asserts permission within the complianceCore-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @param {*} permission Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    assertPermission: function (request, permission) {
        const permissions = (((request || {}).authData || {}).permissions || []);
        if (!permission || !permissions.includes(permission)) {
            throw denied('The principal is not authorized for this compliance operation.', 'ERR_CMP_00002');
        }
        return true;
    },

    /**

     * Executes the mask operation within the complianceCore-owned layered contract.

     *

     * @param {*} value Value defined by the surrounding Nodics operation contract.

     * @param {*} visibleSuffix Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    mask: function (value, visibleSuffix) {
        if (value === undefined || value === null || value === '') return value;
        const text = String(value);
        const suffixLength = Math.max(0, Math.min(text.length, Number(visibleSuffix) || 0));
        return `${'*'.repeat(text.length - suffixLength)}${text.slice(text.length - suffixLength)}`;
    },

    /**

     * Resolves retention action within the complianceCore-owned layered contract.

     *

     * @param {*} record Value defined by the surrounding Nodics operation contract.

     * @param {*} now Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    resolveRetentionAction: function (record, now) {
        const input = record || {};
        if (input.legalHold === true) return 'HOLD';
        if (!input.retentionExpiresAt) return 'RETAIN';
        const expiry = new Date(input.retentionExpiresAt).getTime();
        if (!Number.isFinite(expiry)) {
            throw denied('The compliance retention expiry is invalid.', 'ERR_CMP_00005');
        }
        return expiry <= (now === undefined ? Date.now() : now) ? 'DELETE_ELIGIBLE' : 'RETAIN';
    },

    /**

     * Executes the sanitize audit evidence operation within the complianceCore-owned layered contract.

     *

     * @param {*} evidence Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    sanitizeAuditEvidence: function (evidence) {
        return auditEvidenceFields.reduce((safe, field) => {
            if (evidence && evidence[field] !== undefined) safe[field] = evidence[field];
            return safe;
        }, {});
    }
};
