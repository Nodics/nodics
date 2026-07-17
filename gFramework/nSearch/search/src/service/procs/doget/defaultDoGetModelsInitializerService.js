/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/procs/doget/defaultDoGetModelsInitializerService
 * @description Implements nSearch default do get models initializer service business behavior and extension logic.
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
        this.LOG.debug('Validating do get request');
        if (!request.searchModel) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
        } else if (!request.query || !request.query.id) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid search request, query can not be null or conatian invalid property'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Builds options data.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query options');
        process.nextSuccess(request, response);
    },

    /**

     * Executes lookup cache behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    lookupCache: function (request, response, process) {
        let searchModel = request.searchModel;
        let indexDef = searchModel.indexDef;
        let cacheConfig = CONFIG.get('cache') || {};
        if (cacheConfig.enabled !== false && indexDef.cache && indexDef.cache.enabled) {
            request.cacheKeyHash = SERVICE.DefaultCacheConfigurationService.createSearchKey(request);
            this.LOG.debug('Model cache lookup for key: ' + request.cacheKeyHash);
            SERVICE.DefaultCacheService.get({
                tenant: request.tenant,
                moduleName: request.searchModel.moduleName || request.schemaModel.moduleName,
                channelName: SERVICE.DefaultCacheService.getSearchCacheChannel(request.searchModel.indexName),
                key: request.cacheKeyHash
            }).then(value => {
                this.LOG.debug('Fulfilled from model cache');
                let cachedResponse = _.cloneDeep(value);
                process.stop(request, response, {
                    code: 'SUC_SRCH_00000',
                    cache: 'item hit',
                    result: cachedResponse.result
                });
            }).catch(error => {
                if (error.code === 'ERR_CACHE_00001') {
                    process.nextSuccess(request, response);
                } else if (error.code === 'ERR_CACHE_00006') {
                    this.LOG.warn(error.msg);
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, error);
                }
            });
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
        this.LOG.debug('Applying pre do get model interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoGet) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preDoGet), request, response).then(success => {
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
        this.LOG.debug('Applying pre do get validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.preDoGet) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preDoGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
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
        this.LOG.debug('Executing get query');
        request.searchModel.doGet(request).then(result => {
            response.success = {
                success: true,
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Executes populate virtual properties behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    populateVirtualProperties: function (request, response, process) {
        this.LOG.debug('Populating virtual properties');
        let virtualProperties = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(request.moduleName, request.tenant, request.indexName).virtualProperties;
        if (response.success.result && virtualProperties && !UTILS.isBlank(virtualProperties)) {
            SERVICE.DefaultSearchVirtualPropertiesHandlerService.populateVirtualProperties(virtualProperties, response.success.result);
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
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
        this.LOG.debug('Applying pre do get validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.postDoGet) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postDoGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00008'));
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
        this.LOG.debug('Applying post do get interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoGet) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postDoGet), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Updates cache information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    updateCache: function (request, response, process) {
        this.LOG.debug('Updating cache for new Items');
        let searchModel = request.searchModel;
        let indexDef = searchModel.indexDef;
        let cacheDecision = SERVICE.DefaultCachePolicyService && typeof SERVICE.DefaultCachePolicyService.isSearchCacheable === 'function' ?
            SERVICE.DefaultCachePolicyService.isSearchCacheable(request, response.success) :
            { cacheable: !!(indexDef.cache && indexDef.cache.enabled && response.success && response.success.result), reason: 'legacyPolicy', reasonCode: 'RSN_CACHE_00010' };
        request.cachePolicyDecision = cacheDecision;
        if (cacheDecision.cacheable) {
            let cache = request.searchModel.indexDef.cache;
            SERVICE.DefaultCacheService.put({
                tenant: request.tenant,
                moduleName: request.searchModel.moduleName || request.schemaModel && request.schemaModel.moduleName,
                channelName: SERVICE.DefaultCacheService.getSearchCacheChannel(request.searchModel.indexName),
                key: request.cacheKeyHash,
                value: response.success,
                ttl: cache.ttl
            }).then(success => {
                this.LOG.info('Item saved in item cache');
            }).catch(error => {
                this.LOG.error('While saving item in item cache : ', error);
            });
        } else if (cacheDecision.reason && cacheDecision.reason !== 'legacyPolicy' && (!CONFIG.get('cache') || !CONFIG.get('cache').cacheability || CONFIG.get('cache').cacheability.logSkippedReason !== false)) {
            this.LOG.debug('Skipping search cache write: ' + cacheDecision.reasonCode + ' ' + cacheDecision.reason);
        }
        process.nextSuccess(request, response);
    }
};
