/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSystem/src/service/event/defaultConfigurationChangeListenerService
 * @description Implements nSystem default configuration change listener service business behavior and extension logic.
 * @layer service
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes configuration change event behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleConfigurationChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultConfigurationService.handleConfigurationChangeEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle configuration update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle configuration update handler', 'ERR_EVNT_00000'));
        }
    }
};