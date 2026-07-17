/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/facade/authentication/defaultAuthenticationProviderFacade
 * @description Coordinates facade-level delegation for profile default authentication provider facade operations.
 * @layer facade
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes authenticate employee behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateEmployee: function (request) {
        return SERVICE.DefaultAuthenticationProviderService.authenticateEmployee(request);
    },

    /**

     * Executes authenticate customer behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateCustomer: function (request) {
        return SERVICE.DefaultAuthenticationProviderService.authenticateCustomer(request);
    }
};