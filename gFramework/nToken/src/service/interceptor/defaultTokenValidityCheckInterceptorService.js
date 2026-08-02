/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nToken/src/service/interceptor/defaultTokenValidityCheckInterceptorService
 * @description Implements nToken default token validity check interceptor service business behavior and extension logic.
 * @layer service
 * @owner nToken
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Initializes  behavior for the module runtime.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Runs post-initialization behavior after the module runtime is available.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Retrieves valid token information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    fetchValidToken: function (request, response) {
        return new Promise((resolve, reject) => {
            // if (request.options.loadValid) {
            //     // request.query = _.merge(request.query, {
            //     //     expireAt: {
            //     //         "$gte": new Date()
            //     //     },
            //     //     active: true
            //     // });
            // }
            resolve(true);
        });
    }
};