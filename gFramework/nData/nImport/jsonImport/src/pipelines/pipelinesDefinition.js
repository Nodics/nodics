/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    jsonFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.processDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.handleErrorEnd'
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
                handler: 'DefaultJsonDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.executeDataProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.handleErrorEnd'
            }
        }
    },
};