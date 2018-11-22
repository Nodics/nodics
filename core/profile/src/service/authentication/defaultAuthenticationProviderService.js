/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    updateAuthData: function (options) {
        let _self = this;
        options.state.lastAttempt = new Date();
        SERVICE.DefaultUserStateService.save({
            tenant: options.tenant,
            models: [options.state]
        }).then(success => {
            _self.LOG.debug('State data has been updated with current time');
        }).catch(error => {
            _self.LOG.debug('While updating Active data with current time : ', error);
        });
    },

    updateFailedAuthData: function (options) {
        if (options.state.attempts < CONFIG.get('attemptsToLockAccount')) {
            options.state.attempts = options.state.attempts + 1;
        } else {
            options.state.locked = true;
            options.state.lockedTime = new Date();
        }
        this.updateAuthData(options);
    },

    authenticateAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;

        });
    },

    authenticateEmployee: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.enterpriseCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId,
                    enterpriseCode: enterprise.code
                }).then(employee => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: employee,
                        type: 'Employee'
                    }).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_AUTH_00000',
                            msg: SERVICE.DefaultStatusService.get('SUC_AUTH_00000').message,
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    authenticateCustomer: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.enterpriseCode).then(enterprise => {
                SERVICE.DefaultCustomerService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId,
                    enterpriseCode: enterprise.code
                }).then(customer => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: customer,
                        type: 'Customer'
                    }).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_AUTH_00000',
                            msg: SERVICE.DefaultStatusService.get('SUC_AUTH_00000').message,
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    authenticate: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultUserStateService.findUserState({
                    tenant: options.enterprise.tenant.code,
                    loginId: options.person.loginId,
                    _id: options.person._id
                }).then(state => {
                    if (state.locked || !options.person.active) {
                        reject({
                            success: false,
                            code: 'ERR_LIN_00002'
                        });
                    } else {
                        SYSTEM.compareHash(options.request.password, options.person.password).then(match => {
                            if (match) {
                                state.attempts = 0;
                                _self.updateAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                });
                                _self.createAuthToken(options).then(success => {
                                    let moduleObject = NODICS.getModule(options.request.moduleName);
                                    if (!moduleObject.authCache.tokens) {
                                        moduleObject.authCache.tokens = {};
                                    }
                                    moduleObject.authCache.tokens[success.authToken] = {
                                        enterpriseCode: options.enterprise.code,
                                        loginId: options.person.loginId,
                                        password: options.request.password,
                                        type: options.type
                                    };
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                _self.updateFailedAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                });
                                reject({
                                    success: false,
                                    code: 'ERR_LIN_00003'
                                });
                            }
                        }).catch(error => {
                            reject({
                                success: false,
                                code: 'ERR_AUTH_00000',
                                error: error
                            });
                        });
                    }
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_AUTH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_AUTH_00000',
                    error: error
                });
            }

        });
    },

    createAuthToken: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let hash = null;
                if (options.request.authToken !== undefined) {
                    hash = options.request.authToken;
                } else {
                    let key = options.enterprise._id + options.person._id + (new Date()).getTime();
                    hash = SYSTEM.generateHash(key);
                }
                _self.addToken(options.request.moduleName, options.request.source, hash, {
                    person: options.person,
                    enterprise: options.enterprise,
                    type: options.type
                }).then(success => {
                    resolve({
                        authToken: hash
                    });
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_AUTH_00000',
                    error: error
                });
            }
        });
    },

    authorize: function (request, callback) {
        return new Promise((resolve, reject) => {
            this.findToken(request).then(success => {
                resolve(success);
            }).catch(error => {
                this.reAuthenticate(request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            });
        });
    },

    reAuthenticate: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(request.moduleName);
            if (moduleObject && moduleObject.authCache && moduleObject.authCache.tokens) {
                let authValues = moduleObject.authCache.tokens[request.authToken];
                if (authValues !== undefined) {
                    request.enterpriseCode = authValues.enterpriseCode;
                    request.loginId = authValues.loginId;
                    request.password = authValues.password;
                    if (authValues.type === 'Employee') {
                        this.authenticateEmployee(request, (error, success) => {
                            if (error) {
                                reject(error);
                            } else {
                                _self.findToken(request).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            }
                        });
                    } else {
                        this.authenticateEmployee(request, (error, success) => {
                            if (error) {
                                reject(error);
                            } else {
                                _self.findToken(request).then(success => {
                                    resolve(null, success);
                                }).catch(error => {
                                    reject(error);
                                });
                            }
                        });
                    }
                } else {
                    reject({
                        success: false,
                        code: 'ERR_AUTH_00001'
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 'ERR_AUTH_00001',
                });
            }
        });
    }
};