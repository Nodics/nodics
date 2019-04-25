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

    validateModel: function (request, response, process) {
        this.LOG.debug('Validating input for doSaving model');
        if (!request.model) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                msg: 'Invalid data model to save'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query to doSave model');
        process.nextSuccess(request, response);
    },

    applyDefaultValues: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let defaultValues = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(request.moduleName, request.tenant, request.indexName).defaultValues;
        if (defaultValues && !UTILS.isBlank(defaultValues)) {
            _.each(defaultValues, (value, property) => {
                if (!request.model[property]) {
                    try {
                        let serviceName = value.substring(0, value.indexOf('.'));
                        let functionName = value.substring(value.indexOf('.') + 1, value.length);
                        request.model[property] = SERVICE[serviceName][functionName](request.model);
                    } catch (error) {
                        request.model[property] = value;
                    }
                }
            });
        }
        process.nextSuccess(request, response);
    },

    removeVirtualProperties: function (request, response, process) {
        this.LOG.debug('Removing virtual properties from model');
        let virtualProperties = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(request.moduleName, request.tenant, request.indexName).virtualProperties;
        if (virtualProperties && !UTILS.isBlank(virtualProperties)) {
            this.excludeProperty(request.model, virtualProperties);
        }
        process.nextSuccess(request, response);
    },

    excludeProperty: function (model, virtualProperties) {
        let _self = this;
        _.each(virtualProperties, (value, property) => {
            if (UTILS.isObject(value)) {
                let subModel = model[property];
                if (subModel && UTILS.isArray(subModel)) {
                    subModel.forEach(element => {
                        _self.excludeProperty(element, value);
                    });
                } else if (subModel && UTILS.isObject(subModel)) {
                    _self.excludeProperty(subModel, value);
                }
            } else {
                if (model[property]) {
                    delete model[property];
                }
            }
        });
    },
    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre doSave model interceptors');
        let moduleName = request.moduleName || request.searchModel.moduleName || request.schemaModel.moduleName;
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getInterceptors(moduleName, indexName);
        if (interceptors && interceptors.preDoSave) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.preDoSave), {
                schemaModel: request.schemaModel,
                searchModel: request.searchModel,
                indexName: request.searchModel.indexName,
                typeName: request.searchModel.typeName,
                tenant: request.tenant,
                options: request.options,
                query: request.query,
                originalModel: request.model,
                model: request.model
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    doSaveModel: function (request, response, process) {
        this.LOG.debug('Executing doSave operation');
        request.searchModel.doSave(request).then(result => {
            response.success = {
                success: true,
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
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

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post save model interceptors');
        let moduleName = request.moduleName || request.searchModel.moduleName || request.schemaModel.moduleName;
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getInterceptors(moduleName, indexName);
        if (interceptors && interceptors.postDoSave) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.postDoSave), {
                schemaModel: request.schemaModel,
                searchModel: request.searchModel,
                indexName: request.searchModel.indexName,
                typeName: request.searchModel.typeName,
                tenant: request.tenant,
                query: request.query,
                originalModel: request.model,
                model: response.success.result
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00005',
                    error: error.toString()
                });
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

    invalidateItemCache: function (request, response, process) {
        this.LOG.debug('Invalidating item cache for modified model');
        try {
            let searchModel = request.searchModel;
            if (response.success.success && searchModel.cache && searchModel.cache.enabled) {
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
            if (response.success.success && searchModel.indexDef.event) {
                let event = {
                    enterpriseCode: request.enterpriseCode || request.model.enterpriseCode || 'default',
                    tenant: request.tenant || 'default',
                    event: 'save',
                    source: searchModel.moduleName,
                    target: searchModel.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    targetType: ENUMS.TargetType.EACH_NODE.key,
                    active: true,
                    data: {
                        indexName: searchModel.indexName,
                        result: response.success.result
                    }
                };
                this.LOG.debug('Pushing event for item created : ', searchModel.indexName);
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
    },

    handleSucessEnd: function (request, response, process) {
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_FIND_00005',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};