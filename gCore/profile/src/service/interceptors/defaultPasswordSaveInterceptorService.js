/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    encryptPassword: function (request, responce) {
        return new Promise((resolve, reject) => {
            let passwordLengthLimit = CONFIG.get('passwordLengthLimit') || 25;
            if (request.model.password && request.model.password.length < passwordLengthLimit) {
                UTILS.encryptPassword(request.model.password).then(hash => {
                    request.model.password = hash;
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};