/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    system: {
        testRunner: {
            runAllUTest: {
                secured: true,
                key: '/test/runUTest',
                method: 'GET',
                controller: 'CONTROLLER.TestRunnerController.runUTest'
            },
            runAllNTest: {
                secured: true,
                key: '/test/runNTest',
                method: 'GET',
                controller: 'CONTROLLER.TestRunnerController.runNTest'
            }
        },
        importInitData: {
            importInit: {
                secured: true,
                key: '/import/init',
                method: 'GET',
                handler: 'CONTROLLER.DataImportController.importInitData'
            },
        },
        importCoreData: {
            importGet: {
                secured: true,
                key: '/import/core',
                method: 'GET',
                controller: 'CONTROLLER.DataImportController.importCoreData'
            },
            importPost: {
                secured: true,
                key: '/import/core',
                method: 'POST',
                controller: 'CONTROLLER.DataImportController.importCoreData'
            }
        },
        importSampleData: {
            importGet: {
                secured: true,
                key: '/import/sample',
                method: 'GET',
                controller: 'CONTROLLER.DataImportController.importSampleData'
            },
            importPost: {
                secured: true,
                key: '/import/sample',
                method: 'POST',
                controller: 'CONTROLLER.DataImportController.importSampleData'
            }
        },
        dataExport: {
            exportGet: {
                secured: true,
                key: '/export',
                method: 'GET',
                controller: 'CONTROLLER.DataExportController.export'
            },
            exportPost: {
                secured: true,
                key: '/export',
                method: 'POST',
                controller: 'CONTROLLER.DataExportController.export'
            }
        }
    }
};