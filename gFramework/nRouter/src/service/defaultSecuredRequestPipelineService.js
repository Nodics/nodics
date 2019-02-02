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
            process.error(request, response, {
                success: false,
                code: 'ERR_AUTH_00002',
                msg: 'Invalid secured request'
            });
        } else if (request.apiKey && request.authToken) {
            process.error(request, response, {
                success: false,
                code: 'ERR_AUTH_00002',
                msg: 'Request can not hold authToken and apiKey both at sametime'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    authorizeAPIKey: function (request, response, process) {
        if (request.apiKey) {
            this.LOG.debug('Authorizing api key : ', request.apiKey);
            SERVICE.DefaultAuthorizationProviderService.authorizeAPIKey(request).then(success => {
                try {
                    if (success.success && success.result) {
                        request.enterprise = success.result.enterprise;
                        request.enterpriseCode = success.result.enterprise.code;
                        request.person = success.result.person;
                        request.tenant = success.result.enterprise.tenant.code;
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, {
                            success: false,
                            code: 'ERR_AUTH_00001',
                            error: err
                        });
                    }
                } catch (err) {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_AUTH_00001',
                        error: err
                    });
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    authorizeAuthToken: function (request, response, process) {
        if (request.authToken) {
            this.LOG.debug('Authorizing auth token : ', request.authToken);
            SERVICE.DefaultAuthorizationProviderService.authorizeToken(request).then(success => {
                try {
                    if (success.success && success.result) {
                        request.enterprise = success.result.enterprise;
                        request.enterpriseCode = success.result.enterprise.code;
                        request.person = success.result.person;
                        request.tenant = success.result.enterprise.tenant.code;
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, {
                            success: false,
                            code: 'ERR_AUTH_00001',
                            error: err
                        });
                    }
                } catch (err) {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_AUTH_00001',
                        error: err
                    });
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    validateRequestData: function (request, response, process) {
        if (!request.enterprise) {
            process.error(request, response, {
                success: false,
                code: 'ERR_AUTH_00002',
                msg: 'Invalid secured request'
            });
        } else if (!request.person) {
            process.error(request, response, {
                success: false,
                code: 'ERR_AUTH_00002',
                msg: 'Invalid secured request'
            });
        } else if (!request.tenant) {
            process.error(request, response, {
                success: false,
                code: 'ERR_AUTH_00002',
                msg: 'Invalid secured request'
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
};