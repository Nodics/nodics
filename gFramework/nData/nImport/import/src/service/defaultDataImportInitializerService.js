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
        this.LOG.debug('Validating request');
        if (!request.data.headers) {
            process.error(request, response, 'Please validate request. Mandate property headers not have valid value');
        } else if (!request.inputPath) {
            process.error(request, response, 'Please validate request. Mandate property inputPath not have valid value');
        } else if (!request.outputPath) {
            process.error(request, response, 'Please validate request. Mandate property outputPath not have valid value');
        } else {
            process.nextSuccess(request, response);
        }
    },

    processDataHeaders: function (request, response, process) {
        this.LOG.debug('Starting data import process');
        try {
            if (request.data && request.data.headers && Object.keys(request.data.headers).length > 0) {
                this.processHeaders(request, response, {
                    pendingHeaders: Object.keys(request.data.headers)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.debug('No data found to import');
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    processHeaders: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.pendingHeaders && options.pendingHeaders.length > 0) {
                let headers = request.data.headers;
                let headerName = options.pendingHeaders.shift();
                let header = headers[headerName];
                _self.LOG.debug('Starting process for header: ' + headerName);
                SERVICE.DefaultPipelineService.start('headerProcessPipeline', {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: header,
                    headerName: headerName,
                    outputPath: _.merge({}, request.outputPath),
                    inputPath: _.merge({}, request.inputPath)
                }, {}).then(success => {
                    if (request.inputPath.importType && request.inputPath.importType !== 'system') {
                        header.options.done = true;
                        let fileName = header.options.fileName;
                        let headers = Object.keys(request.data.headers);
                        let done = true;
                        for (let count = 0; count < headers.length; count++) {
                            let headerName = headers[count];
                            let headerObj = request.data.headers[headerName];
                            if (fileName === headerObj.options.fileName && !headerObj.options.done) {
                                done = false;
                            }
                        }
                        if (done && header.options.filePath) {
                            SERVICE.DefaultFileHandlerService.moveFile([header.options.filePath], request.inputPath.successPath + '/headers').then(success => {
                                _self.LOG.debug('File has been moved to error folder : ' + header.options.filePath.replace(NODICS.getNodicsHome(), '.'));
                            }).catch(error => {
                                _self.LOG.error('Facing issue while moving file to error folder : ' + header.options.filePath.replace(NODICS.getNodicsHome(), '.'));
                                _self.LOG.error(error);
                            });
                        }
                    }
                    _self.processHeaders(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        let errorFiles = [];
        if (request.inputPath.importType && request.inputPath.importType !== 'system') {
            let headers = Object.keys(request.data.headers);
            for (let count = 0; count < headers.length; count++) {
                let headerName = headers[count];
                let headerObj = request.data.headers[headerName];
                if (!headerObj.options.done && !errorFiles.includes(headerObj.options.filePath)) {
                    errorFiles.push(headerObj.options.filePath);
                }
            }
        }
        if (errorFiles.length > 0) {
            SERVICE.DefaultFileHandlerService.moveFile(errorFiles, request.inputPath.errorPath + '/headers').then(success => {
                this.LOG.debug('File moved to error bucket: ' + success);
            }).catch(error => {
                this.LOG.error(errorFiles);
                this.LOG.error('Facing issued while moving file to error bucket: ', error);
            });
        }
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