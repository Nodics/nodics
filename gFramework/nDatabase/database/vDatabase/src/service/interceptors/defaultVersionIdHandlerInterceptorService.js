/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/vDatabase/service/interceptors/DefaultVersionIdHandlerInterceptorService
 * @description Versioned database interceptor that initializes the `versionId`
 * field for generated version-aware schemas.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this interceptor to customize optimistic
 * locking or version initialization while preserving the versioned schema
 * contract.
 *
 * @property {Object} request.model Model being saved or updated.
 */
module.exports = {
    /**
     * Initializes the version id interceptor.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the version id interceptor.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Initializes missing model version id with zero.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} request.model Model being processed.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves after the version id is normalized.
     * @sideEffects Mutates `request.model.versionId` when absent.
     */
    updateVersionId: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model;
            model.versionId = model.versionId || 0;
            resolve(true);
        });
    }
};
