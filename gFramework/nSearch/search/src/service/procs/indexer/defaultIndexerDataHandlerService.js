/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/service/procs/indexer/defaultIndexerDataHandlerService
 * @description Implements nSearch default indexer data handler service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

    /**

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to process Indexer data handler');
        if (!request.models) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid data object to process'));
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
            SERVICE.DefaultProcessorHandlerService.executeSearchProcessors([].concat(indexerConfig.processors), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes apply interceptors behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyInterceptors: function (request, response, process) {
        this.LOG.debug('Applying indexer interceptors');
        request.moduleName = request.moduleName || request.header.options.moduleName;
        let indexName = request.indexName || request.header.options.indexName || request.header.local.indexerConfig.target.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.index) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.index), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes apply validators behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    applyValidators: function (request, response, process) {
        this.LOG.debug('Applying indexer validators');
        request.indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, request.indexName);
        if (validators && validators.index) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.index), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes indexer pipeline behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

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
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00000'));
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes data behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

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
        } catch (error) {
            process.error(request, response, error);
        }
    },

    /**

     * Processes models behavior.

     *

     * @param {*} request Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

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