/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/service/interceptors/defaultEmployeeGetInterceptorService
 * @description Implements profile default employee get interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves employee recursive information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    getEmployeeRecursive: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options = request.options || {};
            if (request.options.recursive === undefined) {
                request.options.recursive = true;
            }
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
