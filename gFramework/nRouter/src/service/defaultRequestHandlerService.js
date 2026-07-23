/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module router/service/DefaultRequestHandlerService
 * @description Entry point from Express route binding into the Nodics request pipeline.
 * It creates the internal request context, starts `requestHandlerPipeline`, and delegates
 * the final response to the configured response handler.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this service to enrich request context, add
 * correlation metadata, or change response handler selection.
 *
 * @property {Object} CONFIG Runtime configuration registry for response handler lookup.
 * @property {Object} SERVICE.DefaultPipelineService Executes the request handler pipeline.
 * @property {Object} routerDef Effective router definition selected by `DefaultRouterOperationService`.
 */
module.exports = {
    /**
     * Initializes the request handler service during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the request handler service after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Creates Nodics request context and starts the configured request handler pipeline.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} routerDef Effective Nodics router definition.
     * @returns {void}
     * @sideEffects Generates request id, copies HTTP request metadata, starts pipeline, and writes HTTP response through handler.
     * @throws Pipeline errors are handled by the configured response handler.
     */
    startRequestHandler: function (request, response, routerDef) {
        let input = {
            requestId: UTILS.generateUniqueCode(),
            parentRequestId: request.get('requestId'),
            router: routerDef,
            httpRequest: request,
            httpResponse: response,
            protocal: request.protocol,
            host: request.hostname,
            originalUrl: request.originalUrl,
            secured: routerDef.secured,
            moduleName: routerDef.moduleName,
            special: (routerDef.controller) ? false : true,
            method: request.method,
            body: request.body || {}
        };
        if (response && typeof response.setHeader === 'function') {
            response.setHeader('X-Request-Id', input.requestId);
            response.setHeader('X-Correlation-Id', input.parentRequestId || input.requestId);
        }
        let responseHandler = CONFIG.get('responseHandler')[routerDef.responseHandler || 'jsonResponseHandler'];
        SERVICE.DefaultPipelineService.start('requestHandlerPipeline', input, {}).then(success => {
            SERVICE[responseHandler].handleSuccess(request, response, success);
        }).catch(error => {
            SERVICE[responseHandler].handleError(request, response, error);
        });
    }
};
