/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to finalize import data');
        if (!request.header && UTILS.isBlank(request.header)) {
            process.error(request, response, 'Please validate request. Mandate header not found');
        } else if (!request.outputFileName) {
            process.error(request, response, 'Please validate request. Mandate output path not found');
        } else {
            process.nextSuccess(request, response);
        }
    },

    prepareOutputURL: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        request.outputPath = {
            destDir: NODICS.getServerPath() + '/' + CONFIG.get('dataDirName'),
            fileName: outputFileName,
            importType: 'import' // In-case of export, value will be 'export'
        };
        process.nextSuccess(request, response);
    },

    redirectToImportType: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        if (request.dataObject && request.dataObject instanceof Array && request.dataObject.length > 0) {
            this.LOG.debug('Redirecting to finalize local data');
            response.targetNode = 'finalizeLocalData';
            process.nextSuccess(request, response);
        } else if (request.inputFileName) {
            this.LOG.debug('Redirecting to finalize external file data');
            response.targetNode = 'finalizeExternalFileData';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, 'Please validate request. nither found dataObject nor filePath');
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response);
    }
};