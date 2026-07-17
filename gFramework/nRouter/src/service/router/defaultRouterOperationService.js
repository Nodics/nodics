/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module router/service/router/DefaultRouterOperationService
 * @description Bridges effective Nodics router definitions to Express operations.
 * It binds HTTP methods and delegates incoming requests to the request handler service.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this service to customize HTTP method binding,
 * request handoff, body parser selection, or route deactivation behavior.
 *
 * @property {Object} CONFIG Runtime configuration registry for body parser handler selection.
 * @property {Object} NODICS Dynamic runtime registry used to read the latest active router definition.
 * @property {Object} SERVICE.DefaultRequestHandlerService Starts the Nodics request pipeline for a route.
 * @property {Object} SERVICE.DefaultRouterService Logger and router lifecycle dependency.
 * @property {Object} routerDef Effective route contract containing URL, method, body parser, module, and router name.
 */
module.exports = {

    serversConfigPool: '',

    /**
     * Initializes the router operation service during service loading.
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
     * Finalizes the router operation service after service loading.
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
     * Refreshes route definition from runtime registry and starts request handling.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} routerDef Route definition captured during Express binding.
     * @returns {void}
     * @sideEffects Delegates active routes to `DefaultRequestHandlerService`; writes standard JSON error for inactive or failed routes.
     */
    bindOperation: function (req, res, routerDef) {
        let requestedRouter = routerDef;
        try {
            routerDef = NODICS.getRouter(routerDef.routerName, routerDef.moduleName);
            if (routerDef.active) {
                SERVICE.DefaultRequestHandlerService.startRequestHandler(req, res, routerDef);
            } else {
                this.sendRouterError(req, res, routerDef, {
                    code: 'ERR_SYS_00000',
                    message: 'This API is no more active currently',
                    metadata: {
                        routerName: routerDef.routerName,
                        moduleName: routerDef.moduleName
                    }
                });
            }
        } catch (error) {
            SERVICE.DefaultRouterService.LOG.error(error);
            this.sendRouterError(req, res, requestedRouter, error);
        }
    },

    /**
     * Sends router binding failures through the configured response handler.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} routerDef Route definition used to resolve response handler.
     * @param {Error|Object|string} error Router binding failure.
     * @returns {void}
     * @sideEffects Writes HTTP status and JSON body through the configured response handler.
     */
    sendRouterError: function (req, res, routerDef, error) {
        let responseHandlers = CONFIG.get('responseHandler') || {};
        let responseHandler = responseHandlers[(routerDef && routerDef.responseHandler) || 'jsonResponseHandler'];
        if (responseHandler && SERVICE[responseHandler] && SERVICE[responseHandler].handleError) {
            SERVICE[responseHandler].handleError(req, res, CLASSES.NodicsError.ensure(error));
        } else {
            res.status(SERVICE.DefaultStatusService.get('ERR_SYS_00000').code);
            res.json(new CLASSES.NodicsError(error).toJson());
        }
    },

    /**
     * Registers an HTTP GET route on the module router.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @returns {void}
     */
    get: function (moduleRouter, routerDef) {
        let _self = this;
        moduleRouter.get(routerDef.url, (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP POST route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    post: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.post(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(routerDef), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP DELETE route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    delete: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.delete(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(routerDef), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP PUT route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    put: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.put(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(routerDef), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP PATCH route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    patch: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.patch(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(routerDef), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    }
};
