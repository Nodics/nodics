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
            process.error(request, response, {
                success: false,
                code: 'ERR_SAVE_00001'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query to save model');
        request.query = {};
        request.options = request.options || {};
        try {
            if (request.originalQuery && !UTILS.isBlank(request.originalQuery)) {
                request.query = this.resolveQuery(_.merge({}, request.originalQuery || {}), request.model);
            } else if (request.model._id) {
                let objectId = SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, request.model._id);
                request.query = {
                    _id: objectId
                };
                request.model._id = objectId;
            } else if (request.model.code) {
                request.query = {
                    code: request.model.code
                };
            }
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SAVE_00002',
                error: error
            });
        }
    },

    resolveQuery: function (query, model) {
        let queryStr = {};
        _.each(query, (propertyValue, propertyName) => {
            if (propertyName.indexOf(".") > 0 && propertyValue.startsWith('$')) {
                let properties = propertyName.split('.');
                let value = model;
                for (let element of properties) {
                    if (value[element]) {
                        value = value[element];
                    } else {
                        value = null;
                        break;
                    }
                }
                if (value) {
                    queryStr[propertyName] = value;
                }
            } else if (propertyValue.startsWith('$')) {
                propertyValue = propertyValue.substring(1, propertyValue.length);
                if (model[propertyValue]) {
                    queryStr[propertyName] = model[propertyValue];
                } else {
                    throw new Error('could not find a valid property ' + propertyName);
                }
            } else {
                queryStr[propertyName] = propertyValue;
            }
        });
        return queryStr;
    },

    applyDefaultValues: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let defaultValues = request.schemaModel.rawSchema.schemaOptions[request.tenant].defaultValues;
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

    handleNestedModelsSave: function (request, response, process) {
        this.LOG.debug('Saving nexted models');
        let rawSchema = request.schemaModel.rawSchema;
        if (!UTILS.isBlank(rawSchema.refSchema)) {
            this.handleNestedProperties(request, response, Object.keys(rawSchema.refSchema)).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleNestedProperties: function (request, response, properties) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (properties && properties.length > 0) {
                let property = properties.shift();
                let models = request.model[property];
                if (models && ((UTILS.isObject(models) && !UTILS.isObjectId(models)) || UTILS.isArrayOfObject(models))) {
                    _self.handleNestedModel(request, response, property).then(success => {
                        _self.handleNestedProperties(request, response, properties).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.handleNestedProperties(request, response, properties).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    handleNestedModel: function (request, response, property) {
        return new Promise((resolve, reject) => {
            try {
                let model = request.model;
                let models = model[property];
                let rawSchema = request.schemaModel.rawSchema;
                let propDef = rawSchema.refSchema[property];
                if (propDef.type === 'one') {
                    models = [models];
                }
                SERVICE['Default' + propDef.schemaName.toUpperCaseFirstChar() + 'Service'].save({
                    tenant: request.tenant,
                    models: models
                }).then(success => {
                    if (success.success) {
                        if (propDef.type === 'one') {
                            let key = (propDef.propertyName) ? success.result[0][propDef.propertyName] : success.result[0]._id;
                            if (UTILS.isObjectId(key)) {
                                key = key.toString();
                            }
                            model[property] = key;
                        } else {
                            model[property] = [];
                            success.result.forEach(element => {
                                let key = (propDef.propertyName) ? element[propDef.propertyName] : element._id;
                                if (UTILS.isObjectId(key)) {
                                    key = key.toString();
                                }
                                model[property].push(key);
                            });
                        }
                        resolve(true);
                    } else {
                        let response = {
                            success: false,
                            code: 'ERR_SAVE_00006'
                        };
                        if (success.result) {
                            response.result = success.result;
                        }
                        if (success.error) {
                            response.error = success.error;
                        }
                        reject(response);
                    }
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre save model interceptors');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.preSave) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preSave), {
                schemaModel: request.schemaModel,
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
                    code: 'ERR_FIND_00004',
                    error: error.toString()
                });
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
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preSave), {
                schemaModel: request.schemaModel,
                tenant: request.tenant,
                options: request.options,
                query: request.query,
                originalModel: request.model,
                model: request.model
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                response.error = {
                    success: false,
                    code: 'ERR_FIND_00005',
                    error: error
                };
                process.error(request, response);
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
                        process.error(request, response, error);
                    }
                }
            });
        }
        process.nextSuccess(request, response);
    },

    saveModel: function (request, response, process) {
        this.LOG.debug('Saving model ');
        request.schemaModel.saveItems(request).then(success => {
            let model = {
                success: true,
                code: 'SUC_SAVE_00000'
            };
            if (success && UTILS.isArray(success) && success.length > 0) {
                model.result = success[0];
            } else {
                model.result = success;
            }
            response.model = model;
            process.nextSuccess(request, response);
        }).catch(error => {
            this.LOG.error(error);
            process.error(request, response, {
                success: false,
                code: 'ERR_SAVE_00000',
                error: error.toString()
            });
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.schemaModel.rawSchema;
        let inputOptions = request.options || {};
        if (response.model.result && inputOptions.recursive === true && !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, [response.model.result], 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00003',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    populateModels: function (request, response, models, index) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let model = models[index];
            if (model) {
                _self.populateProperties(request, response, model, Object.keys(request.schemaModel.rawSchema.refSchema)).then(success => {
                    _self.populateModels(request, response, models, index + 1).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    populateProperties: function (request, response, model, propertiesList) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let property = propertiesList.shift();
            if (model[property]) {
                let refSchema = request.schemaModel.rawSchema.refSchema;
                let propertyObject = refSchema[property];
                let query = {};
                if (propertyObject.type === 'one') {
                    if (propertyObject.propertyName === '_id') {
                        query[propertyObject.propertyName] = SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, model[property]);
                    } else {
                        query[propertyObject.propertyName] = model[property];
                    }
                } else {
                    if (propertyObject.propertyName === '_id') {
                        query[propertyObject.propertyName] = {
                            '$in': SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, model[property])
                        };
                    } else {
                        query[propertyObject.propertyName] = {
                            '$in': model[property]
                        };
                    }
                }
                let input = {
                    tenant: request.tenant,
                    query: query
                };
                SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].get(input).then(success => {
                    if (success.result.length > 0) {
                        if (propertyObject.type === 'one') {
                            model[property] = success.result[0];
                        } else {
                            model[property] = success.result;
                        }
                    } else {
                        model[property] = null;
                    }
                    if (propertiesList.length > 0) {
                        _self.populateProperties(request, response, model, propertiesList).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                }).catch(error => {
                    reject(error);
                });

            } else {
                if (propertiesList.length > 0) {
                    _self.populateProperties(request, response, model, propertiesList).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }
        });
    },

    populateVirtualProperties: function (request, response, process) {
        this.LOG.debug('Populating virtual properties');
        let virtualProperties = request.schemaModel.rawSchema.virtualProperties;
        if (response.model.result && virtualProperties && !UTILS.isBlank(virtualProperties)) {
            SERVICE.DefaultSchemaVirtualPropertiesHandlerService.populateVirtualProperties(virtualProperties, response.model.result);
            process.nextSuccess(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators = SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName);
        if (validators && validators.postSave) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postSave), {
                schemaModel: request.schemaModel,
                tenant: request.tenant,
                query: request.query,
                originalModel: request.model,
                model: response.model.result
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                response.error = {
                    success: false,
                    code: 'ERR_FIND_00005',
                    error: error
                };
                process.error(request, response);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post save model interceptors');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.postSave) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postSave), {
                schemaModel: request.schemaModel,
                tenant: request.tenant,
                query: request.query,
                originalModel: request.model,
                model: response.model.result
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
            let schemaModel = request.schemaModel;
            if (response.model) {
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: schemaModel.moduleName,
                    channelName: 'router',
                    prefix: schemaModel.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for router: ' + schemaModel.schemaName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for router: ' + schemaModel.schemaName + ' has not been flushed cuccessfully');
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
            let schemaModel = request.schemaModel;
            if (response.model && schemaModel.cache && schemaModel.cache.enabled) {
                SERVICE.DefaultCacheService.flushCache({
                    moduleName: schemaModel.moduleName,
                    channelName: 'schema',
                    prefix: schemaModel.schemaName
                }).then(success => {
                    this.LOG.debug('Cache for schema: ' + schemaModel.schemaName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for schema: ' + schemaModel.schemaName + ' has not been flushed cuccessfully');
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
            let schemaModel = request.schemaModel;
            if (response.model.result && schemaModel.rawSchema.event) {
                let event = {
                    tenant: request.tenant,
                    event: schemaModel.schemaName + 'Save',
                    sourceName: schemaModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: schemaModel.moduleName,
                    state: "NEW",
                    type: "SYNC",
                    targetType: ENUMS.TargetType.EACH_MODULE_NODES.key,
                    active: true,
                    data: {
                        schemaName: schemaModel.schemaName,
                        modelName: schemaModel.modelName,
                        result: response.model.result
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
    },

    handleSucessEnd: function (request, response, process) {
        process.resolve(response.model);
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