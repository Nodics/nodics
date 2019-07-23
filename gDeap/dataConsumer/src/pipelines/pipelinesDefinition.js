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
                success: 'prepareHeader'
            },
            prepareHeader: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.prepareHeader',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.prepareInputPath',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.flushOutputFolder',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.processData',
                success: 'importFinalizeData'
            },
            importFinalizeData: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.importFinalizeData',
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
    },

    defaultDataConsumerNodeUpHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeUpHandlerService.validateRequest',
                success: 'shutdownResponsibilities'
            },
            shutdownResponsibilities: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeUpHandlerService.shutdownResponsibilities',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeUpHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeUpHandlerService.handleErrorEnd'
            }
        }
    },

    defaultDataConsumerDownHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeDownHandlerService.validateRequest',
                success: 'handleResponsibilities'
            },
            handleResponsibilities: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeDownHandlerService.handleResponsibilities',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeDownHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataConsumerNodeDownHandlerService.handleErrorEnd'
            }
        }
    }
};