module.exports = {
    options: {
        isNew: true
    },

    startHandlerProcess: function(req, res) {
        let processRequest = {
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
        processRequest.tenant = processRequest.req.get('tenant') || {};
        processRequest.authTocket = processRequest.req.get('authTocken') || {};
        process.nextSuccess(processRequest, processResponse);
    },

    parseBody: function(processRequest, processResponse, process) {
        console.log(' ======= Handling parseBody');
        process.nextSuccess(processRequest, processResponse);
    },

    handleRequest: function(processRequest, processResponse, process) {
        console.log(' ======= Handling handleRequest');
        processRequest.process = process;
        CONTROLLER.CronJobController.get(processRequest, processResponse, (error, result) => {
            if (error) {
                processResponse.response = {
                    success: false,
                    code: 'ERR001',
                    msg: error
                };
            } else {
                processResponse.response = {
                    success: true,
                    code: 'SUC001',
                    msg: 'Finished Successfully',
                    result: models
                };
            }
            processRequest.process.nextSuccess(processRequest, processResponse);
        });
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('+++++++++++++++ handleSucessEnd');
        if (!SYSTEM.isBlank(processResponse.errors)) {
            processResponse.response = {
                errors: processResponse.errors
            };
        }
        processRequest.res.json(processResponse.response);
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('+++++++++++++++ handleFailureEnd');
        processRequest.res.json(processResponse.errors);
    },

    handleError: function(processRequest, processResponse) {
        console.log('+++++++++++++++ handleError ');
        processRequest.res.jsonp(processResponse.errors);
    }
};