/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

/**
 * @module service/authentication/DefaultInternalAuthenticationProviderService
 * @description Fetches tenant-scoped internal auth tokens from the profile
 * module when the profile module is deployed separately. This supports modular
 * deployment where non-profile nodes still need internal service credentials.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to integrate external IAM,
 * service accounts, or secret managers while preserving tenant-scoped internal
 * token retrieval.
 *
 * @property {Object} CONFIG.defaultAuthDetail Bootstrap API key and enterprise code.
 * @property {Object} SERVICE.DefaultModuleService Internal module HTTP client.
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

    /**
     * Fetches an internal auth token for a tenant from the profile module.
     *
     * @param {string} tntCode Tenant code.
     * @returns {Promise<Object|Object[]>} Internal token response or empty list when unavailable.
     */
    fetchInternalAuthToken: function (tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                moduleName: CONFIG.get('profileModuleName') || 'profile',
                methodName: 'GET',
                apiName: '/auth/token/' + tntCode,
                requestBody: {},
                responseType: true,
                header: {
                    'x-api-key': CONFIG.get('defaultAuthDetail').apiKey,
                    'x-enterprise-code': CONFIG.get('defaultAuthDetail').entCode
                }
            });
            try {
                SERVICE.DefaultModuleService.fetch(requestUrl).then(response => {
                    resolve(response.result || []);
                }).catch(error => {
                    _self.LOG.error('While connecting profile server to fetch API Key', error);
                    resolve([]);
                });
            } catch (error) {
                _self.LOG.error('While connecting profile server to fetch API Key', error);
                resolve([]);
            }
        });
    }
};
