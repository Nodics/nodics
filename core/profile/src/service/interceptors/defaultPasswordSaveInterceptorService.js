/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    encryptPassword: function (model, options) {
        return new Promise((resolve, reject) => {
            SYSTEM.encryptPassword(model).then(model => {
                resolve(model);
            }).catch(error => {
                next(error);
            });
        });
    },

    handlePostSavePassword: function (model, options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
};