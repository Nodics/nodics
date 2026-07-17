/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/service/interceptors/defaultRouterConfigurationSaveInterceptorService
 * @description Implements nDynamo default router configuration save interceptor service business behavior and extension logic.
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

     * Validates if module active for router rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    checkIfModuleActiveForRouter: function (request, response) {
        return new Promise((resolve, reject) => {
            let moduleName = request.model.moduleName;
            if (moduleName && (moduleName === 'default' || moduleName === 'common' || UTILS.isRouterEnabled(moduleName))) {
                resolve(true);
            } else {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid moduleName, it should not be null or inactive for routers'));
            }
        });
    },

    /**
     * Validates and normalizes a persisted runtime route before activation.
     *
     * @param {Object} request Save request containing `model`.
     * @param {Object} response Response context.
     * @returns {Promise<boolean>} Resolves when the route definition is valid.
     * @sideEffects Defaults missing `groupName` to `runtime`.
     */
    validateRouterConfiguration: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model || {};
            let missingProperties = ['code', 'key', 'method', 'controller', 'operation'].filter(propertyName => {
                return model[propertyName] === undefined || model[propertyName] === null || model[propertyName] === '';
            });
            if (missingProperties.length > 0) {
                reject(new CLASSES.NodicsError(
                    'ERR_RTR_00003',
                    'Invalid router configuration, missing properties: ' + missingProperties.join(', ')
                ));
                return;
            }
            model.groupName = model.groupName || model.routerGroup || model.group || 'runtime';
            resolve(true);
        });
    }
};
