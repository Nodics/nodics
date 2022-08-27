/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

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
        this.LOG.debug('Validating input for saving model');
        if (!request.model) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SAVE_00003', 'Model can not be null or empty for save operation'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkAccess: function (request, response, process) {
        this.LOG.debug('Checking model access');
        let rawSchema = request.schemaModel.rawSchema;
        if (SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(request.authData, rawSchema.accessGroups) >= CONFIG.get('accessPoint').writeAccessPoint) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource'));
        }
    },
    applyDefaultValues: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let defaultValues = request.schemaModel.rawSchema.schemaOptions[request.tenant].defaultValues;
        if (defaultValues && !UTILS.isBlank(defaultValues)) {
            _.each(defaultValues, (value, property) => {
                request.model = this.resolveDefaultProperty(property.split('.'), request.model, value);
            });
        }
        process.nextSuccess(request, response);
    },
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
    removeVirtualProperties: function (request, response, process) {
        this.LOG.debug('Removing virtual properties from model');
        let rawSchema = request.schemaModel.rawSchema;
        if (!UTILS.isBlank(rawSchema.virtualProperties)) {
            this.excludeProperty(request.model, rawSchema.virtualProperties);
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
        this.LOG.debug('Applying pre save model interceptors');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.preSave) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preSave), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00009'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators = SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName);
        if (validators && validators.preSave) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preSave), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00009'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyValidators: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let validators = request.schemaModel.rawSchema.schemaOptions[request.tenant].validators;
        if (validators && !UTILS.isBlank(validators)) {
            _.each(validators, (value, property) => {
                if (request.model[property]) {
                    try {
                        let serviceName = value.substring(0, value.indexOf('.'));
                        let functionName = value.substring(value.indexOf('.') + 1, value.length);
                        SERVICE[serviceName][functionName](request.model[property]);
                    } catch (error) {
                        process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00011'));
                    }
                }
            });
        }
        process.nextSuccess(request, response);
    },
    handleNestedModelsSave: function (request, response, process) {
        this.LOG.debug('Saving nexted models');
        let rawSchema = request.schemaModel.rawSchema;
        if (!UTILS.isBlank(rawSchema.refSchema)) {
            SERVICE.DefaultModelService.travelModels({
                request: request,
                response: response,
                models: [request.model],
                index: 0,
                callback: SERVICE.DefaultModelService.saveNestedModels
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00003'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    saveModel: function (request, response, process) {
        this.LOG.debug('Saving model ');
        request.schemaModel.saveItems(request).then(success => {
            response.success = {
                code: 'SUC_SAVE_00000',
                result: success
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            console.log('model error: ', error);
            process.error(request, response, error);
        });
    },
    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        if (response.success.result && request.options.recursive) {
            SERVICE.DefaultModelService.travelModels({
                request: request,
                response: response,
                models: [response.success.result],
                index: 0,
                callback: SERVICE.DefaultModelService.populateNestedModels
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_FIND_00003'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    populateVirtualProperties: function (request, response, process) {
        let virtualProperties = request.schemaModel.rawSchema.virtualProperties;
        if (response.success.result && virtualProperties && !UTILS.isBlank(virtualProperties)) {
            this.LOG.debug('Populating virtual properties');
            SERVICE.DefaultSchemaVirtualPropertiesHandlerService.populateVirtualProperties(virtualProperties, response.success.result);
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPostValidators: function (request, response, process) {
        let schemaName = request.schemaModel.schemaName;
        let validators = SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName);
        if (validators && validators.postSave) {
            this.LOG.debug('Applying post model validator');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postSave), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00010'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    applyPostInterceptors: function (request, response, process) {
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.postSave) {
            this.LOG.debug('Applying post save model interceptors');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postSave), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00010'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    invalidateRouterCache: function (request, response, process) {
        try {
            let schemaModel = request.schemaModel;
            if (response.success) {
                this.LOG.debug('Invalidating router cache for modified model');
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: schemaModel.moduleName,
                    channelName: 'router',
                    prefix: schemaModel.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for router: ' + schemaModel.schemaName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.warn('Cache for router: ' + schemaModel.schemaName + ' has not been flushed cuccessfully', error.message);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating router cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },
    invalidateItemCache: function (request, response, process) {
        try {
            let schemaModel = request.schemaModel;
            if (response.success && schemaModel.cache && schemaModel.cache.enabled) {
                this.LOG.debug('Invalidating item cache for modified model');
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: schemaModel.moduleName,
                    channelName: 'schema',
                    prefix: schemaModel.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for schema: ' + schemaModel.schemaName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.warn('Cache for schema: ' + schemaModel.schemaName + ' has not been flushed cuccessfully', error.message);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating item cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },
    triggerModelChangeEvent: function (request, response, process) {
        try {
            let schemaModel = request.schemaModel;
            if (response.success.result && schemaModel.rawSchema.event && schemaModel.rawSchema.event.enabled) {
                this.LOG.debug('Triggering event for modified model');
                let event = {
                    tenant: request.tenant,
                    event: schemaModel.schemaName + 'Save',
                    sourceName: schemaModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: schemaModel.moduleName,
                    state: "NEW",
                    type: schemaModel.rawSchema.event.type || "ASYNC",
                    targetType: schemaModel.rawSchema.event.targetType || ENUMS.TargetType.MODULE_NODES.key,
                    active: true,
                    data: {
                        schemaName: schemaModel.schemaName,
                        modelName: schemaModel.modelName,
                        propertyName: (schemaModel.rawSchema.definition.code) ? 'code' : '_id',
                        models: [response.success.result.code || response.success.result._id]
                    }
                };
                this.LOG.debug('Pushing event for item created : ' + schemaModel.schemaName);
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