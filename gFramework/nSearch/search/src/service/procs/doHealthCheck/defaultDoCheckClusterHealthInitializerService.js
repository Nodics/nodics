/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/service/procs/doHealthCheck/defaultDoCheckClusterHealthInitializerService
 * @description Implements nSearch default do check cluster health initializer service business behavior and extension logic.
 * @layer service
 * @owner nSearch
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

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating do health check request');
        if (!request.searchModel) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes apply pre interceptors behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre do health check interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoHealthCheck) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preDoHealthCheck), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes apply pre validators behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre do health check validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.preDoHealthCheck) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preDoHealthCheck), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes query behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing do health check query');
        request.searchModel.doCheckHealth(request).then(result => {
            response.success = {
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Executes apply post validators behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying pre do health check validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.postDoHealthCheck) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postDoHealthCheck), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes apply post interceptors behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post do Health Check interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoHealthCheck) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postDoHealthCheck), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    }
};