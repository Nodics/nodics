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
                    schemaProperties: ['enum', 'minimum', 'maximum', 'exclusiveMaximum', 'pattern'],
                    defaultIndexes: ['_id'],
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
                    //URI: 'mongodb+srv://nodics:Nodics12345@nodicsmongonode0-wzf8z.gcp.mongodb.net',
                    //URI: 'mongodb+srv://nodicsMaster:Nodics15021981Master@nodicsmongonode0-q6lyz.gcp.mongodb.net',
                    databaseName: 'nodicsMaster',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5,
                        ignoreUndefined: true,
                        connectTimeoutMS: 60000,
                        useUnifiedTopology: true
                    }
                },
                test: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'nodicsTest',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5,
                        ignoreUndefined: true,
                        connectTimeoutMS: 60000,
                        useUnifiedTopology: true
                    }
                }
            }
        }
    }


    // const MongoClient = require('mongodb').MongoClient;
    // const uri = "mongodb+srv://<username>:<password>@nodicsmongonode0-wzf8z.gcp.mongodb.net/test?retryWrites=true&w=majority";
    // const client = new MongoClient(uri, { useNewUrlParser: true });
    // client.connect(err => {
    //   const collection = client.db("test").collection("devices");
    //   // perform actions on the collection object
    //   client.close();
    // });

};