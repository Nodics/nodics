/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    requestHandlerPipeline: {
        startNode: "helpRequest",
        hardStop: true, //default value is false
        handleError: 'handleError',
        // define this node, within node definitions, 
        //else will take default 'handleError' one

        nodes: {
            helpRequest: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.helpRequest',
                success: 'parseHeader',
                failure: 'failureEnd'
            },
            parseHeader: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.parseHeader',
                success: 'parseBody',
                failure: 'failureEnd'
            },

            parseBody: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.parseBody',
                success: 'handleSpecialRequest',
                failure: 'failureEnd'
            },

            handleSpecialRequest: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.handleSpecialRequest',
                success: 'redirectRequest',
                failure: 'failureEnd'
            },

            redirectRequest: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.redirectRequest',
                success: {
                    securedRequest: 'handleSecuredRequest',
                    nonSecureRequest: 'handleNonSecuredRequest'
                },
                failure: 'handleNonSecuredRequest'
            },
            handleSecuredRequest: {
                type: 'process',
                handler: 'handleSecuredRequestPipeline',
                success: 'handleRequest',
                failure: 'failureEnd'
            },

            handleNonSecuredRequest: {
                type: 'process',
                handler: 'handleNonSecuredRequestPipeline',
                success: 'handleRequest',
                failure: 'failureEnd'
            },
            handleRequest: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.handleRequest',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                handler: 'RequestHandlerPipelineService.handleErrorEnd'
            }
        }
    },

    handleSecuredRequestPipeline: {
        startNode: "validateAuthToken",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateAuthToken: {
                type: 'function',
                handler: 'SecuredRequestPipelineService.validateAuthToken',
                success: 'authorizeAuthToken',
                failure: 'failureEnd'
            },
            authorizeAuthToken: {
                type: 'function',
                handler: 'SecuredRequestPipelineService.authorizeAuthToken',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                handler: 'NonSecuredRequestPipelineService.validateTenantId',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    },

    handleNonSecuredRequestPipeline: {
        startNode: "validateEnterpriseCode",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateEnterpriseCode: {
                type: 'function',
                handler: 'NonSecuredRequestPipelineService.validateEnterpriseCode',
                success: 'loadEnterpriseCode',
                failure: 'failureEnd'
            },
            loadEnterpriseCode: {
                type: 'function',
                handler: 'NonSecuredRequestPipelineService.loadEnterpriseCode',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                handler: 'NonSecuredRequestPipelineService.validateTenantId',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    }
};