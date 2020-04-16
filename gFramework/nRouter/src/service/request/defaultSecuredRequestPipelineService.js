module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    validateSecuredRequest: function (request, response, process) {
        if (!request.apiKey && !request.authToken) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002'));
        } else if (request.apiKey && request.authToken) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    authorizeAPIKey: function (request, response, process) {
        if (request.apiKey) {
            this.LOG.debug('Authorizing api key : ' + request.apiKey);
            SERVICE.DefaultAuthorizationProviderService.authorizeAPIKey(request).then(success => {
                request.enterprise = success.enterprise;
                request.entCode = success.enterprise.code;
                request.person = success.person;
                request.tenant = success.enterprise.tenant.code;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    authorizeAuthToken: function (request, response, process) {
        if (request.authToken) {
            this.LOG.debug('Authorizing auth token : ' + request.authToken);
            SERVICE.DefaultAuthorizationProviderService.authorizeToken(request).then(success => {
                try {
                    console.log(success);
                    if (success.result && !UTILS.isBlank(success.result)) {
                        request.entCode = success.result.entCode;
                        request.tenant = success.result.tenant;
                        request.loginId = success.result.loginId;
                        request.refreshToken = success.result.refreshToken;
                        request.userGroups = success.result.userGroups;
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00001'));
                    }
                } catch (err) {
                    process.error(request, response, new CLASSES.NodicsError(err, ' While authorizing token', 'ERR_AUTH_00001'));
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    validateRequestData: function (request, response, process) {
        if (!request.entCode) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002', 'Invalid secured request'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002', 'Invalid secured request'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    checkAccess: function (request, response, process) {
        process.nextSuccess(request, response);
    },
};