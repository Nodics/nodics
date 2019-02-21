/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

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
        this.LOG.debug('Validating request to process JS file');
        if (!request.files || !(request.files instanceof Array) || request.files.length <= 0) {
            process.error(request, response, 'Invalid file path to read data');
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, 'Invalid output path to write data');
        } else {
            process.nextSuccess(request, response);
        }
    },

    processDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        this.handleFiles(request, response, [].concat(request.files)).then(dataObject => {
            if (dataObject && Object.keys(dataObject).length > 0) {
                request.dataObject = [];
                Object.keys(dataObject).forEach(key => {
                    request.dataObject.push(dataObject[key]);
                });
                request.outputPath.version = '0_0';
                SERVICE.DefaultPipelineService.start('dataHandlerPipeline', request, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.warn('No data foud to import in files: ' + request.files);
                process.nextSuccess(request, response);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleFiles: function (request, response, files, dataObject = {}) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                dataObject = _.merge(dataObject, require(file));
                _self.handleFiles(request, response, files, dataObject).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(dataObject);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
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