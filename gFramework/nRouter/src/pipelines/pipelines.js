/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module router/pipelines/RequestPipelines
 * @description Pipeline definitions for Nodics API request execution. These definitions
 * compose the request handler pipeline, secured authorization pipeline, and non-secured
 * enterprise/tenant resolution pipeline used by `DefaultRequestHandlerService`.
 * @layer pipeline
 * @owner nRouter
 * @override Project modules may override these definitions in later module layers to
 * add validation, tracing, rate limiting, custom authorization, or request transformation.
 *
 * @property {Object} requestHandlerPipeline Main API request pipeline.
 * @property {string} requestHandlerPipeline.startNode First node for the main request pipeline.
 * @property {Object} requestHandlerPipeline.nodes Ordered node graph for help, headers, body, security branch, cache, and controller dispatch.
 * @property {Object} handleSecuredRequestPipeline Secured request branch for API-key or bearer-token authorization.
 * @property {Object} handleNonSecuredRequestPipeline Non-secured request branch for enterprise code and tenant resolution.
 * @property {string} node.type Pipeline node type, such as `function` or `process`.
 * @property {string} node.handler Service method or nested pipeline invoked by the node.
 * @property {string|Object} node.success Next node or branch map after successful execution.
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
                success: 'parseHeader'
            },
            parseHeader: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.parseHeader',
                success: 'parseBody'
            },

            parseBody: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.parseBody',
                success: 'handleSpecialRequest'
            },

            handleSpecialRequest: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleSpecialRequest',
                success: 'redirectRequest'
            },

            redirectRequest: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.redirectRequest',
                success: {
                    securedRequest: 'handleSecuredRequest',
                    nonSecureRequest: 'handleNonSecuredRequest'
                }
            },
            handleSecuredRequest: {
                type: 'process',
                handler: 'handleSecuredRequestPipeline',
                success: 'lookupCache'
            },

            handleNonSecuredRequest: {
                type: 'process',
                handler: 'handleNonSecuredRequestPipeline',
                success: 'lookupCache'
            },

            lookupCache: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.lookupCache',
                success: 'handleRequest'
            },

            handleRequest: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleRequest',
                success: 'successEnd'
            }
        }
    },

    handleSecuredRequestPipeline: {
        startNode: "validateSecuredRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateSecuredRequest: {
                type: 'function',
                handler: 'DefaultSecuredRequestPipelineService.validateSecuredRequest',
                success: 'authorizeAPIKey'
            },
            authorizeAPIKey: {
                type: 'function',
                handler: 'DefaultSecuredRequestPipelineService.authorizeAPIKey',
                success: 'authorizeAuthToken'
            },
            authorizeAuthToken: {
                type: 'function',
                handler: 'DefaultSecuredRequestPipelineService.authorizeAuthToken',
                success: 'validateRequestData'
            },
            validateRequestData: {
                type: 'function',
                handler: 'DefaultSecuredRequestPipelineService.validateRequestData',
                success: 'checkAccess'
            },
            checkAccess: {
                type: 'function',
                handler: 'DefaultSecuredRequestPipelineService.checkAccess',
                success: 'successEnd'
            }
        }
    },

    handleNonSecuredRequestPipeline: {
        startNode: "validateEntCode",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateEntCode: {
                type: 'function',
                handler: 'DefaultNonSecuredRequestPipelineService.validateEntCode',
                success: 'loadEnterprise'
            },
            loadEnterprise: {
                type: 'function',
                handler: 'DefaultNonSecuredRequestPipelineService.loadEnterprise',
                success: 'validateTenantId'
            },
            validateTenantId: {
                type: 'function',
                handler: 'DefaultNonSecuredRequestPipelineService.validateTenantId',
                success: 'successEnd'
            }
        }
    }
};
