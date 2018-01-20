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
        hardStop: true, //default value is false
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
                success: 'handleSpecialRequest',
                failure: 'failureEnd'
            },

            handleSpecialRequest: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.handleSpecialRequest',
                success: 'redirectRequest',
                failure: 'failureEnd'
            },

            redirectRequest: {
                type: 'function',
                process: 'SERVICE.RequestHandlerService.redirectRequest',
                success: 'handleSecuredRequest',
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
                process: 'SERVICE.RequestHandlerService.handleErrorEnd'
            }
        }
    },

    handleSecuredRequestProcess: {
        startNode: "validateEnterpriseCode",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateEnterpriseCode: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.validateEnterpriseCode',
                success: 'loadEnterpriseCode',
                failure: 'failureEnd'
            },
            loadEnterpriseCode: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.loadEnterpriseCode',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.validateTenantId',
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
                process: 'SERVICE.RequestValidatorService.validateEnterpriseCode',
                success: 'loadEnterpriseCode',
                failure: 'failureEnd'
            },
            loadEnterpriseCode: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.loadEnterpriseCode',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                process: 'SERVICE.RequestValidatorService.validateTenantId',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    }
};