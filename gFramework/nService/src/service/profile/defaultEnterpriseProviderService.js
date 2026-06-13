/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/profile/DefaultEnterpriseProviderService
 * @description Resolves enterprise records for incoming requests. When profile
 * is local it reads generated enterprise services directly; when profile is
 * remote it calls the profile module API using the default internal auth token.
 * @layer service
 * @owner nService
 * @override Project modules may override this provider to integrate external
 * enterprise registries, CIAM systems, or tenant resolution policies while
 * preserving enterprise-code based lookup.
 *
 * @property {string} request.entCode Enterprise code resolved from request token/header.
 * @property {string} CONFIG.defaultTenant Startup/default tenant used for profile lookup.
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
     * Builds the remote profile enterprise lookup request.
     *
     * @param {Object} input Enterprise lookup input.
     * @param {string} input.entCode Enterprise code.
     * @returns {Object} Internal module fetch options.
     */
    prepareURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: CONFIG.get('profileModuleName') || 'profile',
            methodName: 'POST',
            apiName: '/enterprise',
            requestBody: {
                options: {
                    recursive: true,
                },
                query: {
                    code: input.entCode
                }
            },
            responseType: true,
            header: {
                Authorization: 'Bearer ' + NODICS.getInternalAuthToken(CONFIG.get('defaultTenant') || 'default')
            }
        });
    },

    /**
     * Loads enterprise details from local or remote profile module.
     *
     * @param {Object} request Enterprise lookup request.
     * @param {string} request.moduleName Current module name.
     * @param {string} request.entCode Enterprise code.
     * @returns {Promise<Object>} Enterprise model.
     * @throws {CLASSES.NodicsError} When enterprise cannot be found.
     */
    loadEnterprise: function (request) {
        return new Promise((resolve, reject) => {
            if (request.moduleName === CONFIG.get('profileModuleName')) {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: CONFIG.get('defaultTenant') || 'default',
                    options: {
                        recursive: true,
                    },
                    query: {
                        code: request.entCode
                    }
                }).then(response => {
                    if (response && response.result.length > 0) {
                        resolve(response.result[0]);
                    } else {
                        reject(new CLASSES.NodicsError('ERR_ENT_00000'));
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error));
                });
            } else {
                let requestUrl = this.prepareURL(request);
                SERVICE.DefaultModuleService.fetch(requestUrl).then(response => {
                    if (response.result && response.result.length > 0) {
                        resolve(response.result[0]);
                    } else {
                        reject(new CLASSES.NodicsError('ERR_ENT_00000'));
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error));
                });
            }
        });

    }
};
