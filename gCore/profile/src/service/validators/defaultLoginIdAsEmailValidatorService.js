/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const emailValidator = require("email-validator");

module.exports = {
    validateLoginId: function (request, response) {
        return new Promise((resolve, reject) => {
            if (emailValidator.validate(request.model.loginId)) {
                resolve(true);
            } else {
                reject('Invalid Login id: ' + request.model.loginId);
            }

        });
    }
};