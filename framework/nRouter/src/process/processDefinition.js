/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    requestHandlerProcess: {
        startNode: "parseHeader",
        hardStop: false, //default value is false
        handleError: 'handleError',
        // define this node, within node definitions, 
        //else will take default 'handleError' one

        nodes: {
            parseHeader: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.parseHeader',
                success: 'parseBody',
                failure: 'failureEnd'
            },

            parseBody: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.parseBody',
                success: 'validateRequest',
                failure: 'failureEnd'
            },

            validateRequest: {
                type: 'process',
                process: 'requestValidatorProcess',
                success: 'handleRequest',
                failure: 'failureEnd'
            },
            handleRequest: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.handleRequest',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.handleSucessEnd'
            },
            failureEnd: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.handleFailureEnd'
            },
            handleError: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.handleError'
            }
        }
    },

    requestValidatorProcess: {
        startNode: "validateTenantId",
        hardStop: true, //default value is false
        handleError: 'handleError',
        // define this node, within node definitions, 
        //else will take default 'handleError' one

        nodes: {
            validateTenantId: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.validateTenantId',
                success: 'validateAuthTocken',
                failure: 'failureEnd'
            },
            validateAuthTocken: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.validateAuthTocken',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.handleSucessEnd'
            },
            failureEnd: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.handleFailureEnd'
            },
            handleError: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.handleError'
            }
        }
    }
};