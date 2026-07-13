/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/module/nodics
 * @description CMS module lifecycle entrypoint used by the Nodics module loader.
 * @layer module
 * @owner cms
 * @override Project modules may contribute their own CMS lifecycle behavior in later-loaded modules without changing this module entrypoint.
 */
module.exports = {
    /**
     * Initializes the CMS module during module loading.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when module initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the CMS module after module artifacts have loaded.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when module post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
};
