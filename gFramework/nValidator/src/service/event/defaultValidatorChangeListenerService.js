/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nValidator/src/service/event/defaultValidatorChangeListenerService
 * @description Implements nValidator default validator change listener service business behavior and extension logic.
 * @layer service
 * @owner nValidator
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes validator change event behavior.

     *

     * @param {*} event Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleValidatorChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultValidatorService.handleValidatorChangeEvent(request).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle validator change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle validator change', 'ERR_EVNT_00000'));
        }
    }
};