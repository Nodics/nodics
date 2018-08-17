module.exports = {

    validateAuthToken: function (request, response, process) {
        this.LOG.debug('Validating auth token : ', request.local.authToken);
        if (UTILS.isBlank(request.local.authToken)) {
            this.LOG.error('Auth Token is null or invalid');
            process.error(request, response, 'Invalid auth token: Access denied');
        } else {
            process.nextSuccess(request, response);
        }
    },

    authorizeAuthToken: function (request, response, process) {
        this.LOG.debug('Authorizing auth token : ', request.local.authToken);
        SERVICE.DefaultAuthenticationProviderService.authorizeToken(request, (error, result) => {
            if (error) {
                process.error(request, response, error);
            } else {
                request.local.enterprise = result.enterprise;
                request.local.enterpriseCode = result.enterprise.enterpriseCode;
                request.local.person = result.person;
                request.local.tenant = result.enterprise.tenant.name;
                process.nextSuccess(request, response);
            }
        });
    }
};