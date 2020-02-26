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
        this.LOG.debug('Validating request to process schema data handler');
        if (!request.models) {
            process.error(request, response, new CLASSES.DataError('ERR_DATA_00003', 'Invalid data object to process'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyProcessors: function (request, response, process) {
        this.LOG.debug('Applying schema processors in models');
        if (request.header && request.header.options && request.header.options.processors) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(request.header.options.processors), {
                tenant: request.tenant,
                moduleName: request.moduleName,
                header: request.header,
                models: request.models,
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.DataError(error, 'pre processors execution error', 'ERR_DATA_00009'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyInterceptors: function (request, response, process) {
        this.LOG.debug('Applying interceptors in models');
        let schemaName = request.header.options.schemaName;
        let interceptors = SERVICE.DefaultDataConfigurationService.getImportInterceptors(schemaName);
        if (interceptors && interceptors.import && interceptors.import.length > 0) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.import), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.DataImportError(error, 'Failed import interceptors execution', 'ERR_DATA_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyValidators: function (request, response, process) {
        this.LOG.debug('Applying validators in models');
        let schemaName = request.header.options.schemaName;
        let interceptors = SERVICE.DefaultDataConfigurationService.getImportValidators(request.tenant, schemaName);
        if (interceptors && interceptors.import && interceptors.import.length > 0) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(interceptors.import), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.DataImportError(error, 'Failed import validators execution', 'ERR_DATA_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeSchemaPipeline: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        let processPipeline = 'defaultImportDataFilterPipeline';
        if (request.header.options && request.header.options.processPipeline) {
            processPipeline = request.header.options.processPipeline;
        }
        SERVICE.DefaultPipelineService.start(processPipeline, {
            header: request.header,
            models: request.models,
            outputPath: request.outputPath
        }, {}).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.DataImportError(error, 'Failed executing data filter pileline', 'ERR_DATA_00000'));
        });
    },

    processData: function (request, response, process) {
        let _self = this;
        try {
            if (request.models && request.models.length > 0) {
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
                        process.error(request, response, error);
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
            } else {
                _self.LOG.warn('None data found to import');
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, new CLASSES.DataImportError(error, 'No data to finalize or process', 'ERR_IMP_00007'));
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
    }
};