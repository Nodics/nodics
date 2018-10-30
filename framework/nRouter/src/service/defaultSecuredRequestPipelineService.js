module.exports = {

    validateAuthToken: function (request, response, process) {
        this.LOG.debug('Validating auth token : ', request.authToken);
        if (UTILS.isBlank(request.authToken)) {
            this.LOG.error('Auth Token is null or invalid');
            process.error(request, response, 'Invalid auth token: Access denied');
        } else {
            process.nextSuccess(request, response);
        }
    },

    authorizeAuthToken: function (request, response, process) {
        this.LOG.debug('Authorizing auth token : ', request.authToken);
        SERVICE.DefaultAuthenticationProviderService.authorizeToken(request, (error, result) => {
            try {
                if (error) {
                    process.error(request, response, error);
                } else {
                    request.enterprise = result.enterprise;
                    request.enterpriseCode = result.enterprise.enterpriseCode;
                    request.person = result.person;
                    request.tenant = result.enterprise.tenant.code;
                    process.nextSuccess(request, response);
                }
            } catch (err) {
                process.error(request, response, err);
            }
        });
    }
};