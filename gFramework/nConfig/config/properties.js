/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/config/properties
 * @description Baseline platform properties loaded before later active-module, external-file, tenant, and runtime configuration layers. These values support bootstrap when tenant-specific configuration is not yet available.
 * @layer config
 * @owner nConfig
 * @override Later project, environment, server, and node modules may override these keys through their own `config/properties.js`; secrets and production credentials must come from governed external or runtime sources.
 * @property {string} defaultTenant Bootstrap tenant used before request tenant resolution.
 * @property {string} defaultEnterprise Bootstrap enterprise used before request enterprise resolution.
 * @property {boolean} dynamoEnabled Enables governed runtime configuration capabilities.
 * @property {Object} log Default logging transports and levels.
 */
module.exports = {
    errorExitCode: 1,

    /*
        If system is running is multi cluster node, this property value needs to be configured. 
        Two different system can't run with same node id.
    */
    nodeId: 'node0',

    /**
     * System id is to group all clusters running for same module
     */
    systemId: 0,

    /*
        These values are used as system values, so can't be used as veriable or class name
    */
    illegalUsernames: [
        'nodics', 'administrator', 'password', 'admin', 'user', 'unknown', 'anonymous', 'null', 'undefined', 'api'
    ],

    /*
        - Incase you want some of the properties needs to be loaded from outside of config directory.
        - System will look this file from root of Nodics HOME
        - In this case path will be NODICS_HOME/externalProps.js
        externalPropertyFile: [
            'externalProps.js'
        ]
        - File format of external file will be :
        module.exports = {
            externalProperty: [
                'nodics'
            ]
        }
    */
    externalPropertyFile: [
        'externalProps.js'
    ],
    // User database related setting
    // samples
    // databaseUserURI = mongodb://user:pass@localhost:port/database
    // databaseUserURI = mongodb://user:pass@localhost:port,anotherhost:port,yetanother:port/mydatabase
    // databaseUserURI = mongodb://hostA:27501,hostB:27501
    // databaseUserURI = mongodb://nonexistent.domain:27000
    dynamoEnabled: false,
    defaultContentType: 'application/json',
    defaultTenant: 'default',
    defaultEnterprise: 'default',
    profileModuleName: 'profile',
    nemsModuleName: 'nems',
    dynamoModuleName: 'dynamo',
    systemModuleName: 'system',
    workflowModuleName: 'workflow',
    processRetrySleepTime: 2000,
    defaultAuthDetail: {
        entCode: 'default',
        tenant: 'default',
        loginId: 'apiAdmin'
    },

    log: {
        enabled: true,
        level: 'debug',
        transports: {
            console: {
                consoleTransport: {
                    enabled: true,
                    format: 'simple'
                }
            },
            file: {
                fileErrorLog: {
                    enabled: false,
                    format: 'simple',
                    options: {
                        filename: 'nodics-error.log',
                        level: 'error',
                        maxsize: '20971520',
                        maxFiles: '14',
                        tailable: true,
                        zippedArchive: true
                    }
                },
                fileRestLog: {
                    enabled: false,
                    format: 'simple',
                    options: {
                        filename: 'nodics.log',
                        level: 'debug',
                        maxsize: '20971520',
                        maxFiles: '14',
                        tailable: true,
                        zippedArchive: true
                    }
                }
            },
            elastic: {
                elasticLogRecorder: {
                    enabled: false,
                    format: 'simple',
                    options: {
                        level: 'debug',
                        index: 'nodicsLog'
                    },
                    client: {
                        hosts: ['http://localhost:9200']
                    }
                }
            }
        }
    }
};
