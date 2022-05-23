/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    otpGeneratorPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultGenerateOtpPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultGenerateOtpPipelineService.validateMandateValues',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultGenerateOtpPipelineService.buildQuery',
                success: 'checkExistingOtp'
            },
            checkExistingOtp: {
                type: 'function',
                handler: 'DefaultGenerateOtpPipelineService.checkExistingOtp',
                success: 'generateNewOtp'
            },
            generateNewOtp: {
                type: 'function',
                handler: 'DefaultGenerateOtpPipelineService.generateNewOtp',
                success: 'fatchNewOtp'
            },
            fatchNewOtp: {
                type: 'function',
                handler: 'DefaultGenerateOtpPipelineService.fatchNewOtp',
                success: 'successEnd'
            }
        }
    },
    otpValidatorPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultValidateOtpPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultValidateOtpPipelineService.validateMandateValues',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultValidateOtpPipelineService.buildQuery',
                success: 'validateOtp'
            },
            validateOtp: {
                type: 'function',
                handler: 'DefaultValidateOtpPipelineService.validateOtp',
                success: 'successEnd'
            }
        }
    },
};