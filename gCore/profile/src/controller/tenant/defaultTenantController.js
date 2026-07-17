/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/controller/tenant/defaultTenantController
 * @description Exposes request handlers for profile default tenant controller operations.
 * @layer controller
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Retrieves tenants information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    getTenants: function (request, callback) {
        if (callback) {
            FACADE.DefaultTenantFacade.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultTenantFacade.get(request);
        }
    }
};