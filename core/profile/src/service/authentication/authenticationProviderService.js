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

    updateAuthData: function(employee, enterprise) {
        employee.lastAttempt = new Date();
        employee.updated = new Date();
        DAO.EmployeeDao.update({
            tenant: enterprise.tenant,
            models: [employee]
        }).then(success => {
            console.log('   INFO: Employee data has been updated with current time');
        }).catch(error => {
            console.log('   ERROR: While updating Employee data with current time : ', error);
        });
    },

    updateFailedAuthData: function(employee, enterprise) {
        if (employee.attempts >= CONFIG.get('attemptsToLockAccount')) {
            employee.locked = true;
            employee.lockedTime = new Date();
        } else {
            employee.attempts = employee.attempts + 1;
        }
        this.updateAuthData(employee, enterprise);
    },

    authenticate: function(request, callback) {
        let _self = this;
        _self.retrieveEnterprise(request.enterpriseCode).then(enterprise => {
            _self.retrieveEmployee(request.loginId, enterprise).then(employee => {
                _self.retrievePassword(employee, enterprise).then(password => {
                    if (employee.locked || !employee.active) {
                        callback('Account is currently in locked state or has been disabled');
                    } else {
                        SYSTEM.compareHash(request.password, password.password).then(match => {
                            if (match) {
                                employee.attempts = 1;
                                _self.updateAuthData(employee, enterprise);
                                try {
                                    let key = enterprise._id + employee._id + (new Date()).getTime();
                                    let hash = SYSTEM.generateHash(key);
                                    _self.addToken(request.moduleName, request.source, hash, {
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
                                _self.updateFailedAuthData(employee, enterprise);
                                callback('Invalid authentication request : Given password is not valid');
                            }
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

    authorize: function(processRequest, callback) {
        this.findToken(processRequest).then(success => {
            callback(null, success);
        }).catch(error => {
            callback('Given token is not valid one');
        });
    }
};