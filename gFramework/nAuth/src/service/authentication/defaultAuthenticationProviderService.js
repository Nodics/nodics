/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');

/**
 * @module gFramework/nAuth/src/service/authentication/defaultAuthenticationProviderService
 * @description Implements nAuth default authentication provider service business behavior and extension logic.
 * @layer service
 * @owner nAuth
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Executes generate auth token behavior.
     *
     * @param {*} options Method input.
     * @returns {*} Method result.
     */
    generateAuthToken: function (options) {
        let token = null;
        try {
            let jwtSignOptions = SERVICE.DefaultAuthSecurityService.getSignOptions(CONFIG, options);
            let payload = SERVICE.DefaultAuthSecurityService.buildPayload(options);
            token = jwt.sign(payload, SERVICE.DefaultAuthSecurityService.getJwtSecret(CONFIG), jwtSignOptions);
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating auth token', 'ERR_AUTH_00000');
        }
        return token;
    }
};
