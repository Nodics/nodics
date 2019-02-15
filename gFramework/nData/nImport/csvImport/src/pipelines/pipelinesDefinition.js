/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    csvFileDataReaderPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.validateRequest',
                success: 'readFilesData'
            },
            readFilesData: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.readFilesData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.handleErrorEnd'
            }
        }
    },

    csvFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.processDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.handleErrorEnd'
            }
        }
    },

    JsonDataHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.executeDataProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.handleErrorEnd'
            }
        }
    },
};