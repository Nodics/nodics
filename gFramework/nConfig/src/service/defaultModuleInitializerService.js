/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/service/DefaultModuleInitializerService
 * @description Reserved module initializer service for nConfig. It keeps the standard
 * service lifecycle contract available for future module-specific initialization logic.
 * @layer service
 * @owner nConfig
 * @override Project modules may override this service to add module initialization
 * behavior while preserving the standard `init` and `postInit` Promise contract.
 */
module.exports = {

    /**
     * Initializes the module initializer service.
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
     * Finalizes the module initializer service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

};
