/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nDynamo/src/service/interceptors/defaultSchemaConfigurationSaveInterceptorService
 * @description Implements nDynamo default schema configuration save interceptor service business behavior and extension logic.
 * @layer service
 * @owner nDynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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


     * Validates if module active rules.


     *


     * @param {*} request Method input.


     * @param {*} response Method input.


     * @returns {*} Method result.


     */


    checkIfModuleActive: function (request, response) {
        return new Promise((resolve, reject) => {
            let moduleName = request.model.moduleName;
            if (NODICS.isModuleActive(moduleName)) {
                resolve(true);
            } else {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid moduleName, it should not be null or inactive'));
            }
        });
    },

    /**

     * Executes assign default access group behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    assignDefaultAccessGroup: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.accessGroups || UTILS.isArray(request.model.accessGroups)) {
                request.model.accessGroups = {
                    employeeUserGroup: 2
                };
            }
            resolve(true);
        });
    },

    /**

     * Executes merge existing schema behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    mergeExistingSchema: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model;
            SERVICE.DefaultSchemaConfigurationService.get({
                tenant: CONFIG.get('defaultTenant') || 'default',
                searchOptions: {
                    projection: { _id: 0 }
                },
                query: {
                    code: model.code
                }
            }).then(success => {
                if (success.success && success.result.length > 0) {
                    request.model = _.merge(success.result, model);
                }
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};
