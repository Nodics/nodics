/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateModel: function (request, response, process) {
        this.LOG.debug('Validating input for saving model');
        if (!request.model) {
            process.error(request, response, error);
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
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(request, response, [].concat(interceptors.preSave)).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            })
        } else {
            process.nextSuccess(request, response);
        }
    },

    buildQuery: function (request, response, process) {
        this.LOG.debug('building query to save model');
        process.nextSuccess(request, response);
    },

    saveModel: function (request, response, process) {
        this.LOG.debug('Saving model');
        request.collection.saveItem(request).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            response.error = error;
            process.nextFailure(request, response);
        });
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post model interceptors');
        let moduleName = request.moduleName || request.collection.moduleName;
        let modelName = request.collection.modelName;
        let interceptors = NODICS.getInterceptors(moduleName, modelName);
        if (interceptors && interceptors.postSave) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors(request, response, [].concat(interceptors.postSave)).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            })
        } else {
            process.nextSuccess(request, response);
        }
    },

    invalidateCache: function (request, response, process) {
        this.LOG.debug('Invalidating cache for modified model');
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Request has been processed successfully');
        response.modelSaveInitializerPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Request has been processed with some failures: ', response.errors);
        response.modelSaveInitializerPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Request has been processed and got errors: ', response.errors);
        response.modelSaveInitializerPipeline.promise.reject(response);
    }
};