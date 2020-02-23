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
            _self.LOG.error('While updating Active data with current time : ', error);
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
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByAPIKey({
                    tenant: enterprise.tenant.code,
                    apiKey: request.apiKey
                }).then(employee => {
                    resolve({
                        enterprise: enterprise,
                        person: employee,
                        tenant: enterprise.tenant.code
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    authenticateEmployee: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId,
                }).then(employee => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: employee,
                        type: 'Employee'
                    }).then(success => {
                        resolve({
                            code: 'SUC_AUTH_00001',
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
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultCustomerService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId
                }).then(customer => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: customer,
                        type: 'Customer'
                    }).then(success => {
                        resolve({
                            code: 'SUC_AUTH_00000',
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
                        reject(new CLASSES.NodicsError('ERR_LIN_00002'));
                    } else {
                        UTILS.compareHash(options.request.password, options.person.password.password).then(match => {
                            if (match) {
                                state.attempts = 0;
                                _self.updateAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                });
                                _self.createRefreshToken({
                                    entCode: options.enterprise.code,
                                    tenant: options.enterprise.tenant.code,
                                    loginId: options.person.loginId,
                                    password: options.request.password,
                                    type: options.type
                                }).then(refreshToken => {
                                    let authToken = _self.generateAuthToken({
                                        entCode: options.enterprise.code,
                                        tenant: options.enterprise.tenant.code,
                                        loginId: options.person.loginId,
                                        tokenLife: options.person.tokenLife,
                                        refreshToken: refreshToken
                                    });
                                    resolve({
                                        authToken: authToken
                                    });
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                _self.updateFailedAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                });
                                reject(new CLASSES.NodicsError('ERR_LIN_00003'));
                            }
                        }).catch(error => {
                            reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
                        });
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
                });
            } catch (error) {
                reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
            }
        });
    },

    createRefreshToken: function (options, callback) {
        return new Promise((resolve, reject) => {
            try {
                let refreshToken = UTILS.generateHash(options.entCode + options.loginId + (new Date()).getTime());
                this.addToken('profile', false, refreshToken, {
                    entCode: options.entCode,
                    tenant: options.tenant,
                    loginId: options.loginId,
                    password: options.password,
                    type: options.type
                }).then(success => {
                    resolve(refreshToken);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
            }
        });
    }
};