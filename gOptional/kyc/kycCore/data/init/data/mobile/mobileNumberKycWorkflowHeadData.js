/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gOptional/kyc/kycCore/data/init/data/mobile/mobileNumberKycWorkflowHeadData
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
    }
};