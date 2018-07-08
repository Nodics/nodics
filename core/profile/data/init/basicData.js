/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        createTenant: {
            options: {
                modelName: 'tenant',
                operation: 'saveOrUpdate', //save, update and saveOrUpdate
                tenant: 'default',
            },
            rule: {
                name: 'name'
            },
            models: [
                {
                    name: 'testOne',
                    active: true,
                    properties: {
                        database: {
                            default: {
                                databaseType: 'mongodb', //for Cassandra use 'cassandra'
                                mongodb: {
                                    master: {
                                        URI: 'mongodb://localhost:27017/testOneMaster',
                                        options: {
                                            native_parser: true,
                                            poolSize: 5
                                        }
                                    },
                                    test: {
                                        URI: 'mongodb://localhost:27017/testOneTest',
                                        options: {
                                            native_parser: true,
                                            poolSize: 5
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    name: 'default',
                    active: true,
                    properties: {
                        tmpData: 'for default tenant data will be picked from property configuration'
                    }
                }
            ]
        },

        createDefaultEnterprise: {
            options: {
                modelName: 'enterprise',
                operation: 'saveOrUpdate', //save, update and saveOrUpdate
                tenant: 'default',
            },
            rule: {
                enterpriseCode: 'enterpriseCode'
            },
            macros: {
                tenant: {
                    rule: {
                        name: '?0',
                        active: '?1'
                    }
                }
            },
            models: [
                {
                    enterpriseCode: 'default',
                    name: 'Default',
                    description: 'Default Enterprise',
                    tenant: 'default:true'
                }
            ]
        },

        createDefaultEmployee: {
            options: {
                modelName: 'employee',
                operation: 'saveOrUpdate', //save, update and saveOrUpdate
                tenant: 'default',
            },
            rule: {
                loginId: 'loginId'
            },
            models: [
                {
                    enterpriseCode: 'default',
                    firstName: 'Nodics',
                    lastName: 'Employee',
                    loginId: 'admin',
                    locked: false,
                    active: true,
                    attempts: 1
                }
            ]
        },

        createDefaultCustomer: {
            options: {
                modelName: 'customer',
                operation: 'saveOrUpdate', //save, update and saveOrUpdate
                tenant: 'default',
            },
            rule: {
                loginId: 'loginId'
            },
            models: [
                {
                    enterpriseCode: 'default',
                    firstName: 'Nodics',
                    lastName: 'Customer',
                    loginId: 'guest',
                    locked: false,
                    active: true,
                    attempts: 1
                }
            ]
        },

        createDefaultPassword: {
            options: {
                modelName: 'password',
                operation: 'saveOrUpdate', //save, update and saveOrUpdate
                tenant: 'default',
            },
            rule: {
                loginId: 'loginId'
            },
            macros: {
                personId: {
                    models: [{
                        model: 'employee',
                        returnProperty: '_id'
                    }, {
                        model: 'customer',
                        returnProperty: '_id'
                    }],
                    rule: {
                        loginId: '?0'
                    }
                }
            },
            models: [
                {
                    personId: 'admin',
                    enterpriseCode: 'default',
                    loginId: 'admin',
                    password: 'nodics'
                },
                {
                    personId: '121e7dd88ac6ed3d73a76713',
                    enterpriseCode: 'default',
                    loginId: 'guest',
                    password: 'nodics'
                }
            ]
        }
    }
}