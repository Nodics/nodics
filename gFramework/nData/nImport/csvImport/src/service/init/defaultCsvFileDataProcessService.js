/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const csv = require('csvtojson');
const fs = require('fs');
var sizeof = require('object-sizeof');


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
        this.LOG.debug('Validating request to process CSV file');
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
        this.handleFiles(request, response, [].concat(request.files), 0).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleFiles: function (request, response, files, index) {
        let _self = this;
        let dataHandler = request.header.options.dataHandler;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                let converter = csv(CONFIG.get('data').csvTypeParserOptions | {});
                let dataChunk = [];
                let readBytes = 0;
                let version = 0;
                converter.fromStream(fs.createReadStream(file)).on('data', (data) => {
                    let strData = JSON.parse(data.toString(CONFIG.get('data').importDataConvertEncoding || 'utf8'));
                    converter.pause();
                    readBytes = readBytes + sizeof(data);
                    if (readBytes > CONFIG.get('data').readBufferSize && dataChunk.length > 0) {
                        request.models = [].concat(dataChunk);
                        request.outputPath.version = index + '_' + version;
                        SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
                            dataChunk = [strData];
                            readBytes = 0;
                            version = version + 1;
                            converter.resume();
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        dataChunk.push(strData);
                        converter.resume();
                    }
                }).on('end', (error) => {
                    if (dataChunk.length > 0) {
                        request.models = [].concat(dataChunk);
                        request.outputPath.version = index + '_' + version;
                        SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
                            _self.handleFiles(request, response, files, ++index).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                }).on('error', (error) => {
                    reject(error);
                });
            } else {
                resolve(true);
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