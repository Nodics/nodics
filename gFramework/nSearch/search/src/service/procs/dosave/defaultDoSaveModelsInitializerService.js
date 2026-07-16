/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/procs/dosave/defaultDoSaveModelsInitializerService
 * @description Implements nSearch default do save models initializer service business behavior and extension logic.
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

     * Validates input rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for doSaving models');
        if (!request.models && !request.model) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Models to be saved can not be null in request'));
        } else if (!request.indexName) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid index name to process'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid tenant to process'));
        } else if (!request.searchModel) {
            process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
        } else {
            let models = [];
            if (request.models) {
                if (UTILS.isObject(request.models) && !Array.isArray(request.models)) {
                    models.push(request.models);
                } else {
                    models = [].concat(request.models);
                }
            } else {
                models.push(request.model);
            }
            if (models.length === 0) {
                process.error(request, response, new CLASSES.SearchError('ERR_SRCH_00003', 'Models to be saved can not be null in request'));
                return;
            }
            request.models = models;
            process.nextSuccess(request, response);
        }
    },

    /**

     * Runs pre-processing logic for processor.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    preProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoSaveProcessor && interceptors.preDoSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.preDoSaveProcessor), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes models behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models');
        if (request.query && !UTILS.isBlank(request.query)) {
            request.originalQuery = _.cloneDeep(request.query || {});
        }
        this.handleModelsDoSave(request, response, request.models.slice()).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Processes models do save behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} models Method input.

     * @returns {*} Method result.

     */

    handleModelsDoSave: function (request, response, models) {
        let modelList = Array.isArray(models) ? models.slice() : [];
        let savePromise = Promise.resolve(true);
        modelList.forEach(model => {
            savePromise = savePromise.then(() => this.doSaveSingleModel(request, response, model));
        });
        return savePromise;
    },

    /**
     * Saves one search model through the single-model search save pipeline.
     *
     * @param {Object} request Search bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} model Search model to save.
     * @returns {Promise<boolean>} Resolves after this model is recorded.
     */
    doSaveSingleModel: function (request, response, model) {
        request.model = model;
        let saveRequest = Object.assign({}, request, {
            query: _.cloneDeep(request.originalQuery || {}),
            model: model
        });
        try {
            return SERVICE.DefaultPipelineService.start('doSaveModelInitializerPipeline', saveRequest, {}).then(success => {
                if (!response.success) response.success = [];
                if (success.result instanceof Array) {
                    response.success = response.success.concat(success.result);
                } else {
                    response.success.push(success.result);
                }
                return true;
            }).catch(error => {
                this.addFailure(response, error, model);
                return true;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    /**
     * Records one failed search model save with model metadata.
     *
     * @param {Object} response Pipeline response accumulator.
     * @param {Error|Object|string} error Save failure.
     * @param {Object} model Model associated with the failure.
     * @returns {undefined}
     */
    addFailure: function (response, error, model) {
        if (!response.failed) response.failed = [];
        let failure = error && typeof error === 'object' ? error : new CLASSES.SearchError(error, null, 'ERR_SRCH_00000');
        failure.metadata = _.cloneDeep(model);
        response.failed.push(failure);
    },

    /**
     * Converts a failed search save into response-safe JSON.
     *
     * @param {Error|Object|string} error Search save failure.
     * @returns {Object} Serialized failure.
     */
    serializeFailure: function (error) {
        if (error && typeof error.toJson === 'function') {
            return error.toJson();
        }
        return {
            code: error && error.code ? error.code : 'ERR_SRCH_00000',
            message: error && error.message ? error.message : String(error),
            metadata: error && error.metadata ? error.metadata : undefined
        };
    },

    /**

     * Runs post-processing logic for processor.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    postProcessor: function (request, response, process) {
        this.LOG.debug('Applying post processors in models');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoSaveProcessor && interceptors.postDoSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.postDoSaveProcessor), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchError(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes sucess end behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

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
                output.errors.push(this.serializeFailure(error));
            });
        }
        process.resolve(output);
    }
};
