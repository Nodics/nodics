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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating do remove request');
        if (!request.searchModel) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
        } else if (!request.query || UTILS.isBlank(request.query)) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid search request, query can not be null or conatian invalid property'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query options');
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre do remove models interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoRemove) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preDoRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre do remove models validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.preDoRemove) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preDoRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },


    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing get query');
        request.searchModel.doRemoveByQuery(request).then(result => {
            response.success = {
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

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

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post do remove models validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.postDoRemove) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postDoRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post do remove models interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoRemove) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postDoRemove), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateRouterCache: function (request, response, process) {
        this.LOG.debug('Invalidating router cache for modified model');
        try {
            let searchModel = request.searchModel;
            let prefix = searchModel.indexName;
            if (request.schemaModel) {
                prefix = request.schemaModel.schemaName;
            }
            if (response.success.success) {
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: searchModel.moduleName,
                    channelName: 'router',
                    prefix: prefix
                }).then(success => {
                    this.LOG.debug('Cache for router: ' + searchModel.indexName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for router: ' + searchModel.indexName + ' has not been flushed cuccessfully');
                    this.LOG.error(error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating router cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },

    invalidateSearchCache: function (request, response, process) {
        this.LOG.debug('Invalidating item cache for modified model');
        try {
            let searchModel = request.searchModel;
            let cache = searchModel.indexDef.cache;
            if (response.success.success && cache && cache.enabled) {
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: searchModel.moduleName,
                    channelName: 'search',
                    prefix: searchModel.indexName
                }).then(success => {
                    this.LOG.debug('Cache for index: ' + searchModel.indexName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for index: ' + searchModel.indexName + ' has not been flushed cuccessfully');
                    this.LOG.error(error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating item cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for modified model');
        try {
            let searchModel = request.searchModel;
            if (response.success.success && searchModel.indexDef.event && searchModel.indexDef.event.enabled) {
                let event = {
                    tenant: request.tenant || 'default',
                    event: 'searchItemRemoved',
                    sourceName: searchModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: searchModel.moduleName,
                    state: "NEW",
                    type: searchModel.indexDef.event.type || "ASYNC",
                    targetType: searchModel.indexDef.event.targetType || ENUMS.TargetType.MODULE_NODES.key,
                    active: true,
                    data: {
                        indexName: searchModel.indexName,
                        result: response.success.result
                    }
                };
                this.LOG.debug('Pushing event for item created : ' + searchModel.indexName);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting model change event : ', error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    }
};