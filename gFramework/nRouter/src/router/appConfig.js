/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const bodyParser = require('body-parser');

/**
 * @module router/router/AppConfig
 * @description Default Express application configuration hooks for nRouter. These hooks
 * are executed by `DefaultRouterConfigurationService` against the consolidated default
 * app or module-specific apps based on the selected runtime topology.
 * @layer router
 * @owner nRouter
 * @override Project modules may provide later-layer app configuration hooks to add
 * sessions, logging, cache, headers, error routes, parser policies, or extra middleware.
 *
 * @property {Object} default Default app configuration hook set.
 * @property {Object} bodyParser Express body-parser dependency used by default body parsing hook.
 */
module.exports = {
    default: {
        /**
         * Applies early app properties or middleware before other router app hooks.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may add app-level properties or early middleware here.
         */
        initProperties: function (app) {
            /* app.use(function(req, res, next) {
                 next('Done initProperties');
             });*/
        },

        /**
         * Applies session middleware.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may enable session middleware when needed.
         */
        initSession: function (app) {

        },

        /**
         * Applies request logging middleware.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may attach product-specific request logging here.
         */
        initLogger: function (app) {

        },

        /**
         * Applies cache middleware.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may attach cache middleware when route-level cache requires it.
         */
        initCache: function (app) {

        },

        /**
         * Applies default body parser middleware.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @sideEffects Adds URL-encoded body parser middleware to the Express app.
         * @override Project modules may replace parser policy or payload limits here.
         */
        initBodyParser: function (app) {
            app.use(bodyParser.urlencoded({ extended: true }));
            //app.use(bodyParser.json());
            // app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
            //app.use(bodyParser.raw());
        },

        /**
         * Applies common HTTP header middleware.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may add CORS, security, tracing, or tenant headers here.
         */
        initHeaders: function (app) {

        },

        /**
         * Applies app-level error routes or middleware.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may add product-specific error routes or fallback handlers here.
         */
        initErrorRoutes: function (app) {
            /*app.use(function(param, req, res, next) {
                next('This is custom value');
            });*/
        },

        /**
         * Applies final extra middleware after standard app configuration hooks.
         *
         * @param {Object} app Express app instance.
         * @returns {void}
         * @override Project modules may add final middleware or integration hooks here.
         */
        initExtras: function (app) {

        }
    }
};
