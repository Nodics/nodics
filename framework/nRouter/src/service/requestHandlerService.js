/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: true
    },

    startRequestHandlerProcess: function(req, res, routerDef) {
        let processRequest = {
            router: routerDef,
            httpRequest: req,
            httpResponse: res,
            protocal: req.protocol,
            host: req.get('host'),
            originalUrl: req.originalUrl,
            secured: true
        };
        let processResponse = {};
        try {
            SERVICE.ProcessService.startProcess('requestHandlerProcess', processRequest, processResponse);
        } catch (error) {
            res.json(error);
        }
    },

    parseHeader: function(processRequest, processResponse, process) {
        console.log('   INFO: Parsing request header : ', processRequest.originalUrl);
        processRequest.tenant = processRequest.httpRequest.get('tenant') || {};
        processRequest.authToket = processRequest.httpRequest.get('authToken') || {};
        process.nextSuccess(processRequest, processResponse);
    },

    parseBody: function(processRequest, processResponse, process) {
        console.log('   INFO: Parsing request body : ', processRequest.originalUrl);
        process.nextSuccess(processRequest, processResponse);
    },

    handleRequest: function(processRequest, processResponse, process) {
        console.log('   INFO: processing your request : ', processRequest.originalUrl);
        try {
            eval(processRequest.router.controller)(processRequest, (error, response, input) => {
                if (error) {
                    console.log('   ERROR: got error while processing request : ', error);
                    processResponse.errors.PROC_ERR_0003 = {
                        success: false,
                        code: 'ERR003',
                        msg: error.toString()
                    };
                    process.nextFailure(processRequest, processResponse);
                } else {
                    processResponse.response = {
                        success: true,
                        code: 'SUC001',
                        msg: 'Finished Successfully',
                        result: response
                    };
                    process.nextSuccess(processRequest, processResponse);
                }
            });
            console.log('12');
        } catch (error) {
            console.log('   ERROR: got error while service request : ', error);
            processResponse.errors.PROC_ERR_0003 = {
                success: false,
                code: 'ERR003',
                msg: error.toString()
            };
            process.nextFailure(processRequest, processResponse);
            console.log('13');
        }
        console.log('14');
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed successfully : ', processRequest.originalUrl);
        processRequest.httpResponse.json(processResponse);
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed with some failures : ', processRequest.originalUrl);
        processRequest.httpResponse.json(processResponse);
    },

    handleError: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed and got errors : ', processRequest.originalUrl);
        processRequest.httpResponse.json(processResponse);
    }
};