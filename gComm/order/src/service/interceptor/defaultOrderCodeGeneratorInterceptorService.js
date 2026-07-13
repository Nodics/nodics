/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module order/service/interceptor/DefaultOrderCodeGeneratorInterceptorService
 * @description Order pre-save interceptor service that derives missing enterprise ownership from the request context.
 * @layer interceptor
 * @owner order
 * @override Project modules may replace this interceptor or change interceptor ordering to customize order ownership and code generation behavior.
 */
module.exports = {
    /**
     * Initializes the order code interceptor during service registration.
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
     * Finalizes order code interceptor startup after module artifacts are registered.
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
     * Populates `request.model.entCode` from the request enterprise code when absent.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model Order model being saved.
     * @param {string} request.entCode Enterprise code attached to the request.
     * @param {Object} response Pipeline or interceptor response context.
     * @returns {Promise<boolean>} Resolves after enterprise ownership is normalized.
     * @sideEffects Mutates `request.model.entCode`.
     */
    generateEntCode: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.entCode || request.model.entCode == '') {
                request.model.entCode = request.entCode
            }
            resolve(true);
        });
    }
};
