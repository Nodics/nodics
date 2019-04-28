/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    processInternalDataPushEventPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.validateRequest',
                success: 'handleValueProviders'
            },
            handleValueProviders: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.handleValueProviders',
                success: 'applyProcessors'
            },
            applyProcessors: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.applyProcessors',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.applyInterceptors',
                success: 'executeIndexerPipeline'
            },
            executeIndexerPipeline: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.executeIndexerPipeline',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.processData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.handleErrorEnd'
            }
        }
    }
};