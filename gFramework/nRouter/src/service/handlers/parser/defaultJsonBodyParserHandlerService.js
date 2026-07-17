/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const bodyParser = require('body-parser');

/**
 * @module router/service/handlers/parser/DefaultJsonBodyParserHandlerService
 * @description Body parser handler for JSON API routes. It supplies Express middleware
 * for URL-encoded and JSON payload parsing when a router uses the default JSON parser.
 * @layer service
 * @owner nRouter
 * @override Project modules may override or replace this handler through router
 * configuration to apply product-specific payload limits or parsing policies.
 *
 * @property {Object} bodyParser Express body-parser dependency.
 * @property {Object} SERVICE.DefaultHttpHardeningService Supplies configured body parser limits.
 */
module.exports = {

    /**
     * Initializes the JSON body parser handler during service loading.
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
     * Finalizes the JSON body parser handler after service loading.
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
     * Returns Express middleware for URL-encoded and JSON request bodies.
     *
     * @param {Object} router Effective router definition.
     * @returns {Array<Function>} Body parser middleware chain.
     */
    getBodyParser: function (router) {
        let urlencodedOptions = SERVICE.DefaultHttpHardeningService
            ? SERVICE.DefaultHttpHardeningService.getUrlencodedParserOptions()
            : { extended: true };
        let jsonOptions = SERVICE.DefaultHttpHardeningService
            ? SERVICE.DefaultHttpHardeningService.getJsonParserOptions()
            : {};
        return [
            bodyParser.urlencoded(urlencodedOptions),
            bodyParser.json(jsonOptions)
        ];
    }
};
