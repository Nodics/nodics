/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nToken/src/pipelines/pipelines
 * @description Defines nToken pipeline wiring and execution contracts.
 * @layer pipelines
 * @owner nToken
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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
                success: 'successEnd'
            },
            fatchNewToken: {
                type: 'function',
                handler: 'DefaultGenerateTokenPipelineService.fatchNewToken',
                success: 'successEnd'
            },
            // successEnd: {
            //     type: 'function',
            //     handler: 'DefaultGenerateTokenPipelineService.handleSucessEnd'
            // },
            // handleError: {
            //     type: 'function',
            //     handler: 'DefaultGenerateTokenPipelineService.handleErrorEnd'
            // }
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