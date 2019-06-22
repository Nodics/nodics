/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    prepareURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: '/enterprise',
            requestBody: {
                options: {
                    recursive: true
                },
                query: {
                    code: input.entCode
                }
            },
            isJsonResponse: true,
            header: {
                authToken: NODICS.getInternalAuthToken('default')
            }
        });
    },

    loadEnterprise: function (request) {
        return new Promise((resolve, reject) => {
            if (request.moduleName === CONFIG.get('profileModuleName')) {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: 'default',
                    options: {
                        recursive: true
                    },
                    query: {
                        code: request.entCode
                    }
                }).then(result => {
                    if (result && result.success && result.result.length > 0) {
                        resolve(result.result[0]);
                    } else {
                        reject({
                            success: false,
                            code: 'ERR_ENT_00000'
                        });
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                SERVICE.DefaultModuleService.fetch(this.prepareURL(request), (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response.success || !response.result || response.result.length < 1) {
                        reject(response.msg);
                    } else {
                        resolve(response.result[0]);
                    }
                });
            }
        });

    }
};