/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/facade/authentication/defaultInternalAuthenticationProviderFacade
 * @description Coordinates facade-level delegation for profile default internal authentication provider facade operations.
 * @layer facade
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Retrieves internal auth token information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    getInternalAuthToken: function (request) {
        return SERVICE.DefaultInternalAuthenticationProviderService.getInternalAuthToken(request);
    }

};