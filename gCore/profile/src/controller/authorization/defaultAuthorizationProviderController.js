/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/controller/authorization/defaultAuthorizationProviderController
 * @description Exposes request handlers for profile default authorization provider controller operations.
 * @layer controller
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes authorize token behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    authorizeToken: function (request, callback) {
        if (request.httpRequest && request.httpRequest.body && request.httpRequest.body.authToken) {
            request.authToken = request.httpRequest.body.authToken;
        }
        if (callback) {
            SERVICE.DefaultAuthorizationProviderService.authorizeToken(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return SERVICE.DefaultAuthorizationProviderService.authorizeToken(request);
        }
    }
};
