/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
