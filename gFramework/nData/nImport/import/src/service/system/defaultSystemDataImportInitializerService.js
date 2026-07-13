/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fse = require('fs-extra');

/**
 * @module gFramework/nData/nImport/import/src/service/system/defaultSystemDataImportInitializerService
 * @description Implements nData default system data import initializer service business behavior and extension logic.
 * @layer service
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request');
        if (!request.modules || !UTILS.isArray(request.modules) || request.modules.length <= 0) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property modules not have valid value'));
        } else {
            request.options = request.options || {};
            request.data = {};
            this.initImportRun(request);
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes generate run id behavior.

     *

     * @returns {*} Method result.

     */

    generateRunId: function () {
        let uniqueCode = (UTILS.generateUniqueCode && typeof UTILS.generateUniqueCode === 'function') ? UTILS.generateUniqueCode() : Date.now() + '_' + Math.floor(Math.random() * 100000);
        return 'import_' + uniqueCode;
    },

    /**

     * Retrieves default tenant information.

     *

     * @returns {*} Method result.

     */

    getDefaultTenant: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('defaultTenant')) || 'default';
    },

    /**

     * Initializes import run behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    initImportRun: function (request) {
        request.importRun = request.importRun || {
            runId: this.generateRunId(),
            dataType: request.dataType,
            tenant: request.tenant || this.getDefaultTenant(),
            modules: [].concat(request.modules),
            validationOnly: !!request.options.validateOnly,
            startedAt: new Date().toISOString(),
            finishedAt: null,
            status: 'RUNNING',
            summary: {
                headerFilesDiscovered: 0,
                dataFilesDiscovered: 0,
                enabledHeaders: 0,
                disabledHeaders: 0,
                matchedDataFiles: 0,
                unmatchedDataFiles: 0,
                headersWithoutDataFiles: 0,
                duplicateHeaders: 0,
                validationErrors: 0,
                recordsRead: 0,
                recordsFinalized: 0,
                recordsDispatched: 0,
                recordsSucceeded: 0,
                recordsFailed: 0,
                recordsSkipped: 0
            },
            headers: [],
            duplicateHeaders: [],
            dataFiles: {
                discovered: [],
                matched: [],
                unmatched: []
            },
            validationErrors: [],
            failures: []
        };
    },

    /**

     * Executes finish import run behavior.

     *

     * @param {*} request Method input.

     * @param {*} status Method input.

     * @returns {*} Method result.

     */

    finishImportRun: function (request, status) {
        if (SERVICE.DefaultImportDiagnosticsService && typeof SERVICE.DefaultImportDiagnosticsService.finalizeRun === 'function') {
            SERVICE.DefaultImportDiagnosticsService.finalizeRun(request, status);
            return;
        }
        if (request.importRun) {
            request.importRun.status = status;
            request.importRun.finishedAt = new Date().toISOString();
        }
    },

    /**

     * Updates duplicate header information.

     *

     * @param {*} request Method input.

     * @param {*} headerName Method input.

     * @param {*} owningModule Method input.

     * @param {*} headerFileName Method input.

     * @returns {*} Method result.

     */

    addDuplicateHeader: function (request, headerName, owningModule, headerFileName) {
        if (request.importRun) {
            request.importRun.summary.duplicateHeaders++;
            request.importRun.duplicateHeaders.push({
                headerName: headerName,
                owningModule: owningModule,
                headerFileName: headerFileName
            });
        }
    },

    /**

     * Runs pre-processing logic for pare input path.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    prepareInputPath: function (request, response, process) {
        this.LOG.debug('Preparing input data path');
        request.inputPath = {
            importType: 'system',
            dataType: request.dataType,
        };
        process.nextSuccess(request, response);
    },

    /**

     * Runs pre-processing logic for pare output path.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    prepareOutputPath: function (request, response, process) {
        this.LOG.debug('Preparing output data path');
        let rootPath = NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/' + request.dataType;
        request.outputPath = {
            rootPath: rootPath,
            dataPath: rootPath + '/data',
            successPath: rootPath + '/success',
            errorPath: rootPath + '/error'
        };
        process.nextSuccess(request, response);
    },

    /**

     * Executes flush output folder behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    flushOutputFolder: function (request, response, process) {
        this.LOG.debug('Cleaning output directory : ' + request.outputPath.dataPath);
        fse.remove(request.outputPath.dataPath).then(() => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Retrieves sub modules information.

     *

     * @param {*} moduleName Method input.

     * @returns {*} Method result.

     */

    getSubModules: function (moduleName) {
        let modules = [moduleName];
        let moduleObject = NODICS.getModule(moduleName);
        if (moduleObject.metaData.requiredModules && moduleObject.metaData.requiredModules.length > 0) {
            moduleObject.metaData.requiredModules.forEach(mName => {
                modules = modules.concat(this.getSubModules(mName));
            });
        }
        return modules;
    },
    /**
     * Retrieves header file list information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
    loadHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of header files from modules to be imported');
        if (request.options && request.options.recursive) {
            let moduleList = [];
            request.modules.forEach(moduleName => {
                moduleList = moduleList.concat(this.getSubModules(moduleName));
            });
            request.modules = moduleList;
            request.importRun.modules = [].concat(moduleList);
        }
        SERVICE.DefaultImportUtilityService.getSystemDataHeaders(request.modules, request.inputPath.dataType).then(success => {
            request.data.headerFiles = success;
            if (request.importRun) {
                request.importRun.summary.headerFilesDiscovered = Object.keys(success || {}).length;
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },


    /**


     * Retrieves data file list information.


     *


     * @param {*} request Method input.


     * @param {*} response Method input.


     * @param {*} process Method input.


     * @returns {*} Method result.


     */


    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of data files from modules to be imported');
        SERVICE.DefaultImportUtilityService.getSystemDataFiles(request.modules, request.inputPath.dataType).then(success => {
            request.data.dataFiles = success;
            if (request.importRun) {
                request.importRun.dataFiles.discovered = Object.keys(success || {});
                request.importRun.summary.dataFilesDiscovered = request.importRun.dataFiles.discovered.length;
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Retrieves file type information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    resolveFileType: function (request, response, process) {
        this.LOG.debug('Resolving file type');
        if (request.data && request.data.dataFiles) {
            _.each(request.data.dataFiles, (list, name) => {
                let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                request.data.dataFiles[name] = {
                    type: fileType,
                    list: list,
                    processedRecords: []
                };
            });
        }
        process.nextSuccess(request, response);
    },

    /**

     * Builds header instances data.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    buildHeaderInstances: function (request, response, process) {
        this.LOG.debug('Generating header instances from header files');
        let internalHeaderObj = {};
        if (request.data && request.data.headerFiles) {
            _.each(request.data.headerFiles, (list, name) => {
                list.forEach(element => {
                    internalHeaderObj[name] = _.merge(internalHeaderObj[name] || {}, require(element));
                });
            });
            _.each(internalHeaderObj, (headerFile, headerFileName) => {
                _.each(headerFile, (moduleHeaders, moduleName) => {
                    _.each(moduleHeaders, (header, headerName) => {
                        if (header.options.enabled) {
                            if (!request.data.headers) {
                                request.data.headers = {};
                            }
                            if (request.data.headers[headerName]) {
                                this.addDuplicateHeader(request, headerName, moduleName, headerFileName);
                            } else {
                                request.data.headers[headerName] = {};
                            }
                            request.data.headers[headerName] = _.merge(request.data.headers[headerName], header);
                            request.data.headers[headerName].options.moduleName = moduleName;
                            request.data.headers[headerName].options.owningModule = header.options.owningModule || moduleName;
                            request.data.headers[headerName].options.headerFileName = headerFileName;
                            request.data.headers[headerName].options.userGroups = (request.authData) ? request.authData.userGroups : request.data.headers[headerName].options.userGroups;
                            request.data.headers[headerName].dataFiles = {};
                            request.data.headers[headerName].options.dataHandler = (request.data.headers[headerName].options.indexName) ? 'indexerDataHandlerPipeline' : 'schemaDataHandlerPipeline';
                            request.data.headers[headerName].local = request.data.headers[headerName].local || {};
                            if (request.data.headers[headerName].options.finalizeData === undefined) {
                                request.data.headers[headerName].options.finalizeData = true;
                            }
                            if (request.importRun) {
                                request.importRun.summary.enabledHeaders++;
                                request.importRun.headers.push({
                                    headerName: headerName,
                                    owningModule: request.data.headers[headerName].options.owningModule,
                                    targetModule: request.data.headers[headerName].options.moduleName,
                                    schemaName: request.data.headers[headerName].options.schemaName,
                                    indexName: request.data.headers[headerName].options.indexName,
                                    operation: request.data.headers[headerName].options.operation,
                                    dataFilePrefix: request.data.headers[headerName].options.dataFilePrefix || headerName,
                                    headerFileName: headerFileName,
                                    matchedDataFiles: []
                                });
                            }
                        } else if (request.importRun) {
                            request.importRun.summary.disabledHeaders++;
                        }
                    });
                });
            });
        }
        process.nextSuccess(request, response);
    },

    /**

     * Validates prepared import rules.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    validatePreparedImport: function (request) {
        let errors = [];
        let fileTypeProcess = (CONFIG.get('data') && CONFIG.get('data').fileTypeProcess) || {};
        _.each(request.data.headers, (headerObject, headerName) => {
            let options = headerObject.options || {};
            if (!options.schemaName && !options.indexName) {
                errors.push({
                    headerName: headerName,
                    code: 'ERR_IMP_VALIDATE_00001',
                    message: 'Header must define either schemaName or indexName'
                });
            }
            if (!options.operation) {
                errors.push({
                    headerName: headerName,
                    code: 'ERR_IMP_VALIDATE_00002',
                    message: 'Header must define import operation'
                });
            }
            let isLocalModule = !NODICS.isModuleActive || NODICS.isModuleActive(options.moduleName);
            if (options.schemaName && NODICS.getModule && NODICS.getModule(options.moduleName)) {
                let moduleObject = NODICS.getModule(options.moduleName);
                if (moduleObject.rawSchema && !moduleObject.rawSchema[options.schemaName]) {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00003',
                        message: 'Schema not found for target module',
                        moduleName: options.moduleName,
                        schemaName: options.schemaName
                    });
                }
            }
            if (isLocalModule && options.schemaName && options.operation) {
                let schemaServiceName = 'Default' + options.schemaName.toUpperCaseFirstChar() + 'Service';
                if (!SERVICE[schemaServiceName] || typeof SERVICE[schemaServiceName][options.operation] !== 'function') {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00005',
                        message: 'Target schema service operation not found',
                        serviceName: schemaServiceName,
                        operation: options.operation
                    });
                }
            }
            if (isLocalModule && options.indexName && options.operation) {
                let indexServiceName = 'Default' + options.indexName.toUpperCaseFirstChar() + 'Service';
                let indexService = SERVICE[indexServiceName] || SERVICE.DefaultSearchService;
                if (!indexService || typeof indexService[options.operation] !== 'function') {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00006',
                        message: 'Target index service operation not found',
                        serviceName: indexServiceName,
                        operation: options.operation
                    });
                }
            }
            _.each(headerObject.dataFiles, dataFile => {
                if (!fileTypeProcess[dataFile.type]) {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00004',
                        message: 'File type process not configured',
                        fileType: dataFile.type
                    });
                }
            });
        });
        request.importRun.validationErrors = errors;
        request.importRun.summary.validationErrors = errors.length;
        return errors;
    },

    /**

     * Executes assign data files to header behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    assignDataFilesToHeader: function (request, response, process) {
        this.LOG.debug('Associating data files with corresponding headers');
        if (request.data && request.data.headers) {
            let matchedFiles = {};
            _.each(request.data.headers, (headerObject, headerName) => {
                let dataPreFix = headerObject.options.dataFilePrefix || headerName;
                _.each(request.data.dataFiles, (object, fileName) => {
                    if (fileName.startsWith(dataPreFix)) {
                        headerObject.dataFiles[fileName] = object;
                        matchedFiles[fileName] = true;
                        if (request.importRun) {
                            let headerRun = request.importRun.headers.find(item => item.headerName === headerName);
                            if (headerRun) {
                                headerRun.matchedDataFiles.push(fileName);
                            }
                        }
                    }
                });
            });
            if (request.importRun) {
                request.importRun.dataFiles.matched = Object.keys(matchedFiles);
                request.importRun.dataFiles.unmatched = Object.keys(request.data.dataFiles || {}).filter(fileName => !matchedFiles[fileName]);
                request.importRun.summary.matchedDataFiles = request.importRun.dataFiles.matched.length;
                request.importRun.summary.unmatchedDataFiles = request.importRun.dataFiles.unmatched.length;
                request.importRun.headers.forEach(headerRun => {
                    headerRun.hasDataFiles = headerRun.matchedDataFiles.length > 0;
                });
                request.importRun.summary.headersWithoutDataFiles = request.importRun.headers.filter(headerRun => !headerRun.hasDataFiles).length;
            }
            if (request.options && request.options.validateOnly) {
                let validationErrors = this.validatePreparedImport(request);
                this.finishImportRun(request, validationErrors.length > 0 ? 'FAILED' : 'VALIDATED');
                if (validationErrors.length > 0) {
                    process.error(request, response, new CLASSES.DataImportError('ERR_IMP_VALIDATE_00000', 'Import validation failed'));
                } else {
                    process.stop(request, response, {
                        code: 'SUC_IMP_VALIDATE_00000',
                        message: 'Import validation completed successfully',
                        validationOnly: true,
                        importRun: request.importRun
                    });
                }
                return;
            }
            delete request.data.headerFiles;
            delete request.data.dataFiles;
            process.nextSuccess(request, response);
        } else {
            this.finishImportRun(request, 'NO_DATA');
            process.stop(request, response, {
                code: 'SUC_IMP_00001',
                message: 'Could not find any data to import for given modules',
                importRun: request.importRun
            });
        }
    }
};
