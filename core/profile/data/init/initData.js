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
            modelName: 'tenant',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultTenant: {
                    _id: '111e7dd88ac6ed3d73a73411',
                    name: 'testOne',
                    active: true,
                    properties: {
                        database: {
                            default: {
                                master: {
                                    URI: 'mongodb://localhost:27017/testOne',
                                    options: {
                                        db: {
                                            native_parser: true
                                        },
                                        server: {
                                            poolSize: 5
                                        }
                                    }
                                },
                                test: {
                                    URI: 'mongodb://localhost:27017/testOne',
                                    options: {
                                        db: {
                                            native_parser: true
                                        },
                                        server: {
                                            poolSize: 5
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        createDefaultEnterprise: {
            modelName: 'enterprise',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEnterprise: {
                    _id: '111e7dd88ac6ed3d73a76711',
                    enterpriseCode: 'default',
                    name: 'Default',
                    description: 'Default Enterprise',
                    tenant: {
                        _id: '111e7dd88ac6ed3d73a73311',
                        name: 'default',
                        active: true,
                        properties: {
                            tmpData: 'for default tenant data will be picked from property configuration'
                        }
                    }
                }
            }
        },

        createDefaultEmployee: {
            modelName: 'employee',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '121e7dd88ac6ed3d73a76712',
                    enterpriseCode: 'default',
                    firstName: 'Nodics',
                    lastName: 'Employee',
                    loginId: 'admin',
                    locked: false,
                    active: true,
                    attempts: 1
                }
            }
        },

        createDefaultCustomer: {
            modelName: 'employee',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '121e7dd88ac6ed3d73a76713',
                    enterpriseCode: 'default',
                    firstName: 'Nodics',
                    lastName: 'Customer',
                    loginId: 'guest',
                    locked: false,
                    active: true,
                    attempts: 1
                }
            }
        },

        createDefaultPassword: {
            modelName: 'password',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployeePassword: {
                    _id: '121e7dd88ac6ed3d73a76333',
                    personId: '121e7dd88ac6ed3d73a76712',
                    enterpriseCode: 'default',
                    loginId: 'admin',
                    password: 'nodics'
                },
                defaultCustomerPassword: {
                    _id: '121e7dd88ac6ed3d73a76334',
                    personId: '121e7dd88ac6ed3d73a76713',
                    enterpriseCode: 'default',
                    loginId: 'guest',
                    password: 'nodics'
                }
            }
        }
    }
};