/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {
    options: {
        isNew: true
    },

    handleErrorEnd: function(processRequest, processResponse) {
        console.log('............. handleErrorEnd : ');
        if (processResponse.errors) {
            console.log(processResponse.errors);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('............. handleSucessEnd');
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('............. handleFailureEnd');
    },

    startProcess: function(processName, processRequest, processResponse) {
        let success = false;
        if (processName !== 'defaultProcess' && PROCESS[processName]) {
            processResponse.errors = {};
            let id = processRequest.httpRequest.originalUrl;
            try {
                let process = new CLASSES.ProcessHead(processName, _.merge(PROCESS.defaultProcess, PROCESS[processName]));
                process.buildProcess();
                process.start(id, processRequest, processResponse);
                success = true;
            } catch (err) {
                console.log('   ERROR: Error while creating process : ', id, ' - ', err);
                processResponse.errors.PROC_ERR_0000 = {
                    code: 'PROC_ERR_0000',
                    message: 'PROC_ERR_0000',
                    error: err.toString()
                };
                throw new Error('   ERROR: Error while creating process : ', id, ' - ', err);
            }
        }
    }
};