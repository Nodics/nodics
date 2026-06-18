/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCommon/nodics
 * @description nCommon lifecycle contribution that loads effective interceptor definitions after service initialization, making layered dynamic behavior available to downstream modules.
 * @layer module
 * @owner nCommon
 * @override Later modules may extend lifecycle behavior through their own module hooks or override the interceptor services while preserving ordered definition loading and error propagation.
 */
module.exports = {
    /** @param {Object} options Lifecycle options. @returns {Promise<boolean>} Resolved initialization hook. */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Loads and prepares interceptor definitions contributed by active modules.
     * @param {Object} options Lifecycle options.
     * @returns {Promise<boolean>} Resolves after interceptor definitions are loaded.
     * @sideEffects Replaces the effective interceptor registry used at runtime.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Collecting database interceptors definitions');
            try {
                SERVICE.DefaultInterceptorService.loadRawInterceptors(SERVICE.DefaultFilesLoaderService.loadFiles('/src/interceptors/interceptors.js'));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
};
