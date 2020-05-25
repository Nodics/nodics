/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    system: {
        fileResponses: {
            returnFileContent: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/file/data',
                method: 'POST',
                controller: 'DefaultFileController',
                operation: 'getFileContent',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/file/data',
                    body: {
                        type: 'static/entiry',
                        path: 'Path of external location to get list of files',
                        fileName: 'Name of file'
                    }
                }
            },
            downloadFile: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/file/download',
                method: 'POST',
                controller: 'DefaultFileController',
                operation: 'downloadFile',
                responseHandler: 'fileDownloadResponseHandler',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/file/download',
                    body: {
                        path: 'Path of external location to get list of files',
                        fileName: 'Name of file'
                    }
                }
            }
        },

        importInitData: {
            importInitPost: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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

        importLocalData: {
            importLocalPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/import/local',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importLocalData',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/local',
                    body: {
                        inputPath: {
                            rootPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data",
                            dataPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/data",
                            headerPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/headers",
                            successPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/success",
                            errorPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/error"
                        }
                    }
                }
            }
        },

        changeLogLevel: {
            changeLevelPost: {
                secured: true,
                accessGroups: ['userGroup'],
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

        changeConfig: {
            changeConfigPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/config',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'changeConfig',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/config',
                    body: 'complete configuration heirerchy '
                }
            }
        },

        updateAllIndexes: {
            updateAllModulesIndexes: {
                secured: true,
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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
                accessGroups: ['userGroup'],
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