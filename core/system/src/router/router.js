/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    system: {
        changeCacheConfig: {
            apiConfig: {
                secured: true,
                key: '/cache/api',
                method: 'POST',
                controller: 'CacheController',
                operation: 'changeApiCacheConfiguration'
            },
            itemConfig: {
                secured: true,
                key: '/cache/item',
                method: 'POST',
                controller: 'CacheController',
                operation: 'changeItemCacheConfiguration'
            }
        },
        changeLogLevel: {
            changeLevelPost: {
                secured: true,
                key: '/log/level',
                method: 'POST',
                controller: 'LogController',
                operation: 'changeLogLevel'
            }
        },
        testRunner: {
            runAllUTest: {
                secured: true,
                key: '/test/runUTest',
                method: 'GET',
                controller: 'TestExecutionController',
                operation: 'runUTest'
            },
            runAllNTest: {
                secured: true,
                key: '/test/runNTest',
                method: 'GET',
                controller: 'TestExecutionController',
                operation: 'runNTest'
            }
        },
        importInitData: {
            importInit: {
                secured: true,
                key: '/import/init',
                method: 'GET',
                handler: 'DataImportController',
                operation: 'importInitData'
            },
        },
        importCoreData: {
            importGet: {
                secured: true,
                key: '/import/core',
                method: 'GET',
                controller: 'DataImportController',
                operation: 'importCoreData'
            },
            importPost: {
                secured: true,
                key: '/import/core',
                method: 'POST',
                controller: 'DataImportController',
                operation: 'importCoreData'
            }
        },
        importSampleData: {
            importGet: {
                secured: true,
                key: '/import/sample',
                method: 'GET',
                controller: 'DataImportController',
                operation: 'importSampleData'
            },
            importPost: {
                secured: true,
                key: '/import/sample',
                method: 'POST',
                controller: 'DataImportController',
                operation: 'importSampleData'
            }
        },
        dataExport: {
            exportGet: {
                secured: true,
                key: '/export',
                method: 'GET',
                controller: 'DataExportController',
                operation: 'export'
            },
            exportPost: {
                secured: true,
                key: '/export',
                method: 'POST',
                controller: 'DataExportController',
                operation: 'export'
            }
        }
    }
};