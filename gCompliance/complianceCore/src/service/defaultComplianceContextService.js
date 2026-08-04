/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module complianceCore/service/DefaultComplianceContextService
 * @description Resolves the authoritative tenant, enterprise, and subject context shared by compliance capabilities.
 * @layer service
 * @owner complianceCore
 * @override Later project or customer modules may replace subject and scope resolution while preserving fail-closed isolation.
 */

const invalid = function (message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
};

const required = function (value, field) {
    if (value === undefined || value === null || value === '') {
        throw invalid(`Missing required compliance field: ${field}`, 'ERR_CMP_00001');
    }
    return value;
};

module.exports = {
    init: () => Promise.resolve(true),
    postInit: () => Promise.resolve(true),

    /**

     * Resolves the module artifact within the complianceCore-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @param {*} subject Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    resolve: function (request, subject) {
        const input = subject || {};
        const authData = (request && request.authData) || {};
        const tenantCode = required(authData.tenantCode || (request && request.tenant), 'tenantCode');
        const enterpriseCode = required(authData.enterpriseCode, 'enterpriseCode');

        if (input.tenantCode && input.tenantCode !== tenantCode) {
            throw invalid('Cross-tenant compliance context is prohibited.', 'ERR_CMP_00003');
        }
        if (input.enterpriseCode && input.enterpriseCode !== enterpriseCode) {
            throw invalid('Cross-enterprise compliance context is prohibited.', 'ERR_CMP_00004');
        }

        return Object.freeze({
            tenantCode,
            enterpriseCode,
            subjectType: required(input.subjectType, 'subjectType'),
            subjectCode: required(input.subjectCode, 'subjectCode')
        });
    }
};
