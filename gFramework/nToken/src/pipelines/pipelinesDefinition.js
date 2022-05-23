/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    generateTokenPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.validateMandateValues',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.buildQuery',
                success: 'checkExistingToken'
            },
            checkExistingToken: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.checkExistingToken',
                success: 'generateNewToken'
            },
            generateNewToken: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.generateNewToken',
                success: 'fatchNewToken'
            },
            fatchNewToken: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.fatchNewToken',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.handleErrorEnd'
            }
        }
    },
    validateTokenPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultValidateTokenPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultValidateTokenPipelineService.validateMandateValues',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultValidateTokenPipelineService.buildQuery',
                success: 'validateToken'
            },
            validateToken: {
                type: 'function',
                handler: 'DefaultValidateTokenPipelineService.validateToken',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultValidateTokenPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultValidateTokenPipelineService.handleErrorEnd'
            }
        }
    },
};