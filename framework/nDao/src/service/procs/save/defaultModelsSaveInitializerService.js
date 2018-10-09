/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for saving models');
        if (!request.models && !request.model) {
            process.error(request, response, 'Models to be saved can not be null in request');
        } else {
            let models = [];
            if (request.models) {
                if (UTILS.isObject(request.models)) {
                    models.push(request.models);
                } else {
                    models = [].concat(request.models);
                }
            } else {
                models.push(request.model);
            }
            request.models = models;
            process.nextSuccess(request, response);
        }
    },

    preProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.preProcessor) {
            SERVICE.DefaultInterceptorHandlerService.executeProcessorInterceptors({
                request: request,
                response: response,
                interceptorList: [].concat(interceptors.preProcessor)
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleNestedModelsSave: function (request, response, process) {
        this.LOG.debug('Saving nexted models');
        console.log(request.models);
        let rawSchema = request.collection.rawSchema;
        if (rawSchema.refSchema) {
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
                _self.handleNestedModels(request, response, {
                    counter: 0,
                    property: property
                }).then(success => {
                    _self.handleNestedProperties(request, response, properties).then(success => {
                        resolve(true);
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

    handleNestedModels: function (request, response, options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.counter < request.models.length) {
                    let model = request.models[options.counter];
                    if ((UTILS.isObject(model[options.property]) && !UTILS.isObjectId(model[options.property])) ||
                        UTILS.isArrayOfObject(model[options.property])) {
                        let rawSchema = request.collection.rawSchema;
                        let propDef = rawSchema.refSchema[options.property];
                        let models = [];
                        if (propDef.type === 'one') {
                            models.push(model[options.property]);
                        } else {
                            models = model[options.property];
                        }
                        SERVICE['Default' + propDef.schemaName.toUpperCaseFirstChar() + 'Service'].save({
                            tenant: request.tenant,
                            models: models
                        }).then(success => {
                            if (propDef.type === 'one') {
                                model[options.property] = success[0]._id;
                            } else {
                                model[options.property] = [];
                                success.forEach(element => {
                                    model[options.property].push(element._id);
                                });
                            }
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    },

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models');
        if (request.query && !UTILS.isBlank(request.query)) {
            request.originalQuery = _.merge({}, request.query || {});
        }
        this.handleModelsSave(request, response, request.models).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleModelsSave: function (request, response, models) {
        return new Promise((resolve, reject) => {
            if (models && models.length > 0) {
                request.model = models.shift();
                try {
                    SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {}).then(success => {
                        if (UTILS.isArray(success)) {
                            success.forEach(element => {
                                response.success.push(element);
                            });
                        } else {
                            response.success.push(success);
                        }
                        if (models.length > 0) {
                            this.handleModelsSave(request, response, models).then(success => {
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
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(true);
            }
        });
    },

    postProcessor: function (request, response, process) {
        this.LOG.debug('Applying post processors in models');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.postProcessor) {
            SERVICE.DefaultInterceptorHandlerService.executeProcessorInterceptors({
                request: request,
                response: response,
                interceptorList: [].concat(interceptors.postProcessor)
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        process.reject(response.errors);
    }
};