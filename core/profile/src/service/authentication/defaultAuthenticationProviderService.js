/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    retrieveEnterprise: function (enterpriseCode) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(enterpriseCode)) {
                reject('Enterprise Code is invalid or null');
            } else {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: 'default',
                    options: {
                        recursive: true,
                        query: {
                            enterpriseCode: enterpriseCode
                        }
                    }
                }).then(enterprises => {
                    if (enterprises.length <= 0) {
                        reject('Invalid enterprise code');
                    } else {
                        resolve(enterprises[0]);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

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

    authenticate: function (request, callback) {
        let input = request.local || request;
        let _self = this;
        _self.retrieveEnterprise(input.enterpriseCode).then(enterprise => {
            SERVICE.DefaultPersonService.findByLoginId({
                tenant: enterprise.tenant.name,
                loginId: input.loginId,
                enterpriseCode: enterprise.enterpriseCode
            }).then(person => {
                SERVICE.DefaultPersonService.findActive({
                    tenant: enterprise.tenant.name,
                    loginId: input.loginId,
                    _id: person._id
                }).then(active => {
                    if (active.locked || !active.active) {
                        callback('Account is currently in locked state or has been disabled');
                    } else {
                        SERVICE.DefaultPersonService.findPassword({
                            tenant: enterprise.tenant.name,
                            enterpriseCode: enterprise.enterpriseCode,
                            loginId: person.loginId,
                            _id: person._id
                        }).then(password => {
                            SYSTEM.compareHash(input.password, password.password).then(match => {
                                if (match) {
                                    active.attempts = 1;
                                    _self.updateAuthData(active, enterprise);
                                    try {
                                        let key = enterprise._id + person._id + (new Date()).getTime();
                                        let hash = SYSTEM.generateHash(key);
                                        _self.addToken(input.moduleName, input.source, hash, {
                                            person: person,
                                            enterprise: enterprise
                                        }).then(success => {
                                            callback(null, {
                                                authToken: hash
                                            });
                                        }).catch(error => {
                                            callback(error);
                                        });
                                    } catch (error) {
                                        callback('Invalid authentication request : Internal error: ' + error);
                                    }
                                } else {
                                    _self.updateFailedAuthData(active, enterprise);
                                    callback('Invalid authentication request : Given password is not valid');
                                }
                            }).catch(error => {
                                callback('Invalid authentication request : ' + error);
                            });
                        }).catch(error => {
                            callback('Invalid authentication request : ' + error);
                        });
                    }
                }).catch(error => {
                    callback('Invalid authentication request : ' + error);
                });
            }).catch(error => {
                callback('Invalid authentication request : ' + error);
            });
        }).catch(error => {
            callback('Invalid authentication request : ' + error);
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