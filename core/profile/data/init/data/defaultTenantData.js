/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'default',
        active: true,
        description: 'Default tenant, which take configuration from properties configuration'
    },
    /*
        record1: {
            code: 'testOne',
            active: true,
            description: 'This tenant is just for testing purose',
            properties: {
                database: {
                    default: {
                        databaseType: 'mongodb', //for Cassandra use 'cassandra'
                        mongodb: {
                            master: {
                                URI: 'mongodb://localhost:27017',
                                databaseName: 'testOneMaster',
                                options: {
                                    native_parser: true,
                                    poolSize: 5
                                }
                            },
                            test: {
                                URI: 'mongodb://localhost:27017',
                                databaseName: 'testOneTest',
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
        record2: {
            code: 'disabledTenant',
            active: false,
            description: 'This tenant is just for testing purose if disabled is getting loaded',
            properties: {
                database: {
                    default: {
                        databaseType: 'mongodb', //for Cassandra use 'cassandra'
                        mongodb: {
                            master: {
                                URI: 'mongodb://localhost:27017',
                                databaseName: 'disabledTenantMaster',
                                options: {
                                    native_parser: true,
                                    poolSize: 5
                                }
                            },
                            test: {
                                URI: 'mongodb://localhost:27017',
                                databaseName: 'disabledTenantTest',
                                options: {
                                    native_parser: true,
                                    poolSize: 5
                                }
                            }
                        }
                    }
                }
            }
        }
    */
};