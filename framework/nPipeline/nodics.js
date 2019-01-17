/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const pipelineBuilder = require('./bin/pipelineDefinitionBuilder');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    loadPipelines: function () {
        SYSTEM.LOG.info('Starting Pipelines Defintion builder process');
        return pipelineBuilder.init();
    }
};