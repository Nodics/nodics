module.exports = {
    options: {
        isNew: true
    },

    parseHeader: function(processRequest, processResponse, process) {
        console.log('   INFO: Parsing request header : ', processRequest.originalUrl);
        processRequest.tenant = processRequest.httpRequest.get('tenant') || {};
        processRequest.authTocket = processRequest.httpRequest.get('authTocken') || {};
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
            processResponse.errors.PROC_ERR_0003 = {
                success: false,
                code: 'ERR003',
                msg: error
            };
            process.nextFailure(processRequest, processResponse);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('   INFO: Request has been processed successfully : ', processRequest.originalUrl);
        /*if (!SYSTEM.isBlank(processResponse.errors)) {
            processResponse.response = {
                errors: processResponse.errors
            };
        }*/
        console.log(processResponse.response);
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