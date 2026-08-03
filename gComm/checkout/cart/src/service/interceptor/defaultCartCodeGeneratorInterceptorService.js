/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module cart/service/interceptor/DefaultCartCodeGeneratorInterceptorService
 * @description Cart pre-save interceptor service that creates the persisted cart code when callers provide only an enterprise and reference code.
 * @layer interceptor
 * @owner cart
 * @override Project modules may replace this interceptor or change interceptor ordering to customize cart code generation.
 */
module.exports = {
    /**
     * Initializes the cart code interceptor during service registration.
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
     * Finalizes cart code interceptor startup after module artifacts are registered.
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
     * Populates `request.model.code` when the cart payload has no explicit code.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model Cart model being saved.
     * @param {string} request.model.entCode Enterprise code used as code prefix.
     * @param {string} request.model.refCode Merchant reference code used as code suffix.
     * @param {Object} response Pipeline or interceptor response context.
     * @returns {Promise<boolean>} Resolves after the model is normalized.
     * @sideEffects Mutates `request.model.code`.
     */
    generateCartCode: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.code || request.model.code == '') {
                request.model.code = request.model.entCode.toLowerCaseFirstChar() + '_' + request.model.refCode
            }
            resolve(true);
        });
    }
};
