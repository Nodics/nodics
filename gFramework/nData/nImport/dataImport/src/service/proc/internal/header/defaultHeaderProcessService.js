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

    validateHeader: function (request, response, process) {
        this.LOG.debug('Validating Header: ', request.headerName, ' for processing');
        process.nextSuccess(request, response);
    },

    processHeaderFiles: function (request, response, process) {
        this.LOG.debug('Triggering process to import all files for header');
        try {
            let header = request[request.importType].headers[request.headerName];
            if (!UTILS.isBlank(header.dataFiles)) {
                this.processAllFiles(request, response, {
                    pendingFileList: Object.keys(header.dataFiles)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.debug('There is no data to import for header : ' + request.headerName);
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    processAllFiles: function (request, response, options) {
        let _self = this;
        let header = request[request.importType].headers[request.headerName];
        return new Promise((resolve, reject) => {
            if (options.pendingFileList && options.pendingFileList.length > 0) {
                let fileName = options.pendingFileList.shift(); //Actual Files group name
                _self.LOG.debug('Processing file: ', fileName, ' from header: ', request.headerName);
                let fileObj = header.dataFiles[fileName];
                if (fileObj.list && fileObj.list.length > 0) {
                    SERVICE.DefaultPipelineService.start(CONFIG.get('data').fileTypeReaderPipeline[fileObj.type], {
                        fileName: fileName,
                        header: header.header,
                        files: fileObj.list
                    }, {}).then(dataObject => {
                        if (dataObject && dataObject.length > 0) {
                            request.outputPath.fileName = fileName;
                            SERVICE.DefaultPipelineService.start('finalizeDataInitializerPipeline', {
                                dataType: request.dataType,
                                outputPath: request.outputPath,
                                header: header.header,
                                dataObject: dataObject
                            }, {}).then(success => {
                                _self.processAllFiles(request, response, options).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            _self.processAllFiles(request, response, options).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.processAllFiles(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                _self.LOG.debug('Done import for files for header : ', request.headerName);
                header.done = true;
                resolve(true);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug(' Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug(' Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: esponse.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};