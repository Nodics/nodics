/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/interceptors/defaultCustomerLoginIdInterceptorService
 * @description Implements profile default customer login id interceptor service business behavior and extension logic.
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
        let loginIdFormat = CONFIG.get('profile').loginIdFormat;
        let loginIdFormatValidator = CONFIG.get('profile').loginIdFormatValidators[loginIdFormat];
        if (!UTILS.isBlank(loginIdFormatValidator)) {
            return SERVICE[loginIdFormatValidator].validateLoginId(request, response);
        } else {
            return Promise.resolve(true);
        }
    }
};