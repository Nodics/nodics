/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    errorExitCode: 1,

    /*
        If system is running is multi cluster node, this property value needs to be configured. 
        Two different system can't run with same node id.
    */
    nodeId: '0',

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

    defaultContentType: 'application/json',
    profileModuleName: 'profile',
    processRetrySleepTime: 2000,
    defaultAuthDetail: {
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbb3c81bff',
        enterpriseCode: 'default',
        tenant: 'default',
        loginId: 'apiAdmin'
    },
    //https://github.com/winstonjs/winston/issues/1134
    log: {
        enabled: true,
        level: 'debug',
        format: 'simple', //json or simple
        output: {
            file: true,
            elastic: false
        },
        consoleConfig: {
            colorize: true,
            timestamp: true,
            json: false,
            stringify: false,
            prettyPrint: false,
            depth: 5,
            humanReadableUnhandledException: true,
            showLevel: true
        },
        fileConfig: {
            dirname: '.',
            filename: 'nodics-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            json: false,
            stringify: true,
            maxSize: '20m',
            maxFiles: '14d'
        },
        elasticConfig: {

        }
    },
    jwtSecretKey: 'nodics'
};