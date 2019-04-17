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

    xmlMessageHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'defaultXMLMessageHandlerService.validateRequest',
                success: 'processMessage'
            },
            processMessage: {
                type: 'function',
                handler: 'defaultXMLMessageHandlerService.processMessage',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'defaultXMLMessageHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'defaultXMLMessageHandlerService.handleErrorEnd'
            }
        }
    },
};