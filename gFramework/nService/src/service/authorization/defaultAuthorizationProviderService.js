/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const jwt = require('jsonwebtoken');

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    authorizeToken: function (request) {
        return new Promise((resolve, reject) => {
            jwt.verify(request.authToken, CONFIG.get('jwtSecretKey') || 'nodics', (error, payload) => {
                if (error) {
                    let msg = {
                        success: false,
                        code: 'ERR_SYS_00000',
                    };
                    if (error.message) msg.msg = error.message;
                    if (error.expiredAt) msg.msg = msg.msg + ' at ' + error.expiredAt;
                    if (error.name) msg.name = error.name;
                    reject(msg);
                } else {
                    resolve({
                        success: true,
                        code: 'SUC_SYS_00000',
                        result: payload
                    });
                }
            });
        });
    },

    authorizeAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    }
};