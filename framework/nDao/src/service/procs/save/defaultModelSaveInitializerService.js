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
            response.success = false;
            delete response.result;
            delete response.msg;
            delete response.code;
            response.errors.PROC_ERR_0003 = {
                code: 'ERR003',
                msg: 'Model to be saved can not be null in request'
            };
            process.nextFailure(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre model interceptors');
        process.nextSuccess(request, response);
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
        process.nextSuccess(request, response);
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
        this.LOG.debug('Request has been processed with some failures');
        response.modelSaveInitializerPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Request has been processed and got errors');
        response.modelSaveInitializerPipeline.promise.reject(response);
    }
};