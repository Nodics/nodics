/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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