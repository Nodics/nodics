/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    validateModel: function (request, response, process) {
        this.LOG.debug('Validating input for saving model');
        if (!request.model) {
            process.error(request, response, 'Model can not be null, to perform save operation');
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.preSave) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(request,
                response,
                [].concat(interceptors.preSave)).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query to save model');
        process.nextSuccess(request, response);
    },

    applyDefaultValues: function (request, response, process) {
        this.LOG.debug('Applying default values to the model');
        let defaultValues = request.collection.rawSchema.schemaOptions[request.tenant].defaultValues;
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
        let rawSchema = request.collection.rawSchema;
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

    saveModel: function (request, response, process) {
        this.LOG.debug('Saving model');
        request.collection.saveItem(request).then(success => {
            response.result = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.postSave) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(request,
                response,
                [].concat(interceptors.postSave)).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateCache: function (request, response, process) {
        this.LOG.debug('Invalidating cache for modified model');
        try {
            let moduleObject = NODICS.getModules()[request.collection.moduleName];
            let collection = request.collection;
            if (moduleObject.itemCache &&
                collection.rawSchema.cache &&
                collection.rawSchema.cache.enabled) {

                SERVICE.DefaultCacheService.flushItemCache({
                    moduleName: collection.moduleName,
                    prefix: collection.modelName
                }).then(success => {
                    this.LOG.debug('Cache for model:' + collection.modelName + ' has been flushed cuccessfully');
                }).catch(error => {
                    this.LOG.error('Cache for model:' + collection.modelName + ' has not been flushed cuccessfully');
                    this.LOG.error(error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },

    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for modified model');
        try {
            let collection = request.collection;
            if (NODICS.getActiveChannel() !== 'test' &&
                NODICS.isNTestRunning() &&
                CONFIG.get('event').publishAllActive &&
                collection.rawSchema.event) {
                let document = request.model;
                let event = {
                    enterpriseCode: document.enterpriseCode,
                    event: 'save',
                    source: collection.moduleName,
                    target: collection.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    params: [{
                        key: 'modelName',
                        value: collection.schemaName
                    }]
                };
                this.LOG.debug('Pushing event for item created : ', collection.schemaName);
                SERVICE.DefaultEventService.publish(event);
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Request has been processed successfully');
        response.modelSaveInitializerPipeline.promise.resolve(response.result);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.error('Request has been processed with some failures');
        response.modelSaveInitializerPipeline.promise.reject(response.result);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.error('Request has been processed and got errors ');
        response.modelSaveInitializerPipeline.promise.reject(response.result.error);
    }
};