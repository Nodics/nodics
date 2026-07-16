/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/procs/dosave/defaultDoSaveModelInitializerService
 * @description Implements nSearch default do save model initializer service business behavior and extension logic.
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

     * Validates model rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateModel: function (request, response, process) {
        this.LOG.debug('Validating input for doSaving model');
        if (!request.model || !UTILS.isObject(request.model) || Array.isArray(request.model)) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid data model to save'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Builds query data.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query to doSave model');
        process.nextSuccess(request, response);
    },

    /**

     * Executes apply value providers behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyValueProviders: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let valueProviders = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(request.moduleName, request.tenant, request.indexName).valueProviders;
        if (valueProviders && !UTILS.isBlank(valueProviders)) {
            SERVICE.DefaultSearchValueProviderHandlerService.handleValueProviders(valueProviders, request.model).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes apply default values behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyDefaultValues: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let schemaOptions = request.schemaModel && request.schemaModel.rawSchema && request.schemaModel.rawSchema.schemaOptions || {};
        let defaultValues = (schemaOptions[request.tenant] || {}).defaultValues;
        if (defaultValues && !UTILS.isBlank(defaultValues)) {
            _.each(defaultValues, (value, property) => {
                request.model = this.resolveDefaultProperty(property.split('.'), request.model, value);
            });
        }
        process.nextSuccess(request, response);
    },

    /**

     * Retrieves default property information.

     *

     * @param {*} properties Method input.

     * @param {*} model Method input.

     * @param {*} value Method input.

     * @returns {*} Method result.

     */

    resolveDefaultProperty: function (properties, model, value) {
        if (properties && properties.length > 1) {
            let prop = properties.shift();
            if (!model[prop]) model[prop] = {};
            model[prop] = this.resolveDefaultProperty(properties, model[prop], value);
        } else if (properties && properties.length === 1 && !model[properties[0]]) {
            try {
                let serviceName = value.substring(0, value.indexOf('.'));
                let functionName = value.substring(value.indexOf('.') + 1, value.length);
                model[properties[0]] = SERVICE[serviceName][functionName](model);
            } catch (error) {
                model[properties[0]] = value;
            }
        }
        return model;
    },

    /**

     * Removes or clears virtual properties information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    removeVirtualProperties: function (request, response, process) {
        this.LOG.debug('Removing virtual properties from model');
        let virtualProperties = SERVICE.DefaultSearchConfigurationService.getTenantRawSearchSchema(request.moduleName, request.tenant, request.indexName).virtualProperties;
        if (virtualProperties && !UTILS.isBlank(virtualProperties)) {
            this.excludeProperty(request.model, virtualProperties);
        }
        process.nextSuccess(request, response);
    },

    /**

     * Executes exclude property behavior.

     *

     * @param {*} model Method input.

     * @param {*} virtualProperties Method input.

     * @returns {*} Method result.

     */

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

    /**

     * Executes apply pre interceptors behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre doSave model interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoSave) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preDoSave), request, response).then(success => {
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
        this.LOG.debug('Applying pre doSave model validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.preDoSave) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preDoSave), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes do save model behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    doSaveModel: function (request, response, process) {
        this.LOG.debug('Executing doSave operation');
        request.searchModel.doSave(request).then(result => {
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
        this.LOG.debug('Applying post do save model validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.postDoSave) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postDoSave), request, response).then(success => {
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
        this.LOG.debug('Applying post do save model interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoSave) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postDoSave), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes invalidate router cache behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    invalidateRouterCache: function (request, response, process) {
        this.LOG.debug('Invalidating router cache for modified model');
        try {
            let searchModel = request.searchModel;
            let prefix = searchModel.indexName;
            if (request.schemaModel) {
                prefix = request.schemaModel.schemaName;
            }
            if (response.success && response.success.result) {
                SERVICE.DefaultCacheService.invalidateResource({
                    tenant: request.tenant,
                    authData: request.authData,
                    moduleName: searchModel.moduleName,
                    cacheType: 'router',
                    resourceName: prefix
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

    /**

     * Executes invalidate search cache behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    invalidateSearchCache: function (request, response, process) {
        this.LOG.debug('Invalidating item cache for modified model');
        try {
            let searchModel = request.searchModel;
            let cache = searchModel.indexDef.cache;
            if (response.success && response.success.result && cache && cache.enabled) {
                SERVICE.DefaultCacheService.invalidateResource({
                    tenant: request.tenant,
                    authData: request.authData,
                    moduleName: searchModel.moduleName,
                    cacheType: 'search',
                    resourceName: searchModel.indexName
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

    /**

     * Processes model change event behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for modified model');
        try {
            let searchModel = request.searchModel;
            if (response.success.success &&
                searchModel.indexDef.event &&
                searchModel.indexDef.event.enabled) {
                let event = {
                    tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                    event: 'save',
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
