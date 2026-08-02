/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nValidator/src/pipelines/pipelines
 * @description Defines nValidator pipeline wiring and execution contracts.
 * @layer pipelines
 * @owner nValidator
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    validatorUpdatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultValidatorUpdatedPipelineService.validateRequest',
                success: 'loadInterceptor'
            },
            loadValidator: {
                type: 'function',
                handler: 'DefaultValidatorUpdatedPipelineService.loadValidator',
                success: 'mergeExisting'
            },
            mergeExisting: {
                type: 'function',
                handler: 'DefaultValidatorUpdatedPipelineService.mergeExisting',
                success: 'publishCleanup'
            },
            publishCleanup: {
                type: 'function',
                handler: 'DefaultValidatorUpdatedPipelineService.publishCleanup',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultValidatorUpdatedPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultValidatorUpdatedPipelineService.handleErrorEnd'
            }
        }
    }
};