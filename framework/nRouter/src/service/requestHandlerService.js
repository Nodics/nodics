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
            eval(processRequest.router.controller)(processRequest, (error, response) => {
                if (error) {
                    throw error;
                } else {
                    processResponse.response = {
                        success: true,
                        code: 'SUC001',
                        msg: 'Finished Successfully',
                        result: response
                    };
                }
                process.nextSuccess(processRequest, processResponse);
            });
        } catch (error) {
            console.log('   ERROR: got error while servive request : ', error);
            processResponse.errors.PROC_ERR_0003 = {
                success: false,
                code: 'ERR003',
                msg: error.toString()
            };
            process.nextFailure(processRequest, processResponse);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed successfully : ', processRequest.originalUrl);
        /*if (!UTILS.isBlank(processResponse.errors)) {
            processResponse.response = {
                errors: processResponse.errors
            };
        }*/
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