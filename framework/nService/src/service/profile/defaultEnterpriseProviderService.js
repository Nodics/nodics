/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    prepareURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'GET',
            apiName: '/enterprise/get',
            requestBody: {
                recursive: true
            },
            isJsonResponse: true,
            header: {
                enterpriseCode: input.enterpriseCode
            }
        });
    },

    loadEnterprise: function (request) {
        return new Promise((resolve, reject) => {
            if (request.moduleName === 'profile') {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: request.tenant || 'default',
                    options: {
                        recursive: true
                    },
                    query: {
                        code: request.enterpriseCode
                    }
                }).then(enterprise => {
                    if (enterprise && enterprise.length > 0) {
                        resolve(enterprise[0]);
                    } else {
                        reject('Invalid enterprise code');
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                SERVICE.DefaultModuleService.fetch(this.prepareURL(request), (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response.success) {
                        reject(response.msg);
                    } else {
                        resolve(response.result[0]);
                    }
                });
            }
        });

    }
};