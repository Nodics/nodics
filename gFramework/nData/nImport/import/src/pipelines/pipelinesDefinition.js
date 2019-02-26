/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
                success: 'prepareOutputURL'
            },
            prepareOutputURL: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.prepareOutputURL',
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
                success: 'processDataHeaders'
            },
            processDataHeaders: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.processDataHeaders',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultSystemDataImportInitializerService.handleErrorEnd'
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
                success: 'prepareOutputURL'
            },
            prepareOutputURL: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.prepareOutputURL',
                success: 'loadHeaderFileList'
            },
            loadHeaderFileList: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.loadHeaderFileList',
                success: 'loadDataFileList'
            },
            loadDataFileList: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.loadDataFileList',
                success: 'initDataImport'
            },
            initDataImport: {
                type: 'process',
                handler: 'dataImportInitializerPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultLocalDataImportInitializerService.handleErrorEnd'
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
                success: 'prepareOutputURL'
            },
            prepareOutputURL: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.prepareOutputURL',
                success: 'loadHeaderFileList'
            },
            loadHeaderFileList: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.loadHeaderFileList',
                success: 'loadDataFileList'
            },
            loadDataFileList: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.loadDataFileList',
                success: 'initDataImport'
            },
            initDataImport: {
                type: 'process',
                handler: 'dataImportInitializerPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultRemoteDataImportInitializerService.handleErrorEnd'
            }
        }
    },

    /*dataImportInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.validateRequest',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.flushOutputFolder',
                success: 'resolveFileType'
            },
            resolveFileType: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.resolveFileType',
                success: 'buildHeaderInstances'
            },
            buildHeaderInstances: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.buildHeaderInstances',
                success: 'assignDataFilesToHeader'
            },
            assignDataFilesToHeader: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.assignDataFilesToHeader',
                success: 'processDataHeaders'
            },
            processDataHeaders: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.processDataHeaders',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleErrorEnd'
            }
        }
    },*/

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
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.handleErrorEnd'
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
            successEnd: {
                type: 'function',
                handler: 'DefaultDataImportProcessService.handleSucessEnd'
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
                success: 'loadRawSchema'
            },
            loadRawSchema: {
                type: 'function',
                handler: 'DefaultFileDataImportProcessService.loadRawSchema',
                success: 'processModels'
            },
            processModels: {
                type: 'function',
                handler: 'DefaultFileDataImportProcessService.processModels',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultFileDataImportProcessService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultFileDataImportProcessService.handleErrorEnd'
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
                success: 'insertData'
            },
            insertData: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.insertData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultModelImportProcessService.handleErrorEnd'
            }
        }
    }
};