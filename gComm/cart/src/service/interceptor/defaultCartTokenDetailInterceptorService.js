/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cart/service/interceptor/defaultCartTokenDetailInterceptorService
 * @description Cart post-load interceptor that expands a stored token value into token reference details and expiry state.
 * @layer interceptor
 * @owner cart
 * @override Project modules may replace this interceptor to enrich carts from a different token store or token policy.
 * @property {Object} SERVICE.DefaultTokenService Loads token records by persisted token value.
 */
module.exports = {
    /**
     * Initializes the cart token detail interceptor during service registration.
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
     * Finalizes cart token detail interceptor startup after module artifacts are registered.
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
     * Loads token details for the first cart result and marks whether the token is expired.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.tenant Active tenant used for token lookup.
     * @param {Object} response Schema interceptor response containing cart query results.
     * @returns {Promise<boolean>} Resolves after token details are attached or when the cart has no token.
     * @sideEffects Mutates the first cart result with `tokenRef` and `tokenRef.isExpired`.
     * @throws Rejects with token errors when the stored token cannot be resolved.
     */
    loadCartToken: function (request, response) {
        return new Promise((resolve, reject) => {
            let cartModel = response.success.result[0];
            if (cartModel.token) {
                SERVICE.DefaultTokenService.get({
                    tenant: request.tenant,
                    query: {
                        value: cartModel.token
                    }
                }).then(result => {
                    if (result.count === 1 && result.result && result.result.length === 1) {
                        cartModel.tokenRef = result.result[0];
                        cartModel.tokenRef.isExpired = false;
                        let tokenModel = result.result[0];
                        let currentTime = new Date;
                        if (tokenModel.expireAt.getTime() < currentTime.getTime()) {
                            cartModel.tokenRef.isExpired = true
                        }
                        resolve(true);
                    } else {
                        reject(new CLASSES.NodicsError('ERR_TKN_00002'));
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error));
                });
            } else {
                resolve(true);
            }
        });
    }
};
