/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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