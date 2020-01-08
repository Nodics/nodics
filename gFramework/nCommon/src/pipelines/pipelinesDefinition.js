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
                handler: 'DefaultInterceptorUpdatePipelineService.validateRequest',
                success: 'loadInterceptor'
            },
            loadInterceptor: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatePipelineService.loadInterceptor',
                success: 'mergeExisting'
            },
            mergeExisting: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatePipelineService.mergeExisting',
                success: 'publishCleanup'
            },
            publishCleanup: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatePipelineService.publishCleanup',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatePipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatePipelineService.handleErrorEnd'
            }
        }
    }
};