/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nController/src/controller/interceptor/defaultInterceptorController
 * @description Exposes request handlers for nController default interceptor controller operations.
 * @layer controller
 * @owner nController
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes refresh interceptors behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    refreshInterceptors: function (request, callback) {
        if (callback) {
            FACADE.DefaultInterceptorFacade.refreshInterceptors(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultInterceptorFacade.refreshInterceptors(request);
        }
    },
};