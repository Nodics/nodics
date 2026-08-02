/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/controller/authentication/defaultInternalAuthenticationProviderController
 * @description Exposes request handlers for profile default internal authentication provider controller operations.
 * @layer controller
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves internal auth token information.
     *
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    getInternalAuthToken: function (request, callback) {
        if (request.httpRequest.params.tntCode) {
            request.tenant = request.httpRequest.params.tntCode;
        }
        if (callback) {
            FACADE.DefaultInternalAuthenticationProviderFacade.getInternalAuthToken(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultInternalAuthenticationProviderFacade.getInternalAuthToken(request);
        }
    }
};