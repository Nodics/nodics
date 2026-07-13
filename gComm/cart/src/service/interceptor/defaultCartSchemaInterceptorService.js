/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

const _ = require('lodash');

/**
 * @module cart/service/interceptor/DefaultCartSchemaInterceptorService
 * @description Cart pre-save interceptor service that derives missing enterprise ownership from authenticated request metadata.
 * @layer interceptor
 * @owner cart
 * @override Project modules may replace this interceptor when cart enterprise ownership comes from a different request contract.
 */
module.exports = {
    /**
     * Initializes the cart schema interceptor during service registration.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when interceptor initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Finalizes cart schema interceptor startup after module artifacts are registered.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Populates `request.model.entCode` from authenticated enterprise data when absent.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model Cart model being saved.
     * @param {Object} request.authData Authenticated user and enterprise metadata.
     * @param {Object} response Pipeline or interceptor response context.
     * @returns {Promise<boolean>} Resolves after enterprise ownership is normalized.
     * @sideEffects Mutates `request.model.entCode`.
     */
    generateEntCode: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.entCode || request.model.entCode == '') {
                request.model.entCode = request.authData.entCode
            }
            resolve(true);
        });
    }
};
