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
            secured: routerDef.secured,
            moduleName: routerDef.moduleName,
            special: (routerDef.controller) ? false : true
        };
        let processResponse = {};
        try {
            SERVICE.ProcessService.startProcess('requestHandlerProcess', processRequest, processResponse);
        } catch (error) {
            res.json(error);
        }
    },

    parseHeader: function(processRequest, processResponse, process) {
        console.log('   INFO: Parsing request header : ', processRequest.moduleName);
        process.nextSuccess(processRequest, processResponse);
    },

    parseBody: function(processRequest, processResponse, process) {
        console.log('   INFO: Parsing request body : ', processRequest.originalUrl);
        process.nextSuccess(processRequest, processResponse);
    },

    handleSpecialRequest: function(processRequest, processResponse, process) {
        console.log('   INFO: Handling special request : ', processRequest.originalUrl);
        if (processRequest.special) {
            eval(processRequest.router.handler)(processRequest, (error, response) => {
                if (error) {
                    console.log('   ERROR: got error while handling special request : ', error);
                    process.error(processRequest, processResponse, error);
                } else {
                    processResponse.success = true;
                    processResponse.code = 'SUC001';
                    processResponse.msg = 'Processed successfully';
                    processResponse.result = response;
                    process.stop(processRequest, processResponse);
                }
            });
        } else {
            process.nextSuccess(processRequest, processResponse);
        }
    },

    redirectRequest: function(processRequest, processResponse, process) {
        console.log('   INFO: redirecting secured/non-secured request  : ', processRequest.originalUrl);
        if (processRequest.secured) {
            console.log('   INFO: Handling secured request');
            processRequest.authToken = processRequest.httpRequest.get('authToken');
            process.nextSuccess(processRequest, processResponse);
        } else {
            console.log('   INFO: Handling non-secured request');
            processRequest.enterpriseCode = processRequest.httpRequest.get('enterpriseCode') || {};
            process.nextFailure(processRequest, processResponse);
        }
    },

    handleRequest: function(processRequest, processResponse, process) {
        console.log('   INFO: processing your request : ', processRequest.originalUrl);
        try {
            eval(processRequest.router.controller)(processRequest, (error, response) => {
                if (error) {
                    console.log('   ERROR: got error while processing request : ', error);
                    processResponse.success = false;
                    delete processResponse.result;
                    delete processResponse.msg;
                    delete processResponse.code;
                    processResponse.errors.PROC_ERR_0003 = {
                        code: 'ERR003',
                        msg: error.toString()
                    };
                    process.nextFailure(processRequest, processResponse);
                } else {
                    processResponse.success = true;
                    processResponse.code = 'SUC001';
                    processResponse.msg = 'Processed successfully';
                    processResponse.result = response;
                    if (processRequest.router.cache) {
                        SERVICE.CacheService.put(processRequest.router, processRequest.httpRequest, processResponse).then(cuccess => {
                            process.nextSuccess(processRequest, processResponse);
                        }).catch(error => {
                            process.nextSuccess(processRequest, processResponse);
                        });
                    } else {
                        process.nextSuccess(processRequest, processResponse);
                    }
                }
            });
        } catch (error) {
            console.log('   ERROR: got error while service request : ', error);
            processResponse.success = false;
            delete processResponse.result;
            delete processResponse.msg;
            delete processResponse.code;
            processResponse.errors.PROC_ERR_0003 = {
                code: 'ERR003',
                msg: error.toString()
            };
            process.nextFailure(processRequest, processResponse);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed successfully : ', processRequest.originalUrl);
        processRequest.httpResponse.json(processResponse);
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed with some failures : ', processRequest.originalUrl);
        processRequest.httpResponse.json(processResponse);
    },

    handleErrorEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed and got errors : ', processRequest.originalUrl);
        processRequest.httpResponse.json(processResponse);
    }
};