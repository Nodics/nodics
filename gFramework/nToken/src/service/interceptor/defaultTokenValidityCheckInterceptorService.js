/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
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