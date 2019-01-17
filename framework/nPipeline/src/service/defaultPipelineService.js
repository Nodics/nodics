/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    pipelineLOG: SYSTEM.createLogger('PipelineHead'),

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
            if (name !== 'defaultPipeline' && PIPELINE[name]) {
                let id = name + '_' + UTILS.generateUniqueCode();
                try {
                    let defaultPipeline = _.merge({}, PIPELINE.defaultPipeline);
                    let pipelineDef = _.merge(defaultPipeline, PIPELINE[name]);
                    let pipeline = new CLASSES.PipelineHead(name, pipelineDef);
                    pipeline.LOG = this.pipelineLOG;
                    pipeline.buildPipeline();
                    pipeline.start(id, request, response, resolve, reject);
                } catch (err) {
                    this.LOG.error(err);
                    reject('Error while creating pipeline: ' + id + ' - ' + err.toString());
                }
            }
        });
    }
};