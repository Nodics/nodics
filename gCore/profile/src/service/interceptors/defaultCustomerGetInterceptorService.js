/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/interceptors/defaultCustomerGetInterceptorService
 * @description Implements profile default customer get interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves customer recursive information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    getCustomerRecursive: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },

    /**

     * Retrieves all user group codes information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    getAllUserGroupCodes: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.success.result && response.success.result.length > 0) {
                response.success.result.forEach(itemModel => {
                    itemModel.userGroupCodes = UTILS.getUserGroupCodes(itemModel.userGroups);
                    itemModel.userGroupPermissions = UTILS.getUserGroupPermissions(itemModel.userGroups);
                });
            }
            resolve(true);
        });
    }
};
