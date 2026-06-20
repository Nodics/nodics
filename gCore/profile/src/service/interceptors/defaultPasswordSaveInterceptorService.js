/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    encryptPassword: function (request, response) {
        return new Promise((resolve, reject) => {
            let password = request.model.password;
            let bcryptHash = typeof password === 'string' && /^\$2[aby]\$\d{2}\$/.test(password);
            if (password && !bcryptHash) {
                UTILS.encryptPassword(password).then(hash => {
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
