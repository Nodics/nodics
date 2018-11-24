/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    encryptPassword: function (options) {
        return new Promise((resolve, reject) => {
            let passwordLengthLimit = CONFIG.get('passwordLengthLimit') || 25;
            if (options.model.password && options.model.password.length < passwordLengthLimit) {
                SYSTEM.encryptPassword(options.model.password).then(hash => {
                    options.model.password = hash;
                    resolve(true);
                }).catch(error => {
                    next(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};