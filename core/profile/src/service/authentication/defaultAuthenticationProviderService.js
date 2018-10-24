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

    authenticateEmployee: function (request, callback) {
        let input = request.local || request;
        let _self = this;
        SERVICE.DefaultEnterpriseService.retrieveEnterprise(input.enterpriseCode).then(enterprise => {
            SERVICE.DefaultEmployeeService.findByLoginId({
                tenant: enterprise.tenant.code,
                loginId: input.loginId,
                enterpriseCode: enterprise.enterpriseCode
            }).then(employee => {
                _self.authenticate({
                    input: input,
                    enterprise: enterprise,
                    person: employee,
                    type: 'Employee'
                }).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            }).catch(error => {
                callback(error);
            });
        }).catch(error => {
            callback(error);
        });
    },

    authenticateCustomer: function (request, callback) {
        let input = request.local || request;
        let _self = this;
        SERVICE.DefaultEnterpriseService.retrieveEnterprise(input.enterpriseCode).then(enterprise => {
            SERVICE.DefaultCustomerService.findByLoginId({
                tenant: enterprise.tenant.code,
                loginId: input.loginId,
                enterpriseCode: enterprise.enterpriseCode
            }).then(customer => {
                _self.authenticate({
                    input: input,
                    enterprise: enterprise,
                    person: customer,
                    type: 'Customer'
                }).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            }).catch(error => {
                callback(error);
            });
        }).catch(error => {
            callback(error);
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
                        reject('Account is currently in locked state or has been disabled');
                    } else {
                        SYSTEM.compareHash(options.input.password, options.person.password).then(match => {
                            if (match) {
                                state.attempts = 0;
                                _self.updateAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                });
                                _self.createAuthToken(options).then(success => {
                                    let moduleObject = NODICS.getModule(options.input.moduleName);
                                    if (!moduleObject.authCache.tokens) {
                                        moduleObject.authCache.tokens = {};
                                    }
                                    moduleObject.authCache.tokens[success.authToken] = {
                                        enterpriseCode: options.enterprise.enterpriseCode,
                                        loginId: options.person.loginId,
                                        password: options.input.password,
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
                                reject('Invalid authentication request : Given password is not valid');
                            }
                        }).catch(error => {
                            reject('Invalid authentication request : ' + error);
                        });
                    }
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }

        });
    },

    createAuthToken: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let hash = null;
                if (options.input.authToken !== undefined) {
                    hash = options.input.authToken;
                } else {
                    let key = options.enterprise._id + options.person._id + (new Date()).getTime();
                    hash = SYSTEM.generateHash(key);
                }
                _self.addToken(options.input.moduleName, options.input.source, hash, {
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
                reject('Invalid authentication request : Internal error: ' + error);
            }
        });
    },

    authorize: function (request, callback) {
        let _self = this;
        let input = request.local || request;
        this.findToken(input).then(success => {
            callback(null, success);
        }).catch(error => {
            this.reAuthenticate(input).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        });
    },

    reAuthenticate: function (input) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(input.moduleName);
            if (moduleObject && moduleObject.authCache && moduleObject.authCache.tokens) {
                let authValues = moduleObject.authCache.tokens[input.authToken];
                if (authValues !== undefined) {
                    input.enterpriseCode = authValues.enterpriseCode;
                    input.loginId = authValues.loginId;
                    input.password = authValues.password;
                    if (authValues.type === 'Employee') {
                        this.authenticateEmployee(input, (error, success) => {
                            if (error) {
                                reject('Given token is not valid one');
                            } else {
                                _self.findToken(input).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject('Given token is not valid one');
                                });
                            }
                        });
                    } else {
                        this.authenticateEmployee(input, (error, success) => {
                            if (error) {
                                reject('Given token is not valid one');
                            } else {
                                _self.findToken(input).then(success => {
                                    resolve(null, success);
                                }).catch(error => {
                                    reject('Given token is not valid one');
                                });
                            }
                        });
                    }
                } else {
                    reject('Given token is not valid one');
                }
            } else {
                reject('Given token is not valid one');
            }
        });
    }
};