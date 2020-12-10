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
            resolve(true);
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.warn('This is default success handler, will not perform anything ');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.warn('This is default error handler, will not perform anything ');
        process.reject(response.errors);
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