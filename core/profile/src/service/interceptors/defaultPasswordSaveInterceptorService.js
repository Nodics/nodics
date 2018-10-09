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
            if (options.model.password && options.model.password.length < 25) {
                SYSTEM.encryptPassword(options.model).then(model => {
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