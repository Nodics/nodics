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
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00000', 'Invalid file path to read data'));
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00000', 'Invalid output path to write data'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    processDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        this.handleFiles(request, response, [].concat(request.files)).then(models => {
            let dataHandler = request.header.options.dataHandler;
            if (models && Object.keys(models).length > 0) {
                request.models = [];
                Object.keys(models).forEach(key => {
                    request.models.push(models[key]);
                });
                request.outputPath.version = '0_0';
                SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
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

    handleFiles: function (request, response, files, models = {}) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                models = _.merge(models, require(file));
                _self.handleFiles(request, response, files, models).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(models);
            }
        });
    }
};