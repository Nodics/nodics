/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/facade/router/defaultRouterConfigurationFacade
 * @description Coordinates facade-level delegation for nDynamo default router configuration facade operations.
 * @layer facade
 * @owner nDynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Updates router information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    addRouter: function (request) {
        return SERVICE.DefaultRouterConfigurationService.addRouter(request);
    },

    /**

     * Updates router information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    updateRouter: function (request) {
        return SERVICE.DefaultRouterConfigurationService.updateRouter(request);
    },

    /**

     * Removes or clears router information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    removeRouter: function (request) {
        return SERVICE.DefaultRouterConfigurationService.removeRouter(request);
    },
};