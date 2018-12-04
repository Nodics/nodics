/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    prepareAuthorizeTokenURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: '/token/authorize',
            requestBody: {},
            isJsonResponse: true,
            header: {
                authToken: input.authToken
            }
        });
    },

    authorizeToken: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultAuthenticationProviderService.findToken(request.moduleName, request.authToken).then(success => {
                resolve(success);
            }).catch(error => {
                if (request.moduleName === CONFIG.get('profileModuleName')) {
                    reject({
                        success: false,
                        code: 'ERR_AUTH_00001'
                    });
                    /*SERVICE.DefaultAuthenticationProviderService.reAuthenticate(request).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });*/
                } else {
                    this.LOG.debug('Authorizing request for token :', request.authToken);
                    SERVICE.DefaultModuleService.fetch(this.prepareAuthorizeTokenURL(request), (error, response) => {
                        if (error) {
                            reject(error);
                        } else if (!response.success) {
                            reject({
                                success: false,
                                code: 'ERR_AUTH_00001'
                            });
                        } else {
                            resolve(response);
                        }
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
                apiKey: input.apiKey,
                enterpriseCode: input.enterpriseCode
            }
        });
    },

    authorizeAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultAuthenticationProviderService.findToken(request.moduleName, request.apiKey).then(success => {
                resolve(success);
            }).catch(error => {
                if (request.moduleName === CONFIG.get('profileModuleName')) {
                    SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey(request).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    this.LOG.debug('Authorizing request for apiKey :', request.apiKey);
                    SERVICE.DefaultModuleService.fetch(this.prepareAuthorizeAPIKeyURL(request), (error, response) => {
                        if (error) {
                            reject(error);
                        } else if (!response.success) {
                            reject({
                                success: false,
                                code: 'ERR_AUTH_00001'
                            });
                        } else {
                            resolve(response);
                        }
                    });
                }
            });
        });
    }
};