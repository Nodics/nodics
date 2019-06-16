/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    processConsumedMessagePipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultMessageProcessService.validateRequest',
                success: 'processMessage'
            },
            processMessage: {
                type: 'function',
                handler: 'DefaultMessageProcessService.processMessage',
                success: 'publishEvent'
            },
            publishEvent: {
                type: 'function',
                handler: 'DefaultMessageProcessService.publishEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultMessageProcessService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultMessageProcessService.handleErrorEnd'
            }
        }
    },

    jsonMessageHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultJSONMessageHandlerService.validateRequest',
                success: 'processMessage'
            },
            processMessage: {
                type: 'function',
                handler: 'DefaultJSONMessageHandlerService.processMessage',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultJSONMessageHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultJSONMessageHandlerService.handleErrorEnd'
            }
        }
    },

    xmlMessageHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultXMLMessageHandlerService.validateRequest',
                success: 'processMessage'
            },
            processMessage: {
                type: 'function',
                handler: 'DefaultXMLMessageHandlerService.processMessage',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultXMLMessageHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultXMLMessageHandlerService.handleErrorEnd'
            }
        }
    },
};