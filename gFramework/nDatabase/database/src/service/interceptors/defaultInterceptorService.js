/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/interceptors/DefaultInterceptorService
 * @description Default schema interceptor utilities used by generated CRUD
 * pipelines. These operations provide common mutation and guard behavior that
 * can be referenced from schema interceptor configuration.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override or extend this interceptor service to
 * customize model mutation and test-mode guard behavior while preserving
 * interceptor request/response contracts.
 *
 * @property {Object} request.model Model currently being processed by a CRUD pipeline.
 * @property {Object} NODICS.nTest Runtime nTest execution state.
 */
module.exports = {

    /**
     * Sets the `updated` timestamp on the current request model.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} request.model Model being saved or updated.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves after the timestamp is applied.
     * @sideEffects Mutates `request.model.updated`.
     */
    setUpdatedTimestamp: function (request, response) {
        return new Promise((resolve, reject) => {
            if (request.model) {
                request.model.updated = new Date();
            }
            resolve(true);
        });
    },

    /**
     * Blocks write operations while nTest execution is active.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves when writes are allowed.
     * @throws {CLASSES.NodicsError} Rejects when nTest is running.
     */
    blockNTest: function (request, response) {
        return new Promise((resolve, reject) => {
            if (NODICS.isNTestRunning()) {
                reject(new CLASSES.NodicsError('ERR_TNT_00005', 'Save operation not allowed, while running N-Test cases'));
            } else {
                resolve(true);
            }
        });
    }
};
