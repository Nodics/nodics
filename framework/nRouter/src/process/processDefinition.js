/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    requestHandlerProcess: {
        startNode: "helpRequest",
        hardStop: true, //default value is false
        handleError: 'handleError',
        // define this node, within node definitions, 
        //else will take default 'handleError' one

        nodes: {
            helpRequest: {
                type: 'function',
                process: 'RequestHandlerProcessService.helpRequest',
                success: 'parseHeader',
                failure: 'failureEnd'
            },
            parseHeader: {
                type: 'function',
                process: 'RequestHandlerProcessService.parseHeader',
                success: 'parseBody',
                failure: 'failureEnd'
            },

            parseBody: {
                type: 'function',
                process: 'RequestHandlerProcessService.parseBody',
                success: 'handleSpecialRequest',
                failure: 'failureEnd'
            },

            handleSpecialRequest: {
                type: 'function',
                process: 'RequestHandlerProcessService.handleSpecialRequest',
                success: 'redirectRequest',
                failure: 'failureEnd'
            },

            redirectRequest: {
                type: 'function',
                process: 'RequestHandlerProcessService.redirectRequest',
                success: {
                    securedRequest: 'handleSecuredRequest',
                    nonSecureRequest: 'handleNonSecuredRequest'
                },
                failure: 'handleNonSecuredRequest'
            },
            handleSecuredRequest: {
                type: 'process',
                process: 'handleSecuredRequestProcess',
                success: 'handleRequest',
                failure: 'failureEnd'
            },

            handleNonSecuredRequest: {
                type: 'process',
                process: 'handleNonSecuredRequestProcess',
                success: 'handleRequest',
                failure: 'failureEnd'
            },
            handleRequest: {
                type: 'function',
                process: 'RequestHandlerProcessService.handleRequest',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                process: 'RequestHandlerProcessService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                process: 'RequestHandlerProcessService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                process: 'RequestHandlerProcessService.handleErrorEnd'
            }
        }
    },

    handleSecuredRequestProcess: {
        startNode: "validateAuthToken",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateAuthToken: {
                type: 'function',
                process: 'SecuredRequestProcessService.validateAuthToken',
                success: 'authorizeAuthToken',
                failure: 'failureEnd'
            },
            authorizeAuthToken: {
                type: 'function',
                process: 'SecuredRequestProcessService.authorizeAuthToken',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                process: 'NonSecuredRequestProcessService.validateTenantId',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    },

    handleNonSecuredRequestProcess: {
        startNode: "validateEnterpriseCode",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateEnterpriseCode: {
                type: 'function',
                process: 'NonSecuredRequestProcessService.validateEnterpriseCode',
                success: 'loadEnterpriseCode',
                failure: 'failureEnd'
            },
            loadEnterpriseCode: {
                type: 'function',
                process: 'NonSecuredRequestProcessService.loadEnterpriseCode',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                process: 'NonSecuredRequestProcessService.validateTenantId',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    }
};