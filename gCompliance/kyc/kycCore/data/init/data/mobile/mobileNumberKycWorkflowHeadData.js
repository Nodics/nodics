/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycCore/data/init/data/mobile/mobileNumberKycWorkflowHeadData
 * @description Provides kyc initializer or sample data consumed by the import layer.
 * @layer data
 * @owner kyc
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {

    record0: {
        code: "mobileNumberKycWorkflow",
        name: "mobileNumberKycWorkflow",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultMobileNumberKycWorkflowService.performHeadOperation',
        accessGroups: ['userGroup'],
        allowedDecisions: ['INITIATE'],
        channels: ['initializeMobileOTP']
    },
    record1: {
        code: "emailKycWorkflow",
        name: "emailKycWorkflow",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultEmailKycWorkflowService.performHeadOperation',
        accessGroups: ['userGroup'],
        allowedDecisions: ['INITIATE'],
        channels: ['initializeMobileOTP']
    },
    record2: {
        code: 'kycVerificationWorkflow',
        name: 'KYC verification workflow',
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultKycVerificationWorkflowService.performHeadOperation',
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUBMIT'],
        channels: ['submitKycProvider']
    },
    record3: {
        code: 'kycManualReviewWorkflow',
        name: 'KYC manual review workflow',
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        accessGroups: ['userGroup'],
        allowedDecisions: ['APPROVE', 'REJECT', 'REQUEST_MORE_INFORMATION', 'ESCALATE'],
        channels: ['completeKycApproval', 'completeKycRejection', 'requestKycInformation', 'escalateKycReview']
    }
};
