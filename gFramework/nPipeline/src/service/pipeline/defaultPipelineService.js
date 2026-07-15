/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module pipeline/service/pipeline/DefaultPipelineService
 * @description Runtime service for loading, updating, removing, and executing
 * Nodics pipelines. It merges static pipeline definitions from active module
 * hierarchy with persisted pipeline models when available, then executes
 * pipelines through `PipelineHead`.
 * @layer service
 * @owner nPipeline
 * @override Project modules may override this service to customize persisted
 * pipeline loading, dynamic update policy, execution strategy, or error
 * terminals while preserving `start(name, request, response)` behavior.
 *
 * @property {Object} PIPELINE Global effective pipeline registry.
 * @property {Object} SERVICE.DefaultFilesLoaderService Loads layered pipeline definition files.
 * @property {Object} CLASSES.PipelineHead Runtime pipeline executor class.
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
     * Loads effective pipeline definitions from files and optional persisted models.
     *
     * @returns {Promise<boolean>} Resolves after the global `PIPELINE` registry is ready.
     * @sideEffects Replaces and mutates global `PIPELINE`.
     */
    loadPipelines: function () {
        return new Promise((resolve, reject) => {
            global.PIPELINE = SERVICE.DefaultFilesLoaderService.loadFiles('/src/pipelines/pipelines.js');
            if (!this.isPersistedPipelineModelAvailable()) {
                this.LOG.warn('Persisted pipeline loading skipped; no pipeline model service is available');
                resolve(true);
                return;
            }
            this.get({
                tenant: CONFIG.get('defaultTenant') || 'default'
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    success.result.forEach(pipelineObj => {
                        if (PIPELINE[pipelineObj.code]) {
                            PIPELINE[pipelineObj.code] = _.merge(PIPELINE[pipelineObj.code], pipelineObj);
                        } else {
                            PIPELINE[pipelineObj.code] = pipelineObj;
                        }
                    });
                }
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Checks whether persisted pipeline models can be read in the current startup context.
     *
     * @returns {boolean} True when this service has generated model access for pipelines.
     */
    isPersistedPipelineModelAvailable: function () {
        if (typeof this.get !== 'function') {
            return false;
        }
        try {
            let models = NODICS.getModels(CONFIG.get('dynamoModuleName') || 'dynamo', CONFIG.get('defaultTenant') || 'default');
            return !!(models && models.PipelineModel);
        } catch (error) {
            return false;
        }
    },

    /**
     * Applies runtime pipeline create/update events to the global registry.
     *
     * @param {Object} request Nodics event request.
     * @param {Object} request.event Event payload.
     * @param {Object} request.event.data Event data containing changed model codes.
     * @returns {Promise<string>} Success message after registry update.
     * @sideEffects Mutates global `PIPELINE`.
     */
    handlePipelineChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                authData: request.authData,
                tenant: request.tenant,
                searchOptions: {
                    projection: { _id: 0 }
                },
                query: {
                    code: {
                        $in: request.event.data.models
                    }
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    success.result.forEach(pipeline => {
                        if (!pipeline.active && PIPELINE[pipeline.code]) {
                            delete PIPELINE[pipeline.code];
                        } else if (PIPELINE[pipeline.code]) {
                            PIPELINE[pipeline.code] = _.merge(PIPELINE[pipeline.code], pipeline);
                        } else {
                            PIPELINE[pipeline.code] = pipeline;
                        }
                    });
                }
                resolve('Successfully pipeline updated');
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Applies runtime pipeline removal events to the global registry.
     *
     * @param {Object} request Nodics event request.
     * @param {Object} request.event Event payload.
     * @param {Object} request.event.data Event data containing removed pipeline models.
     * @returns {Promise<string>} Success message after registry removal.
     * @sideEffects Deletes entries from global `PIPELINE`.
     */
    handlePipelineRemovedEvent: function (request) {
        return new Promise((resolve, reject) => {
            if (request.event.data.models && request.event.data.models.length > 0) {
                request.event.data.models.forEach(pipeline => {
                    if (PIPELINE[pipeline.code]) delete PIPELINE[pipeline.code];
                });
            }
            resolve('Successfully pipeline removed');
        });
    },

    /**
     * Default success terminal for pipelines.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline head instance.
     * @returns {undefined}
     * @sideEffects Resolves the pipeline promise with `response.success`.
     */
    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Pipeline: ' + process.getPipelineName() + ' with Id: ' + process.getPipelineId() + ' processed successfully');
        process.resolve(response.success);

    },

    /**
     * Default error terminal for pipelines.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline head instance.
     * @returns {undefined}
     * @sideEffects Rejects the pipeline promise with enriched error context.
     */
    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Pipeline: ' + process.getPipelineName() + ' with Id: ' + process.getPipelineId() + ' has error');
        process.reject(CLASSES.NodicsError.enrich(response.error, {
            layer: 'pipeline',
            phase: 'errorEnd',
            pipelineName: process.getPipelineName(),
            pipelineId: process.getPipelineId(),
            nodeName: process.getNodeName ? process.getNodeName() : undefined,
            tenant: request && request.tenant,
            moduleName: request && request.moduleName
        }));
    },

    /**
     * Starts a named pipeline execution.
     *
     * @param {string} name Pipeline name from the effective `PIPELINE` registry.
     * @param {Object} request Pipeline request object.
     * @param {Object} response Pipeline response accumulator.
     * @returns {Promise<*>} Resolves or rejects with the pipeline terminal output.
     * @throws {CLASSES.NodicsError} Rejects when the pipeline name is invalid or construction fails.
     */
    start: function (name, request, response) {
        return new Promise((resolve, reject) => {
            if ((typeof name === 'string' || name instanceof String) && name !== 'defaultPipeline' && PIPELINE[name]) {
                let id = name + '_' + UTILS.generateUniqueCode();
                try {
                    let defaultPipeline = _.merge({}, PIPELINE.defaultPipeline);
                    let pipelineDef = _.merge(defaultPipeline, PIPELINE[name]);
                    let pipeline = new CLASSES.PipelineHead(name, pipelineDef);
                    pipeline.LOG = SERVICE.DefaultLoggerService.createLogger('PipelineHead');
                    pipeline.buildPipeline();
                    pipeline.start(id, request, response, resolve, reject);
                } catch (err) {
                    reject(new CLASSES.NodicsError(err));
                }
            } else {
                reject(new CLASSES.NodicsError({
                    code: 'ERR_PIPE_00000',
                    message: 'Error while creating pipeline, Please provide a valid pipeline name',
                    metadata: {
                        found: 'Pipeline name: ' + name,
                        required: 'A valid pipeline name'
                    }
                }));
            }
        });
    }
};
