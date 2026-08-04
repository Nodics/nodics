/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycCore/data/init/data/mobile/mobileNumberKycWorkflowActionData
 * @description Provides kyc initializer or sample data consumed by the import layer.
 * @layer data
 * @owner kyc
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    // ************************************************  Mobile OTP Actions Start  ****************************************
    record0: {
        code: "initializeMobileOTPAction",
        name: "initializeMobileOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultMobileNumberKycWorkflowService.initMobileOTP',
        accessGroups: ['userGroup'],
        allowedDecisions: ['NOTIFY', 'ERROR'],
        channels: ['notifyUserMobileOTP', 'defaultErrorChannel']
    },
    record1: {
        code: "notifyUserMobileOTPAction",
        name: "notifyUserMobileOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultMobileNumberKycWorkflowService.notifyMobileOTP',
        accessGroups: ['userGroup'],
        allowedDecisions: ['VALIDATEOTP', 'ERROR'],
        channels: ['verifyMobileOTP', 'defaultErrorChannel']
    },
    record2: {
        code: "verifyMobileOTPAction",
        name: "verifyMobileOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUCCESS', 'RETRY', 'ERROR'],
        channels: ['mobileOTPValidated', 'handleMobileRetryOTP', 'defaultErrorChannel']
    },
    record3: {
        code: "mobileOTPValidatedAction",
        name: "mobileOTPValidatedAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultMobileNumberKycWorkflowService.updateOTPValidated',
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['defaultSuccessChannel']
    },
    // ************************************************  Mobile OTP Actions End  ****************************************
    // ************************************************  Email OTP Actions Start  ****************************************
    record4: {
        code: "initializeEmailOTPAction",
        name: "initializeEmailOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultEmailKycWorkflowService.initEmailOTP',
        accessGroups: ['userGroup'],
        allowedDecisions: ['NOTIFY', 'ERROR'],
        channels: ['notifyUserEmailOTP', 'defaultErrorChannel']
    },
    record5: {
        code: "notifyUserEmailOTPAction",
        name: "notifyUserEmailOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultEmailKycWorkflowService.notifyMobileOTP',
        accessGroups: ['userGroup'],
        allowedDecisions: ['VALIDATEOTP', 'ERROR'],
        channels: ['verifyEmailOTP', 'defaultErrorChannel']
    },
    record6: {
        code: "verifyEmailOTPAction",
        name: "verifyEmailOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUCCESS', 'RETRY', 'ERROR'],
        channels: ['emailOTPValidated', 'handleEmailRetryOTP', 'defaultErrorChannel']
    },
    record7: {
        code: "emailOTPValidatedAction",
        name: "emailOTPValidatedAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultEmailKycWorkflowService.updateOTPValidated',
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['defaultSuccessChannel']
    },
    record8: {
        code: 'submitKycProviderAction', name: 'Submit KYC provider', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultKycVerificationWorkflowService.submitProvider',
        accessGroups: ['userGroup'],
        allowedDecisions: ['APPROVED', 'REJECTED', 'PENDING', 'MANUAL_REVIEW_REQUIRED', 'ERROR'],
        channels: ['completeKycApproval', 'completeKycRejection', 'waitKycProvider', 'openKycManualReview', 'defaultErrorChannel']
    },
    record9: {
        code: 'reviewKycCaseAction', name: 'Review KYC case', active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['userGroup'],
        allowedDecisions: ['APPROVE', 'REJECT', 'REQUEST_MORE_INFORMATION', 'ESCALATE'],
        channels: ['completeKycApproval', 'completeKycRejection', 'requestKycInformation', 'escalateKycReview']
    },
    record10: {
        code: 'completeKycDecisionAction', name: 'Complete KYC decision', active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultKycVerificationWorkflowService.completeDecision',
        accessGroups: ['userGroup'], allowedDecisions: ['SUCCESS'], channels: ['defaultSuccessChannel']
    },
    record11: {
        code: 'waitKycProviderAction', name: 'Wait for KYC provider callback', active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['userGroup'], allowedDecisions: ['APPROVED', 'REJECTED', 'MANUAL_REVIEW_REQUIRED'],
        channels: ['completeKycApproval', 'completeKycRejection', 'openKycManualReview']
    },
    // ************************************************  Email OTP Actions End  ****************************************
};
