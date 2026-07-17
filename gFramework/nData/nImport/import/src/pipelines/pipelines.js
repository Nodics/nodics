/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module import/pipelines/pipelines
 * @description Declares system, local, governed remote, header, file, and model import pipelines using reusable initializer and processing services.
 * @layer pipeline
 * @owner import
 * @override Later modules may override pipeline nodes while preserving tenant validation, trusted-header, diagnostics, and persistence contracts.
 */
module.exports = {
    systemDataImportInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.validateRequest',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.prepareInputPath',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.flushOutputFolder',
                success: 'loadHeaderFileList'
            },
            loadHeaderFileList: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.loadHeaderFileList',
                success: 'loadDataFileList'
            },
            loadDataFileList: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.loadDataFileList',
                success: 'resolveFileType'
            },
            resolveFileType: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.resolveFileType',
                success: 'buildHeaderInstances'
            },
            buildHeaderInstances: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.buildHeaderInstances',
                success: 'assignDataFilesToHeader'
            },
            assignDataFilesToHeader: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.assignDataFilesToHeader',
                success: 'initDataImport'
            },
            initDataImport: {
                type: 'process',
                handler: 'dataImportInitializerPipeline',
                success: 'successEnd'
            }
        }
    },
    localDataImportInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.validateRequest',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.prepareInputPath',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.flushOutputFolder',
                success: 'loadHeaderFileList'
            },
            loadHeaderFileList: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.loadHeaderFileList',
                success: 'buildHeaderInstances'
            },
            buildHeaderInstances: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.buildHeaderInstances',
                success: 'loadDataFileList'
            },
            loadDataFileList: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.loadDataFileList',
                success: 'resolveFileType'
            },
            resolveFileType: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.resolveFileType',
                success: 'initDataImport'
            },
            initDataImport: {
                type: 'process',
                handler: 'dataImportInitializerPipeline',
                success: 'successEnd'
            }
        }
    },
    remoteDataImportInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.validateRequest',
                success: 'preparePaths'
            },
            preparePaths: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.preparePaths',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.flushOutputFolder',
                success: 'stageRemoteData'
            },
            stageRemoteData: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.stageRemoteData',
                success: 'loadHeaderFileList'
            },
            loadHeaderFileList: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.loadHeaderFileList',
                success: 'buildHeaderInstances'
            },
            buildHeaderInstances: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.buildHeaderInstances',
                success: 'loadDataFileList'
            },
            loadDataFileList: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.loadDataFileList',
                success: 'resolveFileType'
            },
            resolveFileType: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.resolveFileType',
                success: 'initDataImport'
            },
            initDataImport: {
                type: 'process',
                handler: 'dataImportInitializerPipeline',
                success: 'successEnd'
            }
        }
    },
    dataImportInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.validateRequest',
                success: 'processDataHeaders'
            },
            processDataHeaders: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.processDataHeaders',
                success: 'successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleErrorEnd'
            }
        }
    },
    headerProcessPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.validateRequest',
                success: 'processHeaderFiles'
            },
            processHeaderFiles: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.processHeaderFiles',
                success: 'successEnd'
            }
        }
    },
    processDataImportPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataImportProcessService.validateRequest',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultDataImportProcessService.prepareInputPath',
                success: 'loadDataFiles'
            },
            loadDataFiles: {
                type: 'function',
                handler: 'DefaultDataImportProcessService.loadDataFiles',
                success: 'processDataFiles'
            },
            processDataFiles: {
                type: 'function',
                handler: 'DefaultDataImportProcessService.processDataFiles',
                success: 'successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataImportProcessService.handleErrorEnd'
            }
        }
    },
    processFileDataImportPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultFileDataImportProcessService.validateRequest',
                success: 'processModels'
            },
            processModels: {
                type: 'function',
                handler: 'DefaultFileDataImportProcessService.processModels',
                success: 'successEnd'
            }
        }
    },
    processModelImportPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.validateRequest',
                success: 'loadRawSchema'
            },
            loadRawSchema: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.loadRawSchema',
                success: 'enforceImportAccessPolicies'
            },
            enforceImportAccessPolicies: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.enforceImportAccessPolicies',
                success: 'populateSchemaDependancies'
            },
            populateSchemaDependancies: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.populateSchemaDependancies',
                success: 'populateSearchDependancies'
            },
            populateSearchDependancies: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.populateSearchDependancies',
                success: 'insertModel'
            },
            insertModel: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.insertModel',
                success: 'successEnd'
            }
        }
    }
};
