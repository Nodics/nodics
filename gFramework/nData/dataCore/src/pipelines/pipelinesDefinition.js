/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    dataFinalizerInitPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.validateRequest',
                success: 'prepareFileType'
            },
            prepareFileType: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.prepareFileType',
                success: 'redirectToFileTypeProcess'
            },
            redirectToFileTypeProcess: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.redirectToFileTypeProcess',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.handleErrorEnd'
            }
        }
    },

    /**
     * This pipeline define target as schema to import data
     */
    schemaDataHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultSchemaDataHandlerService.validateRequest',
                success: 'applyProcessors'
            },
            applyProcessors: {
                type: 'function',
                handler: 'DefaultSchemaDataHandlerService.applyProcessors',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultSchemaDataHandlerService.applyInterceptors',
                success: 'applyValidators'
            },
            applyValidators: {
                type: 'function',
                handler: 'DefaultSchemaDataHandlerService.applyValidators',
                success: 'executeSchemaPipeline'
            },
            executeSchemaPipeline: {
                type: 'function',
                handler: 'DefaultSchemaDataHandlerService.executeSchemaPipeline',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultSchemaDataHandlerService.processData',
                success: 'successEnd'
            }
        }
    },

    /**
     * This Pipeline is used to filter all data, which needs to be finalize
     */
    defaultImportDataFilterPipeline: {
        startNode: "processData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            processData: {
                type: 'function',
                handler: 'DefaultImportDataFilterProcessService.processData',
                success: 'successEnd'
            }
        }
    },

    writeDataIntoFileInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultFileWriterProcessService.validateRequest',
                success: 'generateDataKey'
            },
            generateDataKey: {
                type: 'function',
                handler: 'DefaultFileWriterProcessService.generateDataKey',
                success: 'writeIntoFile'
            },
            writeIntoFile: {
                type: 'function',
                handler: 'DefaultFileWriterProcessService.writeIntoFile',
                success: 'successEnd'
            }
        }
    }
};