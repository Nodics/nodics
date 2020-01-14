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
        this.LOG.warn('This is default success handler, will not perform anything ');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.warn('This is default error handler, will not perform anything ');
        if (response.errors && response.errors.length > 0) {
            process.reject(response.errors);
        } else {
            process.reject(response.error);
        }
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
                    this.LOG.error(err);
                    reject('Error while creating pipeline: ' + id + ' - ' + err.toString());
                }
            } else {
                this.LOG.error('Error while creating pipeline, Please provide a valid pipeline name');
                this.LOG.error(name);
                reject('Error while creating pipeline, Please provide a valid pipeline name');
            }
        });
    }
};