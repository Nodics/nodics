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
        request.header = {
            options: {
                indexName: request.target.indexName,
                typeName: request.target.typeName,
                operation: request.indexerConfig.target.operation || CONFIG.get('search').defaultDoSaveOperation || 'doSave',
                tenants: [request.tenant],
                moduleName: request.moduleName,
                dataHandler: 'indexerDataHandlerPipeline'
            },
            local: {
                indexerConfig: request.indexerConfig,
                schemaModel: request.schemaModel,
                schemaService: request.schemaService,
                source: request.source,
                target: request.target,
                searchModel: request.searchModel,
                searchService: request.searchService
            }
        };
        if (request.header.local.indexerConfig.finalizeData === undefined) {
            request.header.options.finalizeData = true;
        } else {
            request.header.options.finalizeData = request.header.local.indexerConfig.finalizeData;
        }
        process.nextSuccess(request, response);
    },

    prepareInputPath: function (request, response, process) {
        this.LOG.debug('Preparing input data path');
        request.inputPath = {};
        process.nextSuccess(request, response);
    },

    prepareOutputPath: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        request.outputPath = {
            rootPath: request.target.rootPath,
            dataPath: request.target.dataPath,
            successPath: request.target.successPath,
            errorPath: request.target.errorPath,
            fileName: request.target.indexName + 'IndexData',
            version: 0
        };
        process.nextSuccess(request, response);
    },

    flushOutputFolder: function (request, response, process) {
        if (request.header.options.finalizeData) {
            this.LOG.debug('Cleaning output directory : ' + request.outputPath.dataPath);
            fse.remove(request.outputPath.dataPath).then(() => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        let indexerConfig = request.header.local.indexerConfig;

        let query = _.merge({}, indexerConfig.schema.query || {});
        let queryOptions = _.merge({}, indexerConfig.schema.options || {});
        queryOptions.projection = _.merge({ _id: 0 }, queryOptions.projection || {});
        if (indexerConfig.incremental && indexerConfig.lastSuccessTime) {
            query = _.merge(query, {
                updated: {
                    $gte: indexerConfig.lastSuccessTime
                }
            });
        }
        request.query = query;
        request.queryOptions = queryOptions;
        process.nextSuccess(request, response);
    },

    initFatchData: function (request, response, process) {
        this.LOG.debug('Changing state of current indexer: ' + request.header.local.indexerConfig.code);
        this.fatchData(request, {
            queryOptions: request.queryOptions,
            query: request.query,
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
                if (NODICS.isModuleActive(request.header.local.source.moduleName)) {
                    request.header.local.schemaService.get({
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
                        moduleName: request.header.local.source.moduleName,
                        methodName: 'POST',
                        apiName: '/' + request.header.local.source.schemaName,
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
                    SERVICE.DefaultPipelineService.start('indexerDataHandlerPipeline', {
                        tenant: request.tenant,
                        moduleName: request.moduleName,
                        header: request.header,
                        models: options.finalData,
                        inputPath: request.inputPath,
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
                    SERVICE.DefaultPipelineService.start('indexerDataHandlerPipeline', {
                        tenant: request.tenant,
                        moduleName: request.moduleName,
                        header: request.header,
                        models: options.finalData,
                        inputPath: request.inputPath,
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
    importFinalizeData: function (request, response, process) {
        try {
            if (request.header.options.finalizeData) {
                SERVICE.DefaultImportService.processImportData({
                    tenant: request.tenant,
                    inputPath: {
                        rootPath: request.outputPath.rootPath,
                        dataPath: request.outputPath.dataPath,
                        successPath: request.outputPath.successPath,
                        errorPath: request.outputPath.errorPath
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