/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
const async = require('async');
const uuid = require('uuid/v4');
module.exports = {
    options: {
        isNew: false
    },

    retrieveEnterprise: function(request) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.enterpriseCode)) {
                reject('Enterprise Code is invalid or null');
            } else {
                DAO.EnterpriseDao.get({
                    tenant: 'default',
                    options: {
                        query: {
                            enterpriseCode: request.enterpriseCode
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

    retrieveEmployee: function(request, enterprise) {
        return new Promise((resolve, reject) => {
            DAO.EmployeeDao.get({
                tenant: enterprise.tenant,
                options: {
                    query: {
                        loginId: request.loginId,
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
        _self.retrieveEnterprise(request).then(enterprise => {
            console.log(enterprise);
            _self.retrieveEmployee(request, enterprise).then(employee => {
                SYSTEM.compareHash(request.password, employee.password).then(match => {
                    if (match) {
                        try {
                            let hash = SYSTEM.generateHash();
                            let moduleObject = NODICS.getModules(request.moduleName);
                            if (!moduleObject.cache) {
                                moduleObject.cache = {};
                            }
                            moduleObject.cache[hash] = {
                                employee: employee,
                                enterprise: enterprise
                            };
                            callback(null, {
                                authToken: hash
                            });
                        } catch (error) {
                            callback('Invalid authentication request : Internal error ');
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
        this.findToken(processRequest, callback);
    }
};