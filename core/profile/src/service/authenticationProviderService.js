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

    authenticate: function(request, callback) {
        let _self = this;
        _self.retrieveEnterprise(request.enterpriseCode).then(enterprise => {
            _self.retrieveEmployee(request.loginId, enterprise).then(employee => {
                SYSTEM.compareHash(request.password, employee.password).then(match => {
                    if (match) {
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
                        callback('Invalid authentication request : Given password is not valid');
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