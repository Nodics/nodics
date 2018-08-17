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
    handleSucessEnd: function (request, response) {
        this.LOG.warn('This is default success handler, will not perform anything ');
    },

    handleFailureEnd: function (request, response) {
        this.LOG.warn('This is default failure handler, will not perform anything ');
    },

    handleErrorEnd: function (request, response) {
        this.LOG.warn('This is default error handler, will not perform anything ');
    },
    startPipeline: function (pipelineName, request, response, callback) {
        if (pipelineName !== 'defaultPipeline' && PIPELINE[pipelineName]) {
            let id = SYSTEM.generateUniqueCode();
            // TODO: Make this id unique to track nested pipeline management - will implement in Future
            try {
                let defaultPipeline = _.merge({}, PIPELINE.defaultPipeline);
                let pipelineDef = _.merge(defaultPipeline, PIPELINE[pipelineName]);
                let pipeline = new CLASSES.PipelineHead(pipelineName, pipelineDef, callback);
                pipeline.LOG = this.pipelineLOG;
                pipeline.buildPipeline();
                pipeline.start(id, request, response);
            } catch (err) {
                this.LOG.error('Error while creating pipeline : ', id, ' - ', err);
                response.errors.push({
                    code: 'PROC_ERR_0000',
                    message: 'PROC_ERR_0000',
                    error: err.toString()
                });
                throw new Error('Error while creating pipeline : ', id, ' - ', err);
            }
        }
    }
};