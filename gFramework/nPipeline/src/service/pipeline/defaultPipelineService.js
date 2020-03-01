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

    loadPipelines: function () {
        return new Promise((resolve, reject) => {
            global.PIPELINE = SERVICE.DefaultFilesLoaderService.loadFiles('/src/pipelines/pipelinesDefinition.js');
            this.get({
                tenant: 'default'
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

    handlePipelineChangeEvent: function (pipelineObj) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: 'default',
                query: {
                    code: pipelineObj.code
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    pipelineObj = success.result[0];
                    if (PIPELINE[pipelineObj.code]) {
                        PIPELINE[pipelineObj.code] = _.merge(PIPELINE[pipelineObj.code], pipelineObj);
                    } else {
                        PIPELINE[pipelineObj.code] = pipelineObj;
                    }
                }
                resolve('Successfully pipeline updated');
            }).catch(error => {
                reject(error);
            });
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Pipeline: ' + process.getPipelineName() + ' with Id: ' + process.getPipelineId() + ' processed successfully');
        // if (response.success === undefined) {
        //     process.resolve({
        //         code: 'SUC_SYS_00000'
        //     });
        // } else {
        //     process.resolve(response.success);
        // }
        process.resolve(response.success);

    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Pipeline: ' + process.getPipelineName() + ' with Id: ' + process.getPipelineId() + ' has error');
        let error = response.error;
        if (error instanceof Error && !(error instanceof CLASSES.NodicsError)) {
            error = new CLASSES.NodicsError(error);
        }
        //this.LOG.error(error);
        process.reject(error);
    },

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