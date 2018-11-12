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
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SAVE_00005',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
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
                    SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {}).then(result => {
                        if (result.success) {
                            response.success.push(result.result);
                        } else {
                            let output = {
                                code: result.code || 'ERR_SAVE_00000',
                                model: request.model,
                                error: result.error || SERVICE.DefaultStatusService.get('ERR_SAVE_00000').message
                            };
                            if (result.result) {
                                if (result.result instanceof Array && result.result.length > 0) {
                                    result.result.forEach(element => {
                                        response.success.push(element);
                                    });
                                } else {
                                    response.success.push(result.result);
                                }
                            }
                            response.errors.push(output);
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
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SAVE_00005',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        if (response.success.length > 0 && response.errors.length <= 0) {
            process.resolve({
                success: true,
                code: 'SUC_SAVE_00000',
                result: response.success
            });
        } else if (response.success.length <= 0 && response.errors.length > 0) {
            process.reject({
                success: false,
                code: 'ERR_SAVE_00000',
                error: response.errors
            });
        } else {
            process.resolve({
                success: false,
                code: 'ERR_SAVE_00003',
                result: response.success,
                error: response.errors
            });
        }
    },

    handleErrorEnd: function (request, response, process) {
        process.reject({
            success: false,
            code: 'ERR_SAVE_00000',
            error: response.error
        });
    }
};