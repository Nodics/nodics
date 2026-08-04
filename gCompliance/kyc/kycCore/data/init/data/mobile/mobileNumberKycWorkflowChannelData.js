/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycCore/data/init/data/mobile/mobileNumberKycWorkflowChannelData
 * @description Provides kyc initializer or sample data consumed by the import layer.
 * @layer data
 * @owner kyc
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    // ************************************************  Mobile OTP Channels Start  ****************************************
    record0: {
        code: "initializeMobileOTP",
        name: "initializeMobileOTP",
        active: true,
        qualifier: {
            decision: 'INITIATE'
        },
        target: 'initializeMobileOTPAction'
    },
    record1: {
        code: "notifyUserMobileOTP",
        name: "notifyUserMobileOTP",
        active: true,
        qualifier: {
            decision: 'NOTIFY'
        },
        target: 'notifyUserMobileOTPAction'
    },
    record2: {
        code: "verifyMobileOTP",
        name: "verifyMobileOTP",
        active: true,
        qualifier: {
            decision: 'VALIDATEOTP'
        },
        target: 'verifyMobileOTPAction'
    },
    record3: {
        code: "handleMobileRetryOTP",
        name: "handleMobileRetryOTP",
        active: true,
        qualifier: {
            decision: 'RETRY'
        },
        target: 'verifyMobileOTPAction'
    },
    record4: {
        code: "mobileOTPValidated",
        name: "mobileOTPValidated",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'mobileOTPValidatedAction'
    },
    // ************************************************  Mobile OTP Channels End  ****************************************
    // ************************************************  Email OTP Channels Start  ****************************************
    record5: {
        code: "initializeEmailOTP",
        name: "initializeEmailOTP",
        active: true,
        qualifier: {
            decision: 'INITIATE'
        },
        target: 'initializeEmailOTPAction'
    },
    record6: {
        code: "notifyUserEmailOTP",
        name: "notifyUserEmailOTP",
        active: true,
        qualifier: {
            decision: 'NOTIFY'
        },
        target: 'notifyUserEmailOTPAction'
    },
    record7: {
        code: "verifyEmailOTP",
        name: "verifyEmailOTP",
        active: true,
        qualifier: {
            decision: 'VALIDATEOTP'
        },
        target: 'verifyEmailOTPAction'
    },
    record8: {
        code: "handleEmailRetryOTP",
        name: "handleEmailRetryOTP",
        active: true,
        qualifier: {
            decision: 'RETRY'
        },
        target: 'verifyEmailOTPAction'
    },
    record9: {
        code: "emailOTPValidated",
        name: "emailOTPValidated",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'emailOTPValidatedAction'
    },
    record10: { code: 'submitKycProvider', name: 'Submit KYC provider', active: true, qualifier: { decision: 'SUBMIT' }, target: 'submitKycProviderAction' },
    record11: { code: 'completeKycApproval', name: 'Complete KYC approval', active: true, qualifier: { decision: 'APPROVED' }, target: 'completeKycDecisionAction' },
    record12: { code: 'completeKycRejection', name: 'Complete KYC rejection', active: true, qualifier: { decision: 'REJECTED' }, target: 'completeKycDecisionAction' },
    record13: { code: 'waitKycProvider', name: 'Wait for KYC provider', active: true, qualifier: { decision: 'PENDING' }, target: 'waitKycProviderAction' },
    record14: { code: 'openKycManualReview', name: 'Open KYC manual review', active: true, qualifier: { decision: 'MANUAL_REVIEW_REQUIRED' }, target: 'reviewKycCaseAction' },
    record15: { code: 'requestKycInformation', name: 'Request KYC information', active: true, qualifier: { decision: 'REQUEST_MORE_INFORMATION' }, target: 'reviewKycCaseAction' },
    record16: { code: 'escalateKycReview', name: 'Escalate KYC review', active: true, qualifier: { decision: 'ESCALATE' }, target: 'reviewKycCaseAction' },
    // ************************************************  Email OTP Channels End  ****************************************
};
