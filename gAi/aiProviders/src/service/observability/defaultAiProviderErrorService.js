/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/observability/defaultAiProviderErrorService
 * @description Normalizes provider transport failures into safe provider-neutral operational codes.
 * @layer service
 * @owner aiProviders
 * @override Projects may extend mappings while preserving redaction and provider-neutral caller contracts.
 */
const classifications = Object.freeze({
    QUOTA: { code: 'AI_PROVIDER_QUOTA_EXCEEDED', category: 'QUOTA', retryable: false },
    AUTHENTICATION: { code: 'AI_PROVIDER_AUTHENTICATION_FAILED', category: 'AUTHENTICATION', retryable: false },
    RATE_LIMIT: { code: 'AI_PROVIDER_RATE_LIMITED', category: 'RATE_LIMIT', retryable: true },
    TIMEOUT: { code: 'AI_PROVIDER_TIMEOUT', category: 'TIMEOUT', retryable: true },
    UNAVAILABLE: { code: 'AI_PROVIDER_UNAVAILABLE', category: 'UNAVAILABLE', retryable: true },
    RESPONSE: { code: 'AI_PROVIDER_RESPONSE_INVALID', category: 'RESPONSE', retryable: false },
    REQUEST: { code: 'AI_PROVIDER_REQUEST_FAILED', category: 'REQUEST', retryable: false }
});

function classification(error) {
    const providerCode = String(error.providerErrorCode || '').toLowerCase();
    if (providerCode === 'insufficient_quota' || providerCode === 'billing_hard_limit_reached') {
        return classifications.QUOTA;
    }
    if (error.transportFailureType === 'TIMEOUT') return classifications.TIMEOUT;
    if (error.transportFailureType === 'RESPONSE_INVALID') return classifications.RESPONSE;
    if (error.status === 401 || error.status === 403) return classifications.AUTHENTICATION;
    if (error.status === 408) return classifications.TIMEOUT;
    if (error.status === 429) return classifications.RATE_LIMIT;
    if (error.status >= 500) return classifications.UNAVAILABLE;
    return error.retryable === true ? Object.assign({}, classifications.REQUEST, { retryable: true }) :
        classifications.REQUEST;
}

module.exports = {
    /**
     * Returns an Error with a stable safe code and non-sensitive diagnostic metadata.
     * Internal pre-invocation errors remain unchanged because they are not provider failures.
     */
    normalize: function (error, input) {
        if (!error || error.aiProviderNormalized === true) return error;
        const providerFailure = input && input.providerInvocationStarted === true ||
            Number.isInteger(error.status) || Boolean(error.transportFailureType);
        if (!providerFailure) return error;
        const mapped = classification(error);
        const normalized = new Error(mapped.code);
        normalized.name = 'AiProviderError';
        normalized.code = mapped.code;
        normalized.retryable = mapped.retryable;
        normalized.aiProviderNormalized = true;
        normalized.providerDiagnostics = Object.freeze({
            category: mapped.category,
            retryable: mapped.retryable,
            status: Number.isInteger(error.status) ? error.status : undefined
        });
        return normalized;
    },

    /** Produces the only provider failure fields permitted in caller persistence and events. */
    diagnostics: function (error) {
        if (!error || error.aiProviderNormalized !== true) return undefined;
        return {
            category: error.providerDiagnostics.category,
            retryable: error.providerDiagnostics.retryable,
            status: error.providerDiagnostics.status
        };
    }
};
