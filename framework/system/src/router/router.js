/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    system: {
        //Need to remove this service, for init data, only system will take care
        importInitData: {
            importInit: {
                secured: true,
                key: '/import/init',
                method: 'GET',
                handler: 'DataImportController',
                operation: 'importInitData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/import/init',
                }
            }
        },
        importCoreData: {
            importPost: {
                secured: true,
                key: '/import/core',
                method: 'POST',
                controller: 'DataImportController',
                operation: 'importCoreData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/core',
                }
            }
        },
        importSampleData: {
            importPost: {
                secured: true,
                key: '/import/sample',
                method: 'POST',
                controller: 'DataImportController',
                operation: 'importSampleData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/sample',
                }
            }
        },
        /* ------------------------------- */
        testRunner: {
            runAllUTest: {
                secured: true,
                key: '/test/runUTest',
                method: 'GET',
                controller: 'TestExecutionController',
                operation: 'runUTest',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/test/runUTest',
                }
            },
            runAllNTest: {
                secured: true,
                key: '/test/runNTest',
                method: 'GET',
                controller: 'TestExecutionController',
                operation: 'runNTest',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/test/runNTest',
                }
            }
        },


        dataExport: {
            exportGet: {
                secured: true,
                key: '/export',
                method: 'GET',
                controller: 'DataExportController',
                operation: 'export',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/export',
                }
            },
            exportPost: {
                secured: true,
                key: '/export',
                method: 'POST',
                controller: 'DataExportController',
                operation: 'export',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/export',
                }
            }
        }
    }
};