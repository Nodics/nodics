/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    tntName: 'Node Tenant',

    database: {
        default: {
            master: {
                URI: 'mongodb://localhost:27017/himkarMaster',
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
                URI: 'mongodb://localhost:27017/himkarTest',
                options: {
                    db: {
                        native_parser: true
                    },
                    server: {
                        poolSize: 5
                    }
                }
            }
        },
        user: {
            master: {
                URI: 'mongodb://localhost:27017/userHimkarMaster',
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
                URI: 'mongodb://localhost:27017/userHimkarTest',
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

};