/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "initializeMobileOTPAction",
        name: "initializeMobileOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultMobileNumberValidationWorkflowService.initializeMobileOTP',
        accessGroups: ['userGroup'],
        allowedDecisions: ['VALIDATEOTP', 'REJECT', 'ERROR'],
        channels: ['verifyMobileOTP', 'defaultRejectChannel', 'defaultErrorChannel']
    },
    record1: {
        code: "verifyMobileOTPAction",
        name: "verifyMobileOTPAction",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUCCESS', 'EXPIRED', 'RETRY', 'ERROR'],
        channels: ['mobileOTPValidated', 'handleExpiredOTP', 'handleRetryOTP', 'defaultErrorChannel']
    },
    record2: {
        code: "mobileOTPValidatedAction",
        name: "mobileOTPValidatedAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultMobileNumberValidationWorkflowService.updateOTPValidated',
        accessGroups: ['userGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['defaultSuccessChannel']
    }
};