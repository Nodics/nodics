/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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