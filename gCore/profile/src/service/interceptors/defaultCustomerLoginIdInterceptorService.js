/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
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