/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for saving models');
        if (!request.models && !request.model) {
            process.error(request, response, 'Models to be saved can not be null in request');
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
        this.handleModelsSave(request, response, models).then(success => {
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
                    response.success.push(success);
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

        });
    },

    handleModelSave: function (request, response, model) {
        return new Promise((resolve, reject) => {
            try {
                request.model = model;
                response = {
                    modelSaveInitializerPipeline: {
                        promise: {
                            resolve: resolve,
                            reject: reject
                        }
                    }
                };
                SERVICE.DefaultPipelineService.startPipeline('modelSaveInitializerPipeline', request, response);
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
        response.modelsSaveInitializerPipeline.promise.resolve(response.success);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.error('Request has been processed with some failures');
        response.modelsSaveInitializerPipeline.promise.reject(response.success);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.error('Request has been processed and got errors');
        response.modelsSaveInitializerPipeline.promise.reject(response.result.error);
    }
};