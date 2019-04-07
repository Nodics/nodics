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
        this.LOG.debug('Validating external indexer request');
        if (!request.source && !request.source.dataPath) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                msg: 'Invalid data file to locate data'
            });
        } else if (!request.target) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                msg: 'Invalid index definition information'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    prepareHeader: function (request, response, process) {
        this.LOG.debug('Building options for internal indexer');
        request.data = {
            headers: {}
        };
        request.data.headers[request.target.indexName + 'DataHeader'] = {
            header: {
                options: {
                    indexName: request.target.indexName,
                    typeName: request.target.typeName,
                    operation: request.indexerConfig.target.operation || CONFIG.get('search').defaultDoSaveOperation || 'doSave',
                    tenants: [request.tenant],
                    moduleName: request.moduleName
                }
            },
            dataFiles: {}
        };
        process.nextSuccess(request, response);
    },

    prepareOutputPath: function (request, response, process) {
        let indexerConfig = request.indexerConfig;
        if (indexerConfig.dumpData) {
            this.LOG.debug('Preparing output file path');
            let tempPath = (indexerConfig.target.tempPath) ? indexerConfig.target.tempPath + '/search/' + indexerConfig.target.indexName : NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/search/' + indexerConfig.target.indexName;
            request.outputPath = {
                destDir: tempPath + '/data',
                successPath: tempPath + '/success',
                errorPath: tempPath + '/error',
                fileName: indexerConfig.target.indexName,
                version: 0
            };
        }
        process.nextSuccess(request, response);
    },

    flushOutputFolder: function (request, response, process) {
        let indexerConfig = request.indexerConfig;
        if (indexerConfig.dumpData) {
            this.LOG.debug('Cleaning output directory : ' + request.outputPath.destDir);
            fse.remove(request.outputPath.destDir).then(() => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of files from Path to be imported');
        if (request.data.headers && Object.keys(request.data.headers).length > 0) {
            Object.keys(request.data.headers).forEach(headerName => {
                let headerData = request.data.headers[headerName];
                let filePrefix = headerData.header.options.dataFilePrefix;
                let fileList = {};
                SERVICE.DefaultImportUtilityService.getAllFrefixFiles(request.source.dataPath, fileList, filePrefix);
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
        console.log(util.inspect(request.data.headers, false, 6));
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
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