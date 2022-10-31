/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
    // ************************************************  Email OTP Actions End  ****************************************
};