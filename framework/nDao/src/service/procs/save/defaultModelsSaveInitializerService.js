/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for saving model');
        if (!request.models && !request.model) {
            response.success = false;
            delete response.result;
            delete response.msg;
            delete response.code;
            response.errors.PROC_ERR_0003 = {
                code: 'ERR003',
                msg: 'Models to be saved can not be null in request'
            };
            process.nextFailure(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    preProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        process.nextSuccess(request, response);
    },

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models');
        let models = [];
        if (request.models) {
            models = [].concat(request.models);
        } else {
            models.push(request.model);
        }
        request.success = [];
        request.failed = [];
        this.handleModelsSave(request, response, models).then(success => {
            response.result = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleModelsSave: function (request, response, models) {
        return new Promise((resolve, reject) => {
            let model = models.shift();
            try {
                this.handleModelSave(request, response, model).then(success => {
                    request.success.push(success);
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
                    model.error = error;
                    request.failed.push(model);
                    if (models.length > 0) {
                        this.handleModelsSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                });
            } catch (error) {
                reject(error);
            }

        });
    },

    handleModelSave: function (request, response, model) {
        return new Promise((resolve, reject) => {
            try {
                request.model = model;
                response.modelSaveInitializerPipeline = {
                    promise: {
                        resolve: resolve,
                        reject: reject
                    }
                }
                SERVICE.PipelineService.startPipeline('modelSaveInitializerPipeline', request, response);
            } catch (error) {
                reject(error);
            }

        });
    },

    postProcessor: function (request, response, process) {
        this.LOG.debug('Applying post processors in models');
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Request has been processed successfully');
        response.modelsSaveInitializerPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Request has been processed with some failures');
        response.modelsSaveInitializerPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Request has been processed and got errors');
        response.modelsSaveInitializerPipeline.promise.reject(response);
    }
};