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
        if (!request.inputPath.rootPath) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00000', 'Please validate request. Mandate property modules not have valid value'));
        } else {
            request.data = {};
            process.nextSuccess(request, response);
        }
    },

    prepareInputPath: function (request, response, process) {
        this.LOG.debug('Preparing input data path');
        let path = {
            rootPath: request.inputPath.rootPath,
            dataPath: request.inputPath.dataPath || request.inputPath.rootPath + '/data',
            headerPath: request.inputPath.headerPath || request.inputPath.rootPath + '/headers',
            successPath: request.inputPath.successPath || request.inputPath.rootPath + '/success',
            errorPath: request.inputPath.errorPath || request.inputPath.rootPath + '/error',
            importType: 'local'
        };
        request.inputPath = path;
        process.nextSuccess(request, response);
    },

    prepareOutputPath: function (request, response, process) {
        this.LOG.debug('Preparing output data path');
        request.outputPath = request.outputPath || {};
        request.outputPath.rootPath = request.outputPath.rootPath || NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/local';
        let path = {
            rootPath: request.outputPath.rootPath,
            dataPath: request.outputPath.rootPath + '/data',
            successPath: request.outputPath.successPath || request.outputPath.rootPath + '/success',
            errorPath: request.outputPath.errorPath || request.outputPath.rootPath + '/error'
        };
        request.outputPath = path;
        process.nextSuccess(request, response);
    },

    flushOutputFolder: function (request, response, process) {
        this.LOG.debug('Cleaning output directory : ' + request.outputPath.dataPath);
        fse.remove(request.outputPath.dataPath).then(() => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    loadHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of headers from Path to be imported: ' + request.inputPath.headerPath);
        SERVICE.DefaultImportUtilityService.getLocalHeaderFiles(request.inputPath.headerPath).then(success => {
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
                                headerObj.options.dataHandler = (headerObj.options.indexName) ? 'indexerDataHandlerPipeline' : 'schemaDataHandlerPipeline';
                                headerObj.local = headerObj.local || {};
                                headerObj.dataFiles = {};
                                if (headerObj.options.finalizeData === undefined) {
                                    headerObj.options.finalizeData = true;
                                }
                                if (!request.data.headers[headerName]) {
                                    request.data.headers[headerName] = headerObj;
                                } else {
                                    throw new CLASSES.NodicsError('ERR_SYS_00000', 'Same header: ' + headerName + 'can not be in two different header files');
                                }
                            });
                        });
                    });
                });
            }
            delete request.data.headerFiles;
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SYS_00000'));
        }

    },

    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of files from Path to be imported');
        if (request.data.headers && Object.keys(request.data.headers).length > 0) {
            Object.keys(request.data.headers).forEach(headerName => {
                let headerData = request.data.headers[headerName];
                let filePrefix = headerData.options.dataFilePrefix || headerName;
                let fileList = {};
                SERVICE.DefaultImportUtilityService.getAllFrefixFiles(request.inputPath.dataPath, fileList, filePrefix);
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
            process.stop(request, response, {
                code: 'SUC_IMP_00001',
                msg: 'Could not find any data to import for given modules'
            });
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
    }
};