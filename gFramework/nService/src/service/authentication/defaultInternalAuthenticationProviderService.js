/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

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

    fetchInternalAuthToken: function (tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                moduleName: 'profile',
                methodName: 'GET',
                apiName: '/auth/token/' + tntCode,
                requestBody: {},
                isJsonResponse: true,
                header: {
                    apiKey: CONFIG.get('defaultAuthDetail').apiKey,
                    enterpriseCode: CONFIG.get('defaultAuthDetail').enterpriseCode
                }
            });
            try {
                SERVICE.DefaultModuleService.fetch(requestUrl, (error, response) => {
                    if (error) {
                        _self.LOG.error('While connecting profile server to fetch API Key', error);
                        resolve([]);
                    } else {
                        resolve(response.result || []);
                    }
                });
            } catch (error) {
                _self.LOG.error('While connecting profile server to fetch API Key', error);
                resolve([]);
            }
        });
    }
};