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
            importInitPost: {
                secured: true,
                key: '/import/init',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importInitData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/init',
                    body: {
                        modules: 'List of modules to pick initial data or',
                        path: 'Path of external location to get list of files'
                    }
                }
            }
        },
        importCoreData: {
            importCorePost: {
                secured: true,
                key: '/import/core',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importCoreData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/core',
                    body: {
                        modules: 'List of modules to pick initial data or',
                        path: 'Path of external location to get list of files'
                    }
                }
            }
        },
        importSampleData: {
            importSamplePost: {
                secured: true,
                key: '/import/sample',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importSampleData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/sample',
                    body: {
                        modules: 'List of modules to pick initial data or',
                        path: 'Path of external location to get list of files'
                    }
                }
            }
        },
        changeLogLevel: {
            changeLevelPost: {
                secured: true,
                key: '/log/level',
                method: 'POST',
                controller: 'DefaultLogController',
                operation: 'changeLogLevel',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/log/level',
                    body: {
                        entityName: 'like EnterpriseService',
                        logLevel: 'like info, debug, error and all valid log levels'
                    }
                }
            }
        },
        updateAllIndexes: {
            updateAllModulesIndexes: {
                secured: true,
                key: '/schema/indexes/all',
                method: 'GET',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateModulesIndexes',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes/all'
                }
            },
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