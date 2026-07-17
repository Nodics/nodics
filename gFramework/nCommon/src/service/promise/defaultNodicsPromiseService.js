/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module common/service/promise/DefaultNodicsPromiseService
 * @description Sequential promise collector for Nodics batch operations. It executes
 * promises one by one, collecting successes and errors into a single response instead
 * of failing fast.
 * @layer service
 * @owner nCommon
 * @override Project modules may override this service to customize batch execution
 * strategy, but should preserve aggregated success/error response shape.
 *
 * @property {Object[]} response.success Collected successful promise results.
 * @property {Object[]} response.errors Collected rejected promise errors.
 */
module.exports = {
    /**
     * Initializes the promise service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the promise service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Executes promises sequentially and aggregates both successes and errors.
     *
     * @param {Promise[]} promises Promise list to execute.
     * @param {Object} [response] Existing response accumulator.
     * @returns {Promise<Object>} Aggregated response containing `success` and/or `errors`.
     */
    all: function (promises, response = {}) {
        return new Promise((resolve, reject) => {
            if (promises && promises.length > 0) {
                let ops = promises.shift();
                Promise.all([ops]).then(success => {
                    if (!response.success) response.success = [];
                    if (success instanceof Array) {
                        response.success = response.success.concat(success);
                    } else {
                        response.success.push(success);
                    }
                    this.all(promises, response).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    if (!response.errors) response.errors = [];
                    if (error instanceof Array) {
                        response.errors = response.errors.concat(error);
                    } else {
                        response.errors.push(error);
                    }
                    this.all(promises, response).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve(response);
            }
        });
    }
};
