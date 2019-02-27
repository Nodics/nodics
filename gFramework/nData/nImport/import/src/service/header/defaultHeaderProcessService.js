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
        this.LOG.debug('Validating Header: ', request.headerName, ' for processing');
        process.nextSuccess(request, response);
    },

    processHeaderFiles: function (request, response, process) {
        this.LOG.debug('Triggering process to import all files for header');
        try {
            let header = request.header;
            if (!UTILS.isBlank(header.dataFiles)) {
                this.processFiles(request, response, {
                    pendingFileList: Object.keys(header.dataFiles)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
                // if (CONFIG.get('data').finalizeImportDataAsync) {
                //     let allFileTypes = [];
                //     Object.keys(header.dataFiles).forEach(fileName => {
                //         let fileObj = header.dataFiles[fileName];
                //         let outputPath = _.merge({}, request.outputPath);
                //         outputPath.fileName = fileName;
                //         outputPath.fileType = fileName.split('_').pop();
                //         allFileTypes.push(SERVICE.DefaultPipelineService.start('dataFinalizerInitPipeline', {
                //             files: fileObj.list,
                //             outputPath: outputPath,
                //             header: header.header
                //         }, {}));
                //     });
                //     Promise.all(allFileTypes).then(success => {
                //         process.nextSuccess(request, response);
                //     }).catch(errors => {
                //         if (errors instanceof Array) {
                //             errors.forEach(err => {
                //                 response.errors.push(err);
                //             });
                //             process.error(request, response);
                //         } else {
                //             process.error(request, response, errors);
                //         }
                //     });
                // } else {
                //     this.processFiles(request, response, {
                //         pendingFileList: Object.keys(header.dataFiles)
                //     }).then(success => {
                //         process.nextSuccess(request, response);
                //     }).catch(error => {
                //         process.error(request, response, error);
                //     });
                // }
            } else {
                this.LOG.debug('There is no data to import for header : ' + request.headerName);
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    processFiles: function (request, response, options) {
        let _self = this;
        let header = request.header;
        return new Promise((resolve, reject) => {
            if (options.pendingFileList && options.pendingFileList.length > 0) {
                let fileName = options.pendingFileList.shift(); //Actual Files group name
                _self.LOG.debug('Processing file: ', fileName, ' from header: ', request.headerName);
                let fileObj = header.dataFiles[fileName];
                if (fileObj.list && fileObj.list.length > 0) {
                    request.outputPath.fileName = fileName;
                    request.outputPath.fileType = fileName.split('_').pop();
                    if (request.outputPath.fileType) {
                        SERVICE.DefaultPipelineService.start('dataFinalizerInitPipeline', {
                            files: fileObj.list,
                            outputPath: request.outputPath,
                            header: header.header
                        }, {}).then(success => {

                            _self.processFiles(request, response, options).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        reject('Could not found valid ext name for file: ' + fileName);
                    }
                } else {
                    _self.processFiles(request, response, options).then(success => {
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