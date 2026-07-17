/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const FRAMEWORK = require('./gFramework');

/**
 * @module nodics
 * @description Registers the nodics module lifecycle hooks and module-level startup behavior.
 * @layer module
 * @owner nodics
 * @override Projects may override lifecycle behavior through later active modules instead of modifying this module directly.
 */
module.exports = {
    /**
    * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
    * defined it that with Promise way
    * @param {*} options 
    */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Executes start behavior.

     *

     * @returns {*} Method result.

     */

    start: function () {
        FRAMEWORK.start();
    },

    /**

     * Executes gen app behavior.

     *

     * @returns {*} Method result.

     */

    genApp: function () {
        FRAMEWORK.genApp();
    },

    /**

     * Executes gen group behavior.

     *

     * @returns {*} Method result.

     */

    genGroup: function () {
        FRAMEWORK.genGroup();
    },

    /**

     * Executes gen module behavior.

     *

     * @returns {*} Method result.

     */

    genModule: function () {
        FRAMEWORK.genModule();
    },

    /**

     * Executes gen react module behavior.

     *

     * @returns {*} Method result.

     */

    genReactModule: function () {
        FRAMEWORK.genReactModule();
    },

    /**

     * Executes gen vue module behavior.

     *

     * @returns {*} Method result.

     */

    genVueModule: function () {
        FRAMEWORK.genVueModule();
    },

    /**

     * Executes clean all behavior.

     *

     * @returns {*} Method result.

     */

    cleanAll: function () {
        return FRAMEWORK.cleanAll();
    },

    /**

     * Builds all data.

     *

     * @returns {*} Method result.

     */

    buildAll: function () {
        return FRAMEWORK.buildAll();
    }
};
