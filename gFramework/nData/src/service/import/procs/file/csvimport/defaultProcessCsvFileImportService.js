/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    loadFileData: function (request, response, process) {
        this.LOG.debug('Loading data from JS file: ', request.fileName);
        process.nextSuccess(request, response);
    },

    importFileData: function (request, response, process) {
        this.LOG.debug('Importing data from JS file: ', request.fileName);
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('CSV file import Process Request has been processed successfully');
        response.processCsvFileImportPipeline.promise.resolve(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('CSV file import  Process Request has been processed and got errors : ');
        response.processCsvFileImportPipeline.promise.reject(response);
    }
};