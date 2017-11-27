/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    startProcess: function(processName, processRequest, processResponse) {
        let success = false;
        let request = processRequest || {};
        let response = processResponse || {};
        if (PROCESS[processName]) {
            response.errors = {};
            try {
                let process = Object.create(PROCESS[processName]);
                process.start(request.httpRequest.originalUrl, request, response);
                success = true;
            } catch (err) {
                response.errors.PROC_ERR_0000 = {
                    code: 'PROC_ERR_0000',
                    message: 'PROC_ERR_0000',
                    error: err
                };
            }
        }
        if (!response.success) {
            response.success = success;
        }
        return response;
    }
};