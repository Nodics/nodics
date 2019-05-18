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
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        code: '',
                        result: payload
                    });
                }
            });
        });
    },

    prepareAuthorizeAPIKeyURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: '/apikey/authorize',
            requestBody: {},
            isJsonResponse: true,
            header: {
                apiKey: input.apiKey
            }
        });
    },

    authorizeAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });

            // SERVICE.DefaultAuthenticationProviderService.findToken(request.moduleName, request.apiKey).then(success => {
            //     resolve(success);
            // }).catch(error => {
            //     if (request.moduleName === CONFIG.get('profileModuleName')) {
            //         SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey(request).then(success => {
            //             resolve(success);
            //         }).catch(error => {
            //             reject(error);
            //         });
            //     } else {
            //         this.LOG.debug('Authorizing request for apiKey :', request.apiKey);
            //         SERVICE.DefaultModuleService.fetch(this.prepareAuthorizeAPIKeyURL(request), (error, response) => {
            //             if (error) {
            //                 reject(error);
            //             } else if (!response.success) {
            //                 reject({
            //                     success: false,
            //                     code: 'ERR_AUTH_00001'
            //                 });
            //             } else {
            //                 resolve(response);
            //             }
            //         });
            //     }
            // });
        });
    }
};