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
        this.LOG.debug('Validating remove request: ');
        if (!request.query || UTILS.isBlank(request.query)) {
            process.error(request, response, {
                success: false,
                code: 'ERR_UPD_00001'
            });
        } else if (!request.model || UTILS.isBlank(request.model)) {
            process.error(request, response, {
                success: false,
                code: 'ERR_UPD_00002'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query options');
        let inputOptions = request.options || {};
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.snapshot = inputOptions.snapshot || false;

        if (inputOptions.timeout === true) {
            inputOptions.timeout = true;
            inputOptions.maxTimeMS = maxTimeMS || CONFIG.get('queryMaxTimeMS');
        }
        request.options = inputOptions;
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre update model interceptors');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.preUpdate) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preUpdate), {
                schemaModel: request.schemaModel,
                tenant: request.tenant,
                options: request.options || {},
                query: request.query,
                model: request.model
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00004',
                    error: error
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
        if (validators && validators.preUpdate) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preUpdate), {
                schemaModel: request.schemaModel,
                tenant: request.tenant,
                options: request.options || {},
                query: request.query,
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

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        try {
            request.schemaModel.updateItems(request).then(result => {
                response.success = {
                    success: true,
                    code: 'SUC_UPD_00000',
                    result: result
                };
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_UPD_00000',
                    error: error
                });
            });
        } catch (error) {
            process.error(request, response, {
                success: false,
                code: 'ERR_UPD_00000',
                error: error
            });
        }
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.schemaModel.rawSchema;
        let inputOptions = request.options || {};
        if (response.success && response.success.result && response.success.result.n &&
            response.success.result.n > 0 && response.success.result.models &&
            inputOptions.recursive === true && !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, response.success.result.models, 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00003',
                    error: error
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

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators = SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(request.tenant, schemaName);
        if (validators && validators.postUpdate) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postUpdate), {
                schemaModel: request.schemaModel,
                tenant: request.tenant,
                query: request.query,
                model: request.model,
                result: response.success.result
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
        this.LOG.debug('Applying post update model interceptors');
        if (response.success && response.success.result && response.success.result.n && response.success.result.n > 0) {
            let schemaName = request.schemaModel.schemaName;
            let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
            if (interceptors && interceptors.postUpdate) {
                SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postUpdate), {
                    schemaModel: request.schemaModel,
                    tenant: request.tenant,
                    query: request.query,
                    model: request.model,
                    result: response.success.result
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_FIND_00005',
                        error: error
                    });
                });
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateRouterCache: function (request, response, process) {
        this.LOG.debug('Invalidating router cache for modified model');
        try {
            let schemaModel = request.schemaModel;
            if (response.success && response.success.result && response.success.result.n && response.success.result.n > 0) {
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
        this.LOG.debug('Invalidating item cache for removed model');
        try {
            let schemaModel = request.schemaModel;
            if (response.success && response.success.result && response.success.result.n && response.success.result.n > 0 &&
                schemaModel.rawSchema.cache && schemaModel.rawSchema.cache.enabled) {
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
            if (response.success && response.success.result && schemaModel.rawSchema.event) {
                let event = {
                    tenant: request.tenant,
                    event: 'update',
                    source: schemaModel.moduleName,
                    target: schemaModel.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    targetType: ENUMS.TargetType.EACH_NODE.key,
                    data: {
                        schemaName: schemaModel.schemaName,
                        modelName: schemaModel.modelName,
                        result: response.success.result
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
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_UPD_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};