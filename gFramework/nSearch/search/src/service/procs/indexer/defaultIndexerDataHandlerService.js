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
        this.LOG.debug('Validating request to process Indexer data handler');
        if (!request.models) {
            process.error(request, response, 'Invalid data object to process');
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * This function is used to execute processors those are configured at indexer level
     * @param {*} request 
     * @param {*} response 
     * @param {*} process 
     */
    applyProcessors: function (request, response, process) {
        this.LOG.debug('Applying indexer processors');
        if (request.header && request.header.local && request.header.local.indexerConfig && request.header.local.indexerConfig.processors) {
            let indexerConfig = request.header.local.indexerConfig;
            SERVICE.DefaultProcessorHandlerService.executeSearchProcessors([].concat(indexerConfig.processors), {
                tenant: request.tenant,
                moduleName: request.moduleName,
                header: request.header,
                models: request.models,
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
        let moduleName = request.moduleName || request.header.options.moduleName;
        let indexName = request.indexName || request.header.options.indexName || request.header.local.indexerConfig.target.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.index) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.index), {
                tenant: request.tenant,
                moduleName: moduleName,
                header: request.header,
                models: request.models,
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

    executeIndexerPipeline: function (request, response, process) {
        if (request.header && request.header.local && request.header.local.indexerConfig && request.header.local.indexerConfig.processPipeline) {
            try {
                let indexerConfig = request.header.local.indexerConfig;
                SERVICE.DefaultPipelineService.start(indexerConfig.processPipeline, {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: request.header,
                    models: request.models,
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
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
            if (request.header.options.finalizeData) {
                SERVICE.DefaultPipelineService.start('writeDataIntoFileInitializerPipeline', {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: request.header,
                    models: request.models,
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
                    process.error(request, response, error);
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
                    header: request.header,
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