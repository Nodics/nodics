/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    updateAuthData: function (active, enterprise) {
        let _self = this;
        active.lastAttempt = new Date();
        active.updated = new Date();
        SERVICE.DefaultActiveService.save({
            tenant: enterprise.tenant.name,
            models: [active]
        }).then(success => {
            _self.LOG.debug('Active data has been updated with current time');
        }).catch(error => {
            _self.LOG.debug('While updating Active data with current time : ', error);
        });
    },

    updateFailedAuthData: function (active, enterprise) {
        if (active.attempts <= CONFIG.get('attemptsToLockAccount')) {
            active.attempts = active.attempts + 1;
        } else {
            active.locked = true;
            active.lockedTime = new Date();
        }
        this.updateAuthData(active, enterprise);
    },

    authenticateEmployee: function (request, callback) {
        let input = request.local || request;
        let _self = this;
        SERVICE.DefaultEnterpriseService.retrieveEnterprise(input.enterpriseCode).then(enterprise => {
            SERVICE.DefaultEmployeeService.findByLoginId({
                tenant: enterprise.tenant.name,
                loginId: input.loginId,
                enterpriseCode: enterprise.enterpriseCode,
                type: 'Employee'
            }).then(employee => {
                _self.authenticate({
                    input: input,
                    enterprise: enterprise,
                    person: employee
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
                tenant: enterprise.tenant.name,
                loginId: input.loginId,
                enterpriseCode: enterprise.enterpriseCode,
                type: 'Customer'
            }).then(customer => {
                _self.authenticate({
                    input: input,
                    enterprise: enterprise,
                    person: customer
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
            SERVICE.DefaultActiveService.findActive({
                tenant: options.enterprise.tenant.name,
                loginId: options.person.loginId,
                _id: options.person._id
            }).then(active => {
                if (active.locked || !active.active) {
                    reject('Account is currently in locked state or has been disabled');
                } else {
                    options.active = active;
                    _self.verifyPassword(options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    verifyPassword: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPasswordService.findPassword({
                tenant: options.enterprise.tenant.name,
                loginId: options.person.loginId,
                enterpriseCode: options.enterprise.enterpriseCode
            }).then(password => {
                SYSTEM.compareHash(options.input.password, password.password).then(match => {
                    if (match) {
                        _self.createAuthToken(options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.updateFailedAuthData(active, enterprise);
                        reject('Invalid authentication request : Given password is not valid');
                    }
                }).catch(error => {
                    reject('Invalid authentication request : ' + error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    createAuthToken: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            options.active.attempts = 1;
            _self.updateAuthData(options.active, options.enterprise);
            try {
                let key = options.enterprise._id + options.person._id + (new Date()).getTime();
                let hash = SYSTEM.generateHash(key);
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
        let input = request.local || request;
        this.findToken(input).then(success => {
            callback(null, success);
        }).catch(error => {
            callback('Given token is not valid one');
        });
    }
};