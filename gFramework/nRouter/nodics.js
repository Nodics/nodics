/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/module/nodics
 * @description nRouter module lifecycle entrypoint that loads router definitions, initializes router services, applies configuration, registers routes, and loads persisted runtime routers.
 * @layer module
 * @owner nRouter
 * @override Project modules may contribute router definitions and persisted router records; this framework entrypoint should stay project-neutral.
 * @property {Object} SERVICE.DefaultRouterService Prepares module router configuration and registers routes.
 * @property {Object} SERVICE.DefaultRouterConfigurationService Owns raw and persisted router configuration.
 */
module.exports = {

    /**
     * Initializes nRouter during module loading.
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
     * Finalizes router startup by loading, configuring, registering, and overlaying route definitions.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves after routers and persisted router overrides are available.
     * @sideEffects Loads router files, writes raw router configuration, registers HTTP routers, and loads persisted router records.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultRouterService.prepareModulesConfiguration().then(() => {
                SERVICE.DefaultRouterConfigurationService.setRawRouters(SERVICE.DefaultFilesLoaderService.loadRouterFiles('/src/router/routers.js'));
            }).then(() => {
                return SERVICE.DefaultRouterInitializerService.initializeRouters();
            }).then(() => {
                return SERVICE.DefaultRouterConfigurationService.configureRouters();
            }).then(() => {
                return SERVICE.DefaultRouterService.registerRouter();
            }).then(() => {
                return SERVICE.DefaultRouterConfigurationService.loadPersistedRouters();
            }).then(() => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};
