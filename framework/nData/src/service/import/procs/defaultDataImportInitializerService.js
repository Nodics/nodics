/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request');
        if (!request.modules && !request.path) {
            process.error(request, response, 'Please validate request. Mandate property modules or path not found');
        } else {
            process.nextSuccess(request, response);
        }
    },

    redirectToImportType: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        if (request.modules || request.path) {
            this.LOG.debug('Redirecting to importFromFileProcess');
            request.internal = {};
            request.external = {};
            response.targetNode = 'fileImport';
        } else {
            this.LOG.debug('Redirecting to importFromDirectProcess');
            response.targetNode = 'directImport';
        }
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Request has been processed successfully');
        response.dataImportInitializerPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Request has been processed with some failures : ');
        response.dataImportInitializerPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Request has been processed and got errors : ');
        response.dataImportInitializerPipeline.promise.reject(response.result);
    }
};