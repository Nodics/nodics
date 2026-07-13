/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const utils = require('../utils/utils');
const fileLoader = require('./defaultFilesLoaderService');

/**
 * @module config/service/DefaultScriptsHandlerService
 * @description Loads and executes layered Nodics pre-scripts and post-scripts from
 * active modules. Scripts provide startup extension points without modifying framework code.
 * @layer service
 * @owner nConfig
 * @override Project modules may contribute `/config/prescripts.js` and `/config/postscripts.js`
 * files in later layers to customize startup behavior.
 *
 * @property {Object} NODICS Runtime registry that stores merged pre/post scripts.
 * @property {Object} fileLoader Layered file loader used to merge script files.
 */
module.exports = {

    /**
     * Initializes the scripts handler service.
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
     * Finalizes the scripts handler service.
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
     * Loads layered pre-scripts from active modules.
     *
     * @returns {void}
     * @sideEffects Writes merged pre-scripts to `NODICS`.
     */
    loadPreScript: function () {
        this.LOG.info('Starting Pre Scripts loader process');
        NODICS.setPreScripts(fileLoader.loadFiles('/config/prescripts.js'));
    },

    /**
     * Loads layered post-scripts from active modules.
     *
     * @returns {void}
     * @sideEffects Writes merged post-scripts to `NODICS`.
     */
    loadPostScript: function () {
        this.LOG.info("Starting Post Scripts loader process");
        NODICS.setPostScripts(fileLoader.loadFiles('/config/postscripts.js'));
    },

    /**
     * Executes all loaded pre-script functions.
     *
     * @returns {Promise<boolean>} Resolves after all pre-scripts execute.
     * @throws Rejects when a pre-script fails.
     */
    executePreScripts: function () {
        return new Promise((resolve, reject) => {
            try {
                var preScripts = NODICS.getPreScripts();
                var methods = utils.getAllMethods(preScripts);
                methods.forEach(function (instance) {
                    preScripts[instance]();
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Executes all loaded post-script functions.
     *
     * @returns {Promise<boolean>} Resolves after all post-scripts execute.
     * @throws Rejects when a post-script fails.
     */
    executePostScripts: function () {
        return new Promise((resolve, reject) => {
            try {
                var postScripts = NODICS.getPostScripts();
                var methods = utils.getAllMethods(postScripts);
                methods.forEach(function (instance) {
                    postScripts[instance]();
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
};
