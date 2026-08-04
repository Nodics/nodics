/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycCore/src/utils/statusDefinitions
 * @description Provides shared kyc utility exports for status definitions.
 * @layer utils
 * @owner kyc
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    SUC_KYC_00000: {
        code: '200',
        message: 'Request successfully processed'
    },
    SUC_KYC_00001: {
        code: '200',
        message: 'OTP has been sent successfully'
    },
    SUC_KYC_00002: {
        code: '200',
        message: 'KYC has been validated successfully'
    },
    SUC_KYC_00003: {
        code: '200',
        message: 'Token been notified to user successfully'
    },


    ERR_KYC_00000: {
        code: '500',
        message: 'Facing internal server error'
    },
    ERR_KYC_00001: {
        code: '500',
        message: 'KYC process not yet initiated'
    },
    ERR_KYC_00002: {
        code: '500',
        message: 'Undefined KYC type'
    },
    KYC_INVALID_REQUEST: { code: '400', message: 'The KYC request is invalid.' },
    KYC_OPERATION_FORBIDDEN: { code: '403', message: 'The KYC operation is not permitted.' },
    KYC_CASE_NOT_FOUND: { code: '404', message: 'The scoped KYC case was not found.' },
    KYC_STATE_CONFLICT: { code: '409', message: 'The KYC case state changed or does not allow this action.' },
    KYC_CONSENT_REQUIRED: { code: '409', message: 'Active KYC consent evidence is required.' },
    KYC_EVIDENCE_REJECTED: { code: '400', message: 'The KYC evidence reference is not acceptable.' },
    KYC_MAKER_CHECKER_REQUIRED: { code: '409', message: 'A different authorized checker must complete this KYC action.' },
    KYC_PROVIDER_UNAVAILABLE: { code: '503', message: 'The configured KYC provider is unavailable.' },
    KYC_LIVE_CALL_DISABLED: { code: '403', message: 'Live KYC provider execution is disabled.' },
    KYC_WEBHOOK_REJECTED: { code: '401', message: 'The KYC provider callback could not be verified.' },
    KYC_WEBHOOK_REPLAYED: { code: '409', message: 'The KYC provider callback was already processed.' },
    KYC_PROVIDER_TIMEOUT: { code: '504', message: 'The KYC provider did not respond in time.' },
    KYC_PROVIDER_RESPONSE_INVALID: { code: '502', message: 'The KYC provider response was invalid.' }
};
