/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPipeline/module/nodics
 * @description nPipeline module lifecycle entrypoint used by the Nodics module loader.
 * @layer module
 * @owner nPipeline
 * @override Project modules may contribute pipeline lifecycle behavior in later-loaded modules without changing this entrypoint.
 */
module.exports = {
    /**
     * Initializes nPipeline during module loading.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes nPipeline after module artifacts have loaded.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.loadPipelines().then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};
