/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for doSaving models');
        if (!request.models && !request.model) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Models to be saved can not be null in request'));
        } else if (!request.indexName) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid index name to process'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid tenant to process'));
        } else if (!request.searchModel) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
        } else {
            let models = [];
            if (request.models) {
                if (UTILS.isObject(request.models)) {
                    models.push(request.models);
                } else {
                    models = [].concat(request.models);
                }
            } else {
                models.push(request.model);
            }
            request.models = models;
            process.nextSuccess(request, response);
        }
    },

    preProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoSaveProcessor && interceptors.preDoSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.preDoSaveProcessor), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models');
        if (request.query && !UTILS.isBlank(request.query)) {
            request.originalQuery = _.merge({}, request.query || {});
        }
        this.handleModelsDoSave(request, response, request.models).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleModelsDoSave: function (request, response, models) {
        return new Promise((resolve, reject) => {
            if (models && models.length > 0) {
                request.model = models.shift();
                try {
                    SERVICE.DefaultPipelineService.start('doSaveModelInitializerPipeline', request, {}).then(result => {
                        if (!response.success) response.success = [];
                        if (success.result instanceof Array) {
                            response.success = response.success.concat(success.result);
                        } else {
                            response.success.push(success.result);
                        }
                        this.handleModelsDoSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        if (!response.failed) response.failed = [];
                        response.failed.push(error);
                        this.handleModelsDoSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(true);
            }
        });
    },

    postProcessor: function (request, response, process) {
        this.LOG.debug('Applying post processors in models');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoSaveProcessor && interceptors.postDoSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.postDoSaveProcessor), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        let code = 'SUC_SRCH_00000';
        if (response.failed && response.failed.length > 0) {
            code = (response.success && response.success.length > 0) ? 'SUC_SRCH_00001' : 'SUC_SRCH_00000';
        }
        let output = {
            code: code,
            result: response.success
        };
        if (response.failed && response.failed.length > 0) {
            output.errors = [];
            response.failed.forEach(error => {
                output.errors.push(error.toJson());
            });
        }
        process.resolve(output);
    }
};