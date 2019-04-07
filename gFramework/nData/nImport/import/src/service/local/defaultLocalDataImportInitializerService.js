/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fse = require('fs-extra');
const util = require('util');

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
        if (!request.headerPath) {
            process.error(request, response, 'Please validate request. Mandate property modules not have valid value');
        } if (!request.dataPath) {
            process.error(request, response, 'Please validate request. Mandate property modules not have valid value');
        } else {
            request.data = {};
            process.nextSuccess(request, response);
        }
    },

    prepareOutputURL: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        request.outputPath = {
            destDir: NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/local',
            importType: 'local',
            successPath: request.successPath + '/success',
            errorPath: request.errorPath + '/error'
        };
        process.nextSuccess(request, response);
    },

    flushOutputFolder: function (request, response, process) {
        this.LOG.debug('Cleaning output directory : ' + request.outputPath.destDir);
        fse.remove(request.outputPath.destDir).then(() => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },


    loadHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of headers from Path to be imported: ', request.path);
        SERVICE.DefaultImportUtilityService.getLocalHeaderFiles(request.headerPath).then(success => {
            request.data.headerFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    buildHeaderInstances: function (request, response, process) {
        this.LOG.debug('Generating header instances from header files');
        try {
            if (request.data && request.data.headerFiles) {
                if (!request.data.headers) {
                    request.data.headers = {};
                }
                _.each(request.data.headerFiles, (list, name) => {
                    list.forEach(element => {
                        let fileObj = require(element);
                        _.each(fileObj, (moduleObject, moduleName) => {
                            _.each(moduleObject, (headerObj, headerName) => {
                                headerObj.options.moduleName = headerObj.options.moduleName || moduleName;
                                headerObj.options.fileName = name;
                                headerObj.options.filePath = element;
                                headerObj.options.done = false;
                                headerObj.options.dataHandler = CONFIG.get('data').dataHandlerPipeline || 'dataHandlerPipeline';
                                if (!request.data.headers[headerName]) {
                                    request.data.headers[headerName] = {
                                        header: headerObj,
                                        dataFiles: {}
                                    };
                                } else {
                                    throw new Error('Same header: ' + headerName + 'can not be in two different header files');
                                }
                            });
                        });
                    });
                });
            }
            delete request.data.headerFiles;
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }

    },

    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of files from Path to be imported');
        if (request.data.headers && Object.keys(request.data.headers).length > 0) {
            Object.keys(request.data.headers).forEach(headerName => {
                let headerData = request.data.headers[headerName];
                let filePrefix = headerData.header.options.dataFilePrefix || headerName;
                let fileList = {};
                SERVICE.DefaultImportUtilityService.getAllFrefixFiles(request.dataPath, fileList, filePrefix);
                _.each(fileList, (dataFile, name) => {
                    if (headerData.dataFiles[name]) {
                        headerData.dataFiles[name].push(dataFile);
                    } else {
                        headerData.dataFiles[name] = [dataFile];
                    }
                });
            });
            process.nextSuccess(request, response);
        } else {
            this.LOG.debug('Could not found any header to import local data');
            process.nextSuccess(request, response);
        }
    },

    resolveFileType: function (request, response, process) {
        this.LOG.debug('Resolving file type');
        if (request.data.headers && Object.keys(request.data.headers).length > 0) {
            Object.keys(request.data.headers).forEach(headerName => {
                let headerData = request.data.headers[headerName];
                let dataFiles = {};
                _.each(headerData.dataFiles, (list, name) => {
                    let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                    dataFiles[name] = {
                        type: fileType,
                        list: list,
                        processedRecords: []
                    };
                });
                headerData.dataFiles = dataFiles;
            });
        }
        process.nextSuccess(request, response);
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