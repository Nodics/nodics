/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSystem/src/service/event/defaultInterceptorChangeListenerService
 * @description Implements nSystem default interceptor change listener service business behavior and extension logic.
 * @layer service
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes interceptor change event behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleInterceptorChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultInterceptorService.handleInterceptorChangeEvent(request).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle interceptor change event', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable tohandle interceptor change event', 'ERR_EVNT_00000'));
        }
    }
};