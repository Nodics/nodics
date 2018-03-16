/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    handleSucessEnd: function(request, response) {
        console.log('   WARN: This is default success handler, will not perform anything ');
    },

    handleFailureEnd: function(request, response) {
        console.log('   WARN: This is default failure handler, will not perform anything ');
    },

    handleErrorEnd: function(request, response) {
        console.log('   WARN: This is default error handler, will not perform anything ');
    },
    startProcess: function(processName, request, response, callback) {
        let success = false;
        if (processName !== 'defaultProcess' && PROCESS[processName]) {
            response.errors = {};
            let id = request.local.originalUrl;
            // TODO: Make this id unique to track nested process management - will implement in Future
            try {
                let defaultProcess = _.merge({}, PROCESS.defaultProcess);
                let processDef = _.merge(defaultProcess, PROCESS[processName]);
                let process = new CLASSES.ProcessHead(processName, processDef, callback);
                process.buildProcess();
                process.start(id, request, response);
                success = true;
            } catch (err) {
                console.log('   ERROR: Error while creating process : ', id, ' - ', err);
                response.errors.PROC_ERR_0000 = {
                    code: 'PROC_ERR_0000',
                    message: 'PROC_ERR_0000',
                    error: err.toString()
                };
                throw new Error('   ERROR: Error while creating process : ', id, ' - ', err);
            }
        }
    }
};