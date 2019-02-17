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
            process.error(request, response, 'Please validate request. Mandate property modules not have valid value');
        } else {
            request.internal = {};
            process.nextSuccess(request, response);
        }
    },

    loadInternalHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of header files from modules to be imported');
        SERVICE.DefaultImportUtilityService.getInternalDataHeaders(request.modules, request.dataType).then(success => {
            request.internal.headerFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    loadInternalDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of data files from modules to be imported');
        SERVICE.DefaultImportUtilityService.getInternalFiles(request.modules, request.dataType).then(success => {
            request.internal.dataFiles = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    resolveFileType: function (request, response, process) {
        this.LOG.debug('Resolving file type');
        if (request.internal && request.internal.dataFiles) {
            _.each(request.internal.dataFiles, (list, name) => {
                let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                request.internal.dataFiles[name] = {
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
        if (request.internal && request.internal.headerFiles) {
            _.each(request.internal.headerFiles, (list, name) => {
                list.forEach(element => {
                    internalHeaderObj[name] = _.merge(internalHeaderObj[name] || {}, require(element));
                });
            });

            _.each(internalHeaderObj, (headerFile, headerFileName) => {
                _.each(headerFile, (moduleHeaders, moduleName) => {
                    if (NODICS.isModuleActive(moduleName)) {
                        _.each(moduleHeaders, (header, headerName) => {
                            if (!request.internal.headers) {
                                request.internal.headers = {};
                            }
                            if (!request.internal.headers[headerName]) {
                                request.internal.headers[headerName] = {
                                    header: {},
                                    dataFiles: {}
                                };
                            }
                            request.internal.headers[headerName].header = _.merge(request.internal.headers[headerName].header, header);
                            request.internal.headers[headerName].header.options.moduleName = moduleName;
                        });
                    }
                });
            });
        }
        process.nextSuccess(request, response);
    },

    assignDataFilesToHeader: function (request, response, process) {
        this.LOG.debug('Associating data files with corresponding headers');
        if (request.internal && request.internal.headers) {
            _.each(request.internal.headers, (headerObject, headerName) => {
                let dataPreFix = headerObject.header.options.dataFilePrefix || headerName;
                _.each(request.internal.dataFiles, (object, fileName) => {
                    if (fileName.startsWith(dataPreFix)) {
                        headerObject.dataFiles[fileName] = object;
                    }
                });
            });
        }
        delete request.internal.headerFiles;
        delete request.internal.dataFiles;
        process.nextSuccess(request, response);
    },

    prepareOutputURL: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        request.outputPath = {
            destDir: NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/' + request.dataType,
            //fileName: request.outputFileName,
            dataType: request.dataType,
            importType: 'import' // In-case of export, value will be 'export'
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

    processInternalDataHeaders: function (request, response, process) {
        this.LOG.debug('Starting internal data import process');
        try {
            if (request.internal && request.internal.headers) {
                this.processHeaders(request, response, {
                    importType: 'internal',
                    pendingHeaders: Object.keys(request.internal.headers)
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.debug('No data found from internal path to import');
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
                let headers = request[options.importType].headers;
                let headerName = options.pendingHeaders.shift();
                let header = headers[headerName];
                if (!header.done || header.done === false) {
                    this.LOG.debug('Starting process for header: ', headerName);
                    request.importType = options.importType;
                    request.headerName = headerName;
                    SERVICE.DefaultPipelineService.start('internalHeaderProcessPipeline', request, {}).then(success => {
                        this.processHeaders(request, response, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    this.processHeaders(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
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
        this.LOG.debug('Request has been processed and got errors');
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