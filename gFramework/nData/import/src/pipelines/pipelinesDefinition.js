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
                success: 'initDataImport'
            },
            initDataImport: {
                type: 'process',
                handler: 'dataImportInitializerPipeline',
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

    dataImportInitializerPipeline: {
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
    },

    headerProcessPipeline: {
        startNode: "validateHeader",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateHeader: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.validateHeader',
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

    jsonFileDataReaderPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultJsonFileDataReaderProcessService.validateRequest',
                success: 'readDataChunk'
            },
            readDataChunk: {
                type: 'function',
                handler: 'DefaultJsonFileDataReaderProcessService.readDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultJsonFileDataReaderProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultJsonFileDataReaderProcessService.handleErrorEnd'
            }
        }
    },

    jsonFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.processDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.handleErrorEnd'
            }
        }
    },

    JsonDataHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.executeDataProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultJsonDataHandlerProcessService.handleErrorEnd'
            }
        }
    },

    csvFileDataReaderPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.validateRequest',
                success: 'readFilesData'
            },
            readFilesData: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.readFilesData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultCsvFileDataReaderProcessService.handleErrorEnd'
            }
        }
    },

    csvFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.processDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultCsvFileDataProcessService.handleErrorEnd'
            }
        }
    },

    csvDataHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.executeDataProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultCsvDataHandlerProcessService.handleErrorEnd'
            }
        }
    },

    excelFileDataReaderPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.validateRequest',
                success: 'readFilesData'
            },
            readFilesData: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.readFilesData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExcelFileDataReaderProcessService.handleErrorEnd'
            }
        }
    },

    excelFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.processDataChunk',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.handleErrorEnd'
            }
        }
    },

    excelDataHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.executeDataProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExcelDataHandlerProcessService.handleErrorEnd'
            }
        }
    },
};