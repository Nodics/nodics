/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    applyProcessors: function (request, response, process) {
        this.LOG.debug('Applying indexer processors');
        let indexerConfig = request.indexerConfig;
        if (indexerConfig.processors) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(indexerConfig.processors), {
                tenant: request.tenant,
                moduleName: request.moduleName,
                indexerConfig: request.indexerConfig,
                dataHeader: request.dataHeader,
                models: options.finalData,
                schemaModel: request.schemaModel,
                searchModel: request.searchModel,
                indexService: request.indexService,
                outputPath: request.outputPath
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SRCH_00007',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyInterceptors: function (request, response, process) {
        this.LOG.debug('Applying indexer interceptors');
        let moduleName = request.moduleName;
        let indexName = request.indexerConfig.target.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getInterceptors(moduleName, indexName);
        if (interceptors && interceptors.preIndex) {
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.preGet), {
                tenant: request.tenant,
                moduleName: request.moduleName,
                indexerConfig: request.indexerConfig,
                dataHeader: request.dataHeader,
                models: options.finalData,
                schemaModel: request.schemaModel,
                searchModel: request.searchModel,
                indexService: request.indexService,
                outputPath: request.outputPath
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SRCH_00008',
                    error: error
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeProcess: function (request, response, process) {
        let indexerConfig = request.indexerConfig;
        if (indexerConfig.processPipeline) {
            try {
                SERVICE.DefaultPipelineService.start(indexerConfig.processPipeline, {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    indexerConfig: request.indexerConfig,
                    dataHeader: request.dataHeader,
                    models: options.finalData,
                    schemaModel: request.schemaModel,
                    searchModel: request.searchModel,
                    indexService: request.indexService,
                    outputPath: request.outputPath
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_SRCH_00008',
                        error: error
                    });
                });
            } catch (error) {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SRCH_00008',
                    error: error
                });
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    processData: function (request, response, process) {
        let _self = this;
        try {
            let indexerConfig = request.indexerConfig;
            if (indexerConfig.dumpData) {
                SERVICE.DefaultPipelineService.start('writeDataIntoFileInitializerPipeline', {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: request.dataHeader,
                    dataObjects: request.models,
                    outputPath: request.outputPath
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } else {
                _self.processModels(request, {
                    pendingModels: request.models
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            }
        } catch (error) {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        }
    },

    processModels: function (request, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.pendingModels && options.pendingModels.length > 0) {
                let model = options.pendingModels.shift();
                SERVICE.DefaultPipelineService.start('processModelImportPipeline', {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: request.dataHeader,
                    dataModel: model
                }, {}).then(success => {
                    _self.processModels(request, options).then(success => {
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