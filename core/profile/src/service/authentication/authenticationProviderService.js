/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    createAuthCache: function(request) {

    },
    retrieveEnterprise: function(enterpriseCode) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(enterpriseCode)) {
                reject('Enterprise Code is invalid or null');
            } else {
                DAO.EnterpriseDao.get({
                    tenant: 'default',
                    options: {
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

    retrieveEmployee: function(loginId, enterprise) {
        return new Promise((resolve, reject) => {
            DAO.EmployeeDao.get({
                tenant: enterprise.tenant,
                options: {
                    recursive: true,
                    query: {
                        loginId: loginId,
                        enterpriseCode: enterprise.enterpriseCode
                    }
                }
            }).then(employees => {
                if (employees.length <= 0) {
                    reject('Invalid login id');
                } else {
                    resolve(employees[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    retrieveActive: function(employee, enterprise) {
        return new Promise((resolve, reject) => {
            DAO.ActiveDao.get({
                tenant: enterprise.tenant,
                options: {
                    query: {
                        $and: [{
                            loginId: employee.loginId,
                        }, {
                            personId: employee._id
                        }]
                    }
                }
            }).then(actives => {
                if (actives.length <= 0) {
                    resolve({
                        loginId: employee.loginId,
                        personId: employee._id,
                        attempts: 0,
                        active: true
                    });
                } else {
                    resolve(actives[0]);
                }
            }).catch(error => {
                resolve({
                    loginId: employee.loginId,
                    personId: employee._id,
                    attempts: 0,
                    active: true
                });
            });
        });
    },

    retrievePassword: function(employee, enterprise) {
        return new Promise((resolve, reject) => {
            DAO.PasswordDao.get({
                tenant: enterprise.tenant,
                options: {
                    query: {
                        $and: [{
                            loginId: employee.loginId,
                        }, {
                            personId: employee._id
                        }, {
                            enterpriseCode: enterprise.enterpriseCode
                        }]
                    }
                }
            }).then(passwords => {
                if (passwords.length <= 0) {
                    reject('Invalid password defail');
                } else {
                    resolve(passwords[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    updateAuthData: function(active, enterprise) {
        let _self = this;
        active.lastAttempt = new Date();
        active.updated = new Date();
        DAO.ActiveDao.saveOrUpdate({
            tenant: enterprise.tenant,
            models: [active]
        }).then(success => {
            _self.LOG.debug('Active data has been updated with current time');
        }).catch(error => {
            _self.LOG.debug('While updating Active data with current time : ', error);
        });
    },

    updateFailedAuthData: function(active, enterprise) {
        if (active.attempts < CONFIG.get('attemptsToLockAccount')) {
            active.attempts = active.attempts + 1;
        } else {
            active.locked = true;
            active.lockedTime = new Date();
        }
        this.updateAuthData(active, enterprise);
    },

    authenticate: function(request, callback) {
        let input = request.local || request;
        let _self = this;
        _self.retrieveEnterprise(input.enterpriseCode).then(enterprise => {
            _self.retrieveEmployee(input.loginId, enterprise).then(employee => {
                _self.retrieveActive(employee, enterprise).then(active => {
                    if (active.locked || !active.active) {
                        callback('Account is currently in locked state or has been disabled');
                    } else {
                        _self.retrievePassword(employee, enterprise).then(password => {
                            SYSTEM.compareHash(input.password, password.password).then(match => {
                                if (match) {
                                    active.attempts = 0;
                                    _self.updateAuthData(active, enterprise);
                                    try {
                                        let key = enterprise._id + employee._id + (new Date()).getTime();
                                        let hash = SYSTEM.generateHash(key);
                                        _self.addToken(input.moduleName, input.source, hash, {
                                            employee: employee,
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

    authorize: function(request, callback) {
        let input = request.local || request;
        this.findToken(input).then(success => {
            callback(null, success);
        }).catch(error => {
            callback('Given token is not valid one');
        });
    }
};