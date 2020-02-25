/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fse = require('fs-extra');

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
        if (!request.modules && !UTILS.isArray(request.modules) && request.modules.length <= 0) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00000', 'Please validate request. Mandate property modules not have valid value'));
        } else {
            request.data = {};
            process.nextSuccess(request, response);
        }
    },

    prepareInputPath: function (request, response, process) {
        this.LOG.debug('Preparing input data path');
        request.inputPath = {
            importType: 'system',
            dataType: request.dataType,
        };
        process.nextSuccess(request, response);
    },

    prepareOutputPath: function (request, response, process) {
        this.LOG.debug('Preparing output data path');
        let rootPath = NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/' + request.dataType;
        request.outputPath = {
            rootPath: rootPath,
            dataPath: rootPath + '/data',
            successPath: rootPath + '/success',
            errorPath: rootPath + '/error'
        };
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
        this.LOG.debug('Loading list of header files from modules to be imported');
        SERVICE.DefaultImportUtilityService.getSystemDataHeaders(request.modules, request.inputPath.dataType).then(success => {
            request.data.headerFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },


    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of data files from modules to be imported');
        SERVICE.DefaultImportUtilityService.getSystemDataFiles(request.modules, request.inputPath.dataType).then(success => {
            request.data.dataFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    resolveFileType: function (request, response, process) {
        this.LOG.debug('Resolving file type');
        if (request.data && request.data.dataFiles) {
            _.each(request.data.dataFiles, (list, name) => {
                let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                request.data.dataFiles[name] = {
                    type: fileType,
                    list: list,
                    processedRecords: []
                };
            });
        }
        process.nextSuccess(request, response);
    },

    buildHeaderInstances: function (request, response, process) {
        this.LOG.debug('Generating header instances from header files');
        let internalHeaderObj = {};
        if (request.data && request.data.headerFiles) {
            _.each(request.data.headerFiles, (list, name) => {
                list.forEach(element => {
                    internalHeaderObj[name] = _.merge(internalHeaderObj[name] || {}, require(element));
                });
            });
            _.each(internalHeaderObj, (headerFile, headerFileName) => {
                _.each(headerFile, (moduleHeaders, moduleName) => {
                    _.each(moduleHeaders, (header, headerName) => {
                        if (header.options.enabled) {
                            if (!request.data.headers) {
                                request.data.headers = {};
                            }
                            if (!request.data.headers[headerName]) {
                                request.data.headers[headerName] = {};
                            }
                            request.data.headers[headerName] = _.merge(request.data.headers[headerName], header);
                            request.data.headers[headerName].options.moduleName = moduleName;
                            request.data.headers[headerName].dataFiles = {};
                            request.data.headers[headerName].options.dataHandler = (request.data.headers[headerName].options.indexName) ? 'indexerDataHandlerPipeline' : 'schemaDataHandlerPipeline';
                            request.data.headers[headerName].local = request.data.headers[headerName].local || {};
                            if (request.data.headers[headerName].options.finalizeData === undefined) {
                                request.data.headers[headerName].options.finalizeData = true;
                            }
                        }
                    });
                });
            });
        }
        process.nextSuccess(request, response);
    },

    assignDataFilesToHeader: function (request, response, process) {
        this.LOG.debug('Associating data files with corresponding headers');
        if (request.data && request.data.headers) {
            _.each(request.data.headers, (headerObject, headerName) => {
                let dataPreFix = headerObject.options.dataFilePrefix || headerName;
                _.each(request.data.dataFiles, (object, fileName) => {
                    if (fileName.startsWith(dataPreFix)) {
                        headerObject.dataFiles[fileName] = object;
                    }
                });
            });
            delete request.data.headerFiles;
            delete request.data.dataFiles;
            process.nextSuccess(request, response);
        } else {
            process.stop(request, response, {
                code: 'SUC_IMP_00001',
                msg: 'Could not find any data to import for given modules'
            });
        }
    }
};