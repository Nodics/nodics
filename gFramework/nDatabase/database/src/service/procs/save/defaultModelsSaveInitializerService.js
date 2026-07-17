/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/procs/save/DefaultModelsSaveInitializerService
 * @description Pipeline step service for generated bulk save operations. It
 * validates model lists, runs bulk processors, delegates each model to the
 * single-model save pipeline, aggregates successes/failures, and resolves a
 * stable bulk response.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override bulk save steps to customize batching,
 * partial failure policy, or processors while preserving generated CRUD response
 * shape.
 *
 * @property {Object[]} request.models Models to save.
 * @property {Object[]} response.success Successful saved models.
 * @property {Object[]} response.failed Failed save errors with model metadata.
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
     * Validates that bulk save input contains models.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for saving models');
        if (!Array.isArray(request.models) || request.models.length === 0) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SAVE_00003', 'Models can not be null or empty for save operation'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Executes pre-save processors configured on the schema.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    preProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.preSaveProcessor && interceptors.preSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.preSaveProcessor), request, response, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Processes each model through the single-model save pipeline.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    processModels: function (request, response, process) {
        this.LOG.debug('Processing models');
        if (request.query && !UTILS.isBlank(request.query)) {
            request.originalQuery = _.cloneDeep(request.query || {});
        }
        this.handleModelsSave(request, response, request.models.slice()).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**
     * Saves models sequentially and aggregates success/failure output.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object[]} models Mutable model list to process.
     * @returns {Promise<boolean>} Resolves after all models have been attempted.
     * @sideEffects Writes `response.success`, writes `response.failed`, and updates `request.model` with the model being processed.
     */
    handleModelsSave: function (request, response, models) {
        let modelList = Array.isArray(models) ? models.slice() : [];
        let modelSavePromise = Promise.resolve(true);
        modelList.forEach(model => {
            modelSavePromise = modelSavePromise.then(() => this.saveSingleModel(request, response, model));
        });
        return modelSavePromise;
    },

    /**
     * Saves one model through the single-model save pipeline and records its result.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} model Model being saved.
     * @returns {Promise<boolean>} Resolves after this model has been recorded.
     * @sideEffects Updates `request.model`, `response.success`, and `response.failed`.
     */
    saveSingleModel: function (request, response, model) {
        request.model = model;
        try {
            return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', {
                tenant: request.tenant,
                authData: request.authData,
                schemaModel: request.schemaModel,
                query: _.cloneDeep(request.originalQuery || {}),
                model: model
            }, {}).then(success => {
                if (!response.success) response.success = [];
                response.success.push(success.result);
                return true;
            }).catch(error => {
                this.addFailure(response, error, model);
                return true;
            });
        } catch (error) {
            return Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_SAVE_00000'));
        }
    },

    /**
     * Records a model save failure without assuming framework-specific error shape.
     *
     * @param {Object} response Pipeline response accumulator.
     * @param {Error|Object|string} error Failure returned by the single-model save pipeline.
     * @param {Object} model Model metadata associated with the failure.
     * @returns {undefined}
     */
    addFailure: function (response, error, model) {
        if (!response.failed) response.failed = [];
        let failure = error && typeof error === 'object' ? error : new CLASSES.NodicsError(error, null, 'ERR_SAVE_00000');
        failure.metadata = _.cloneDeep(model);
        response.failed.push(failure);
    },

    /**
     * Converts a save failure into response-safe JSON.
     *
     * @param {Error|Object|string} error Failure captured during model save.
     * @returns {Object} Serialized error payload.
     */
    serializeFailure: function (error) {
        if (error && typeof error.toJson === 'function') {
            return error.toJson();
        }
        return {
            code: error && error.code ? error.code : 'ERR_SAVE_00000',
            message: error && error.message ? error.message : String(error),
            metadata: error && error.metadata ? error.metadata : undefined
        };
    },

    /**
     * Executes post-save processors configured on the schema.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    postProcessor: function (request, response, process) {
        this.LOG.debug('Applying post processors in models');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.postSaveProcessor && interceptors.postSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.postSaveProcessor), request, response, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Resolves the final bulk save response.
     *
     * @param {Object} request Nodics bulk save request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     * @sideEffects Calls `process.resolve` with bulk result and errors.
     */
    handleSucessEnd: function (request, response, process) {
        let code = 'SUC_SAVE_00000';
        if (response.failed && response.failed.length > 0) {
            code = (response.success && response.success.length > 0) ? 'SUC_SAVE_00001' : 'ERR_SAVE_00000';
        }
        let output = {
            success: code === 'SUC_SAVE_00000' ? true : false,
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
