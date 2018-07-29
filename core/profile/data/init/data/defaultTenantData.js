/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        _id: '111e7dd88ac6ed3d73a73411',
        name: 'testOne',
        active: true,
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
    record1: {
        _id: '111e7dd88ac6ed3d73a73311',
        name: 'default',
        active: true,
        properties: {
            tmpData: 'for default tenant data will be picked from property configuration'
        }
    }
};