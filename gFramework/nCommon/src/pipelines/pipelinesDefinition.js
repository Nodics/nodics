/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    interceptorUpdatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.validateRequest',
                success: 'loadInterceptor'
            },
            loadInterceptor: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.loadInterceptor',
                success: 'mergeExisting'
            },
            mergeExisting: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.mergeExisting',
                success: 'publishCleanup'
            },
            publishCleanup: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.publishCleanup',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.handleErrorEnd'
            }
        }
    }
};