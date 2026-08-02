/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nEms/emsClient/src/facade/defaultEmsClientFacade
 * @description Coordinates facade-level delegation for nEms default ems client facade operations.
 * @layer facade
 * @owner nEms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes  behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    publish: function (request) {
        return SERVICE.DefaultEmsClientService.publish(request);
    },

    /**

     * Updates consumers information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    registerConsumers: function (request) {
        return SERVICE.DefaultEmsClientService.registerConsumers(request);
    },

    /**

     * Updates publishers information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    registerPublishers: function (request) {
        return SERVICE.DefaultEmsClientService.registerPublishers(request);
    },

    /**

     * Executes close consumers behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    closeConsumers: function (request) {
        return SERVICE.DefaultEmsClientService.closeConsumers(request);
    },

    /**

     * Executes close publishers behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    closePublishers: function (request) {
        return SERVICE.DefaultEmsClientService.closePublishers(request);
    }
};