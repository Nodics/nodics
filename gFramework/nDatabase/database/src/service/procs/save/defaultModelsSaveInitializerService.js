/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
        if (!request.models) {
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
            request.originalQuery = _.merge({}, request.query || {});
        }
        this.handleModelsSave(request, response, request.models).then(success => {
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
     * @sideEffects Consumes `models`, writes `response.success`, and writes `response.failed`.
     */
    handleModelsSave: function (request, response, models) {
        return new Promise((resolve, reject) => {
            if (models && models.length > 0) {
                request.model = models.shift();
                try {
                    SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', {
                        tenant: request.tenant,
                        authData: request.authData,
                        schemaModel: request.schemaModel,
                        query: _.merge({}, request.originalQuery),
                        model: request.model
                    }, {}).then(success => {
                        if (!response.success) response.success = [];
                        response.success.push(success.result);
                        this.handleModelsSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        if (!response.failed) response.failed = [];
                        error.metadata = request.model;
                        response.failed.push(error);
                        this.handleModelsSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_SAVE_00000'));
                }
            } else {
                resolve(true);
            }
        });
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
                output.errors.push(error.toJson());
            });
        }
        process.resolve(output);
    }
};
