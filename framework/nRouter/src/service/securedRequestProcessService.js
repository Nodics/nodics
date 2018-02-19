module.exports = {
    options: {
        isNew: true
    },

    validateAuthToken: function(processRequest, processResponse, process) {
        console.log('   INFO: Validating auth token : ', processRequest.authToken);
        if (UTILS.isBlank(processRequest.authToken)) {
            console.log('   ERROR: Auth Token is null or invalid');
            process.error(processRequest, processResponse, 'Invalid auth token: Access denied');
        } else {
            process.nextSuccess(processRequest, processResponse);
        }
    },

    authorizeAuthToken: function(processRequest, processResponse, process) {
        console.log('   INFO: Authorizing auth token : ', processRequest.authToken);
        SERVICE.AuthenticationProviderService.authorizeToken(processRequest, (error, response) => {
            if (error) {
                process.error(processRequest, processResponse, error);
            } else {
                processRequest.enterprise = response.enterprise;
                processRequest.tenant = response.enterprise.tenant;
                process.nextSuccess(processRequest, processResponse);
            }
        });
    }
};