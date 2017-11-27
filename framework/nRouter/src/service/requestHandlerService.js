module.exports = {
    options: {
        isNew: true
    },

    startHandlerProcess: function(req, res, routerDef) {

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
        let response = PROCESS.ProcessService.startProcess('requestHandlerProcess', processRequest, processResponse);
    },

    parseHeader: function(processRequest, processResponse, process) {
        console.log(' ======= Handling parseHeader');
        processRequest.tenant = processRequest.httpRequest.get('tenant') || {};
        processRequest.authTocket = processRequest.httpRequest.get('authTocken') || {};
        process.nextSuccess(processRequest, processResponse);
    },

    parseBody: function(processRequest, processResponse, process) {
        console.log(' ======= Handling parseBody');
        process.nextSuccess(processRequest, processResponse);
    },
    //Authentication process
    handleRequest: function(processRequest, processResponse, process) {
        try {
            eval(processRequest.router.controller)(processRequest, (error, response) => {
                console.log(' ======= Handling handleRequest : ', response);
                console.log(' ======= ========================================');
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
            processResponse.errors.PROC_ERR_0003 = {
                success: false,
                code: 'ERR003',
                msg: error
            };
            process.nextFailure(processRequest, processResponse);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request : ', processRequest.originalUrl, ' processed successfully.');
        if (!SYSTEM.isBlank(processResponse.errors)) {
            processResponse.response = {
                errors: processResponse.errors
            };
        }
        processRequest.httpResponse.json(processResponse.response);
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('   ERROR: Got error while processing request : ', processResponse.errors);
        processRequest.httpResponse.json(processResponse.errors);
    },

    handleError: function(processRequest, processResponse) {
        console.log('   ERROR: Got error while processing request : ', processResponse.errors);
        processRequest.httpResponse.json(processResponse.errors);
    }
};