/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
var sizeof = require('object-sizeof');
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
        this.LOG.debug('Validating internal indexer request');
        process.nextSuccess(request, response);
    },

    prepareHeader: function (request, response, process) {
        this.LOG.debug('Building options for internal indexer');
        request.dataHeader = {
            options: {
                indexName: request.target.indexName,
                typeName: request.target.typeName,
                operation: request.indexerConfig.target.operation || CONFIG.get('search').defaultDoSaveOperation || 'doSave',
                tenants: [request.tenant],
                moduleName: request.moduleName
            }
        };
        process.nextSuccess(request, response);
    },

    prepareOutputPath: function (request, response, process) {
        let indexerConfig = request.indexerConfig;
        if (indexerConfig.dumpData) {
            this.LOG.debug('Preparing output file path');
            let tempPath = (indexerConfig.target.tempPath) ? indexerConfig.target.tempPath + '/search/' + indexerConfig.target.indexName : NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/search/' + indexerConfig.target.indexName;
            request.outputPath = {
                destDir: tempPath,
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

    initFatchData: function (request, response, process) {
        this.LOG.debug('Changing state of current indexer: ' + request.indexerConfig.code);
        let query = _.merge({}, request.indexerConfig.schema.query || {});
        let queryOptions = _.merge({}, request.indexerConfig.schema.options || {});
        queryOptions.projection = _.merge({ _id: 0 }, queryOptions.projection || {});
        this.fatchData(request, {
            queryOptions: queryOptions,
            query: query,
            readBytes: 0,
            readBufferSize: (request.options && request.options.readBufferSize && request.options.readBufferSize > 0) ? request.options.readBufferSize : CONFIG.get('data').readBufferSize,
            pageNumber: 1,
            finalData: [],
        }).then(success => {
            response.success = 'Succesfully indexed data';
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    fatchData: function (request, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                options.queryOptions.pageNumber = options.pageNumber;
                if (NODICS.isModuleActive(request.source.moduleName)) {
                    request.schemaService.get({
                        tenant: request.tenant,
                        options: options.queryOptions,
                        query: options.query
                    }).then(data => {
                        _self.processData(request, options, data, resolve, reject);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                        moduleName: request.source.moduleName,
                        methodName: 'POST',
                        apiName: '/' + request.source.schemaName,
                        requestBody: {
                            options: options.queryOptions,
                            query: options.query
                        },
                        isJsonResponse: true,
                        header: {
                            authToken: request.authToken
                        }
                    }), (error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            _self.processData(request, options, data, resolve, reject);
                        }
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    },
    processData: function (request, options, data, resolve, reject) {
        let _self = this;
        try {
            if (data.success && data.result && data.result.length > 0) {
                options.readBytes = options.readBytes + sizeof(data.result);
                if (options.readBytes > options.readBufferSize && options.finalData.length > 0) {
                    if (request.outputPath) {
                        request.outputPath.version = request.outputPath.version + 1;
                    }
                    SERVICE.DefaultPipelineService.start('finalizeIndexerDataPipeline', {
                        tenant: request.tenant,
                        moduleName: request.moduleName,
                        source: request.source,
                        target: request.target,
                        indexerConfig: request.indexerConfig,
                        dataHeader: request.dataHeader,
                        models: options.finalData,
                        schemaModel: request.schemaModel,
                        searchModel: request.searchModel,
                        schemaService: request.schemaService,
                        searchService: request.searchService,
                        outputPath: request.outputPath
                    }, {}).then(success => {
                        options.finalData = data.result;
                        options.pageNumber = options.pageNumber + 1;
                        options.readBytes = sizeof(options.finalData);
                        _self.fatchData(request, options).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    options.finalData = options.finalData.concat(data.result);
                    options.pageNumber = options.pageNumber + 1;
                    _self.fatchData(request, options).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else if (data.success && data.result && data.result.length <= 0) {
                if (options.finalData && options.finalData.length > 0) {
                    if (request.outputPath) {
                        request.outputPath.version = request.outputPath.version + 1;
                    }
                    SERVICE.DefaultPipelineService.start('finalizeIndexerDataPipeline', {
                        tenant: request.tenant,
                        moduleName: request.moduleName,
                        source: request.source,
                        target: request.target,
                        indexerConfig: request.indexerConfig,
                        dataHeader: request.dataHeader,
                        models: options.finalData,
                        schemaModel: request.schemaModel,
                        searchModel: request.searchModel,
                        schemaService: request.schemaService,
                        searchService: request.searchService,
                        outputPath: request.outputPath
                    }, {}).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } else {
                reject(data);
            }
        } catch (error) {
            reject(error);
        }
    },
    importDumpData: function (request, response, process) {
        try {
            let indexerConfig = request.indexerConfig;
            if (indexerConfig.dumpData) {
                SERVICE.DefaultImportService.processImportData({
                    tenant: request.tenant,
                    inputPath: {
                        rootPath: (indexerConfig.target.tempPath) ? indexerConfig.target.tempPath + '/search' : NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/search',
                        dataType: indexerConfig.target.indexName
                    }
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
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