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
        } else if (!request.outputPath) {
            process.error(request, response, 'Please validate request. Mandate output path not found');
        } else {
            process.nextSuccess(request, response);
        }
    },

    moveToProcessing: function (request, response, process) {
        this.LOG.debug('Moving file to processing state');
        if (request.outputPath.importType !== 'system') {

        } else {

        }
    },

    redirectToImportType: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        if (request.outputPath.importType === 'system') {
            this.LOG.debug('Redirecting to finalize system data');
            response.targetNode = 'finalizeSystemData';
            process.nextSuccess(request, response);
        } else if (request.outputPath.importType === 'local') {
            this.LOG.debug('Redirecting to finalize local file data');
            response.targetNode = 'finalizeLocalFileData';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, 'Please validate request. Mandate output path not found');
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};