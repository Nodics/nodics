/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profileModuleReconnectTimeout: 5000,

    database: {
        default: {
            mongodb: {
                options: {
                    connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService',
                    schemaHandler: 'DefaultMongodbDatabaseSchemaHandlerService',
                    modelHandler: 'DefaultMongodbDatabaseModelHandlerService',
                    interceptorHandler: 'DefaultMongodbDatabaseInterceptorHandlerService',
                    modelSaveOptions: {
                        upsert: true,
                        returnOriginal: false
                    },
                    modelUpdateOptions: {
                        upsert: false,
                        returnOriginal: false
                    },
                    modelRemoveOptions: {
                        j: false
                    },
                },
                master: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'nodicsMaster',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5,
                        ignoreUndefined: true,
                        connectTimeoutMS:60000
                    }
                },
                test: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'nodicsTest',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5,
                        ignoreUndefined: true,
                        connectTimeoutMS:60000
                    }
                }
            }
        }
    }
};