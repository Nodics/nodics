/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const emailValidator = require("email-validator");

/**
 * @module gCore/profile/src/service/validators/defaultLoginIdAsEmailValidatorService
 * @description Implements profile default login id as email validator service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Validates login id rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    validateLoginId: function (request, response) {
        return new Promise((resolve, reject) => {
            if (request.model.loginId === 'guest') {
                resolve(true);
            } else if (emailValidator.validate(request.model.loginId)) {
                resolve(true);
            } else {
                reject('Invalid Login id: ' + request.model.loginId);
            }

        });
    }
};