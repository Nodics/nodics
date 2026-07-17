/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/interceptors/defaultCustomerUpdateInterceptorService
 * @description Implements profile default customer update interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Executes customer pre update behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    customerPreUpdate: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            resolve(true);
        });
    },
    /**
     * Executes customer pre remove behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    customerPreRemove: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            resolve(true);
        });
    }
};