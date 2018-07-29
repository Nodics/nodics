/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    findByLoginId: function (input) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultEmployeeService.get({
                tenant: input.tenant,
                options: {
                    recursive: true,
                    query: {
                        loginId: input.loginId,
                        enterpriseCode: input.enterpriseCode
                    }
                }
            }).then(employees => {
                if (employees.length <= 0) {
                    SERVICE.DefaultCustomerService.get({
                        tenant: input.tenant,
                        options: {
                            recursive: true,
                            query: {
                                loginId: input.loginId,
                                enterpriseCode: input.enterpriseCode
                            }
                        }
                    }).then(customers => {
                        if (customers.length <= 0) {
                            reject('Invalid login id');
                        } else {
                            resolve(customers[0]);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(employees[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    findActive: function (input) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultActiveService.get({
                tenant: input.tenant,
                options: {
                    query: {
                        $and: [{
                            loginId: input.loginId,
                        }, {
                            personId: input._id
                        }]
                    }
                }
            }).then(actives => {
                if (actives.length <= 0) {
                    resolve({
                        loginId: input.loginId,
                        personId: input._id,
                        attempts: 0,
                        active: true
                    });
                } else {
                    resolve(actives[0]);
                }
            }).catch(error => {
                resolve({
                    loginId: input.loginId,
                    personId: input._id,
                    attempts: 0,
                    active: true
                });
            });
        });
    },

    findPassword: function (input) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPasswordService.get({
                tenant: input.tenant,
                options: {
                    query: {
                        $and: [{
                            loginId: input.loginId,
                        }, {
                            personId: input._id
                        }, {
                            enterpriseCode: input.enterpriseCode
                        }]
                    }
                }
            }).then(passwords => {
                if (passwords.length <= 0) {
                    reject('Invalid password detail');
                } else {
                    resolve(passwords[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
};