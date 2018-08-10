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
                handler: 'DefaultRequestHandlerPipelineService.helpRequest',
                success: 'parseHeader',
                failure: 'failureEnd'
            },
            parseHeader: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.parseHeader',
                success: 'parseBody',
                failure: 'failureEnd'
            },

            parseBody: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.parseBody',
                success: 'handleSpecialRequest',
                failure: 'failureEnd'
            },

            handleSpecialRequest: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleSpecialRequest',
                success: 'redirectRequest',
                failure: 'failureEnd'
            },

            redirectRequest: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.redirectRequest',
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
                handler: 'DefaultRequestHandlerPipelineService.handleRequest',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleErrorEnd'
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
                handler: 'DefaultSecuredRequestPipelineService.validateAuthToken',
                success: 'authorizeAuthToken',
                failure: 'failureEnd'
            },
            authorizeAuthToken: {
                type: 'function',
                handler: 'DefaultSecuredRequestPipelineService.authorizeAuthToken',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                handler: 'DefaultNonSecuredRequestPipelineService.validateTenantId',
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
                handler: 'DefaultNonSecuredRequestPipelineService.validateEnterpriseCode',
                success: 'loadEnterpriseCode',
                failure: 'failureEnd'
            },
            loadEnterpriseCode: {
                type: 'function',
                handler: 'DefaultNonSecuredRequestPipelineService.loadEnterpriseCode',
                success: 'validateTenantId',
                failure: 'failureEnd'
            },
            validateTenantId: {
                type: 'function',
                handler: 'DefaultNonSecuredRequestPipelineService.validateTenantId',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    }
};