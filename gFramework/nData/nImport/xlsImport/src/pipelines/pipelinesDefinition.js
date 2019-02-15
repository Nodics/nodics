/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    excelFileDataReaderPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.validateRequest',
                success: 'readFilesData'
            },
            readFilesData: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.readFilesData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.handleErrorEnd'
            }
        }
    },

    excelFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.processDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.handleErrorEnd'
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
                handler: 'DefaultExcelDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.executeDataProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.handleErrorEnd'
            }
        }
    },
};