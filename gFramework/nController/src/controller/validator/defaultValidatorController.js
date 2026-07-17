/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nController/src/controller/validator/defaultValidatorController
 * @description Exposes request handlers for nController default validator controller operations.
 * @layer controller
 * @owner nController
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes refresh validators behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    refreshValidators: function (request, callback) {
        if (callback) {
            FACADE.DefaultValidatorFacade.refreshValidators(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultValidatorFacade.refreshValidators(request);
        }
    },
};