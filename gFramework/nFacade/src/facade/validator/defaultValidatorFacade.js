/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.
 */

/**
 * @module gFramework/nFacade/src/facade/validator/defaultValidatorFacade
 * @description Coordinates facade-level delegation for nFacade default validator facade operations.
 * @layer facade
 * @owner nFacade
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes refresh validators behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    refreshValidators: function (request) {
        return SERVICE.DefaultValidatorService.refreshValidators(request);
    },
};