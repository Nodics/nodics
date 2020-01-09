/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validatorUpdatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultValidatorUpdatePipelineService.validateRequest',
                success: 'loadInterceptor'
            },
            loadValidator: {
                type: 'function',
                handler: 'DefaultValidatorUpdatePipelineService.loadValidator',
                success: 'mergeExisting'
            },
            mergeExisting: {
                type: 'function',
                handler: 'DefaultValidatorUpdatePipelineService.mergeExisting',
                success: 'publishCleanup'
            },
            publishCleanup: {
                type: 'function',
                handler: 'DefaultValidatorUpdatePipelineService.publishCleanup',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultValidatorUpdatePipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultValidatorUpdatePipelineService.handleErrorEnd'
            }
        }
    }
};