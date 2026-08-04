/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module kycCore/service/DefaultKycRateLimitService
 * @description Maps KYC operations to configuration-driven, tenant-scoped platform rate limits.
 * @layer service
 * @owner kycCore
 * @override Customer modules may replace operation policies and identity composition while retaining distributed production enforcement.
 */
module.exports = {
    init: () => Promise.resolve(true),
    postInit: () => Promise.resolve(true),

    /**

     * Executes the enforce operation within the kycCore-owned layered contract.

     *

     * @param {*} operation Value defined by the surrounding Nodics operation contract.

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    enforce: function (operation, request) {
        const config = CONFIG.get('kyc.rateLimit') || {};
        const policy = (config.operations || {})[operation];
        if (!policy || policy.enabled === false) return Promise.resolve({ allowed: true, disabled: true });
        const tenant = request.tenantCode || request.tenant && (request.tenant.code || request.tenant);
        const actor = request.authData && (request.authData.principalId || request.authData.loginId || request.authData.userId);
        const source = Object.assign({}, request, { tenantCode: tenant, actorReference: actor });
        const identity = (policy.identityFields || []).map(field => source[field] === undefined ? '' : String(source[field])).join('|');
        if (!tenant || !identity.replace(/\|/g, '')) {
            const error = new Error('KYC rate-limit identity is incomplete.');
            error.code = 'KYC_INVALID_REQUEST';
            return Promise.reject(error);
        }
        const environment = String(CONFIG.get('environment') || CONFIG.get('env') || process.env.NODE_ENV || 'development').toLowerCase();
        return SERVICE.DefaultRateLimitService.enforce({
            tenant,
            capability: 'kyc',
            operation,
            identity,
            limit: policy.limit,
            windowSeconds: policy.windowSeconds,
            moduleName: config.moduleName || 'cache',
            channelName: config.channelName || 'rateLimit',
            requireDistributed: config.requireDistributedInProduction === true && ['production', 'prod'].includes(environment)
        });
    }
};
