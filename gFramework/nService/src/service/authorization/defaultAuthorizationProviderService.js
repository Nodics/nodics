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
                    reject(new NodicsError({
                        code: 'ERR_AUTH_00001',
                        name: error.name,
                        message: error.message + ' at: ' + error.expiredAt,
                        stack: error.stack
                    }));
                } else {
                    resolve({
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