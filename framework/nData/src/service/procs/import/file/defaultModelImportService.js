/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validateModelData: function (request, response, process) {
        this.LOG.debug('Loading data from JS file: ', request.fileName);
        process.nextSuccess(request, response);
    },
    populateDependancies: function (request, response, process) {
        this.LOG.debug('Loading data from JS file: ', request.fileName);
        process.nextSuccess(request, response);
    },
    insertData: function (request, response, process) {
        this.LOG.debug('Loading data from JS file: ', request.fileName);
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed successfully');
        response.modelImportPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed with some failures : ');
        response.modelImportPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed and got errors : ');
        response.modelImportPipeline.promise.reject(response);
    }
};