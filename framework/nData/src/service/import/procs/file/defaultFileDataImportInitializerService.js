/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');


module.exports = {

    loadInternalHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of header files from modules to be imported');
        if (request.modules && UTILS.isArray(request.modules) && request.modules.length > 0) {
            SERVICE.DefaultImportUtilityService.getInternalDataHeaders(request.modules, request.dataType).then(success => {
                request.internal.headerFiles = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        }
    },

    loadInternalDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of data files from modules to be imported: ', request.modules);
        if (request.modules && UTILS.isArray(request.modules) && request.modules.length > 0) {
            SERVICE.DefaultImportUtilityService.getInternalFiles(request.modules, request.dataType).then(success => {
                request.internal.dataFiles = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        }
    },

    loadExternalHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of headers from Path to be imported: ', request.path);
        if (request.path && request.path !== '') {
            SERVICE.DefaultImportUtilityService.getExternalDataHeaders(request.path).then(success => {
                request.external.headerFiles = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadExternalDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of files from Path to be imported');
        if (request.path && request.path !== '') {
            SERVICE.DefaultImportUtilityService.getExternalFiles(request.path).then(success => {
                request.external.dataFiles = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    resolveFileType: function (request, response, process) {
        this.LOG.debug('Resolving file type');
        if (request.internal && request.internal.dataFiles) {
            _.each(request.internal.dataFiles, (list, name) => {
                let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                request.internal.dataFiles[name] = {
                    type: fileType,
                    list: list,
                    processedRecords: []
                };
            });
        }

        if (request.external && request.external.dataFiles) {
            _.each(request.external.dataFiles, (list, name) => {
                let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                request.external.dataFiles[name] = {
                    type: fileType,
                    list: list,
                    processedRecords: []
                };
            });
        }

        process.nextSuccess(request, response);
    },

    buildHeaderInstances: function (request, response, process) {
        this.LOG.debug('Generating header instances from header files');
        let internalHeaderObj = {};
        let externalHeaderObj = {};
        if (request.internal && request.internal.headerFiles) {
            _.each(request.internal.headerFiles, (list, name) => {
                list.forEach(element => {
                    internalHeaderObj[name] = _.merge(internalHeaderObj[name] || {}, require(element));
                });
            });

            _.each(internalHeaderObj, (headerFile, headerFileName) => {
                _.each(headerFile, (moduleHeaders, moduleName) => {
                    if (NODICS.isModuleActive(moduleName)) {
                        _.each(moduleHeaders, (header, headerName) => {
                            if (!request.internal.headers) {
                                request.internal.headers = {};
                            }
                            if (!request.internal.headers[headerName]) {
                                request.internal.headers[headerName] = {
                                    header: {},
                                    dataFiles: {}
                                };
                            }
                            request.internal.headers[headerName].header = _.merge(request.internal.headers[headerName].header, header);
                            request.internal.headers[headerName].header.options.moduleName = moduleName;
                        });
                    }
                });
            });
        }

        if (request.external && request.external.headerFiles) {
            _.each(request.external.headerFiles, (list, name) => {
                list.forEach(element => {
                    externalHeaderObj[name] = _.merge(externalHeaderObj[name] || {}, require(element));
                });
            });

            _.each(externalHeaderObj, (headerFile, headerFileName) => {
                _.each(headerFile, (moduleHeaders, moduleName) => {
                    if (NODICS.isModuleActive(moduleName)) {
                        _.each(moduleHeaders, (header, headerName) => {
                            if (!request.external.headers) {
                                request.external.headers = {};
                            }
                            if (!request.external.headers[headerName]) {
                                request.external.headers[headerName] = {
                                    header: {},
                                    dataFiles: {}
                                };
                            }
                            request.external.headers[headerName].header = _.merge(request.external.headers[headerName].header, header);
                            request.external.headers[headerName].header.options.moduleName = moduleName;
                        });
                    }
                });
            });
        }
        process.nextSuccess(request, response);
    },

    assignDataFilesToHeader: function (request, response, process) {
        this.LOG.debug('Associating data files with corresponding headers');

        if (request.internal && request.internal.headers) {
            _.each(request.internal.headers, (headerObject, headerName) => {
                let dataPreFix = headerObject.header.options.dataFilePrefix || headerName;
                _.each(request.internal.dataFiles, (object, fileName) => {
                    if (fileName.startsWith(dataPreFix)) {
                        headerObject.dataFiles[fileName] = object;
                    }
                });
            });
        }

        if (request.external && request.external.headers) {
            _.each(request.external.headers, (headerObject, headerName) => {
                let dataPreFix = headerObject.header.options.dataFilePrefix || headerName;
                _.each(request.external.dataFiles, (object, fileName) => {
                    if (fileName.startsWith(dataPreFix)) {
                        headerObject.dataFiles[fileName] = object;
                    }
                });
            });
        }
        process.nextSuccess(request, response);
    },

    processInternalDataHeaders: function (request, response, process) {
        this.LOG.debug('Starting internal data import process');
        try {
            if (request.internal && request.internal.headers) {
                this.processHeaders(request, response, {
                    phase: 0,
                    importType: 'internal',
                    pendingHeaders: Object.keys(request.internal.headers)
                }).then(success => {
                    if (response.errors.length > 0) {
                        process.error(request, response);
                    } else {
                        process.nextSuccess(request, response);
                    }
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.debug('No data found from internal path to import');
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    processExternalDataHeaders: function (request, response, process) {
        this.LOG.debug('Starting external data import process');
        try {
            if (request.external && request.external.headers) {
                this.processHeaders(request, response, {
                    phase: 0,
                    importType: 'external',
                    pendingHeaders: Object.keys(request.external.headers)
                }).then(success => {
                    if (response.errors.length > 0) {
                        process.error(request, response);
                    } else {
                        process.nextSuccess(request, response);
                    }
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.debug('No data found from external path to import');
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    processHeaders: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let phaseLimit = CONFIG.get('dataImportPhasesLimit') || 5;
            if (request[options.importType] && options.phase < phaseLimit) {
                let headers = request[options.importType].headers;
                if (options.pendingHeaders && options.pendingHeaders.length > 0 && headers && !UTILS.isBlank(headers)) {
                    let headerName = options.pendingHeaders.shift();
                    let header = headers[headerName];
                    if (!header.done || header.done === false) {
                        this.LOG.debug('Starting process for header: ', headerName, '  Phase: ', options.phase + 1);
                        _self.processHeader(request, response, {
                            phase: options.phase,
                            importType: options.importType,
                            headerName: headerName
                        }).then(success => {
                            _self.processNextHeader(request, response, options, resolve, reject);
                        }).catch(error => {
                            if (options.phase >= phaseLimit - 1) {
                                error.forEach(element => {
                                    response.errors.push({ element });
                                });
                            }
                            _self.processNextHeader(request, response, options, resolve, reject);
                        });
                    } else {
                        _self.processNextHeader(request, response, options, resolve, reject);
                    }
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    },
    processNextHeader: function (request, response, options, resolve, reject) {
        let headers = request[options.importType].headers;
        let phaseLimit = CONFIG.get('dataImportPhasesLimit') || 5;
        if (options.pendingHeaders && options.pendingHeaders.length <= 0) {
            if (SERVICE.DefaultImportUtilityService.isImportPending(headers)) {
                options.phase = options.phase + 1;
                options.pendingHeaders = Object.keys(request[options.importType].headers);
            } else {
                options.phase = phaseLimit;
            }
        }

        this.processHeaders(request, response, options).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
        });
    },

    processHeader: function (request, response, options) {
        this.LOG.debug('Processing header name : ', options.headerName);
        return new Promise((resolve, reject) => {
            request.phase = options.phase;
            request.importType = options.importType;
            request.headerName = options.headerName;
            SERVICE.DefaultPipelineService.start('headerProcessPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    }
};