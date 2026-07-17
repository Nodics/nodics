/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module import/service/DefaultImportService
 * @description Coordinates init, core, sample, local, and governed remote import lifecycles, finalized-data processing, run status, and staging cleanup.
 * @layer service
 * @owner import
 * @override Projects may override individual import operations while preserving tenant scope, diagnostics, trusted headers, and cleanup behavior.
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

    /** Imports layered initialization data for selected modules and tenant scope. */
    importInitData: function (request) {
        request.dataType = 'init';
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {}).then(success => {
                if (success && (success.code === 'SUC_IMP_00001' || success.validationOnly)) {
                    resolve(success);
                } else {
                    let result = {
                        finalizer: success,
                        importRun: request.importRun
                    };
                    this.processImportData(this.createSystemProcessRequest(request)).then(success => {
                        result.import = success;
                        this.finalizeImportRun(request, 'COMPLETED');
                        resolve(result);
                    }).catch(error => {
                        this.finalizeImportRun(request, 'FAILED');
                        reject(error);
                    });
                }
            }).catch(error => {
                this.finalizeImportRun(request, 'FAILED');
                reject(error);
            });
        });
    },

    /** Imports layered core data for selected modules and tenant scope. */
    importCoreData: function (request) {
        request.dataType = 'core';
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {}).then(success => {
                if (success && (success.code === 'SUC_IMP_00001' || success.validationOnly)) {
                    resolve(success);
                } else {
                    let result = {
                        finalizer: success,
                        importRun: request.importRun
                    };
                    this.processImportData(this.createSystemProcessRequest(request)).then(success => {
                        result.import = success;
                        this.finalizeImportRun(request, 'COMPLETED');
                        resolve(result);
                    }).catch(error => {
                        this.finalizeImportRun(request, 'FAILED');
                        reject(error);
                    });
                }
            }).catch(error => {
                this.finalizeImportRun(request, 'FAILED');
                reject(error);
            });
        });
    },

    /** Imports layered sample data for selected modules and tenant scope. */
    importSampleData: function (request) {
        request.dataType = 'sample';
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {}).then(success => {
                if (success && (success.code === 'SUC_IMP_00001' || success.validationOnly)) {
                    resolve(success);
                } else {
                    let result = {
                        finalizer: success,
                        importRun: request.importRun
                    };
                    this.processImportData(this.createSystemProcessRequest(request)).then(success => {
                        result.import = success;
                        this.finalizeImportRun(request, 'COMPLETED');
                        resolve(result);
                    }).catch(error => {
                        this.finalizeImportRun(request, 'FAILED');
                        reject(error);
                    });
                }
            }).catch(error => {
                this.finalizeImportRun(request, 'FAILED');
                reject(error);
            });
        });
    },

    /** Builds the finalized-data processing request for a system import. */
    createSystemProcessRequest: function (request) {
        return {
            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
            importRun: request.importRun,
            inputPath: {
                rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                dataType: request.dataType,
                postFix: 'data'
            }
        };
    },

    /** Finalizes run diagnostics through the configured diagnostics service. */
    finalizeImportRun: function (request, status) {
        if (SERVICE.DefaultImportDiagnosticsService && typeof SERVICE.DefaultImportDiagnosticsService.finalizeRun === 'function') {
            return SERVICE.DefaultImportDiagnosticsService.finalizeRun(request, status);
        }
        if (request.importRun) {
            request.importRun.status = status;
            request.importRun.finishedAt = new Date().toISOString();
        }
        return request.importRun;
    },

    /** Initializes local data and optionally dispatches its finalized records. */
    importLocalData: function (request) {
        request.dataType = 'local';
        if (request.importFinalizeData) {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultPipelineService.start('localDataImportInitializerPipeline', request, {}).then(success => {
                    if (success && success.code && success.code === 'SUC_IMP_00001') {
                        resolve(success);
                    } else {
                        let result = {
                            finalizer: success,
                            importRun: request.importRun
                        };
                        let inputPath = {};
                        if (request.outputPath && request.outputPath.rootPath) {
                            inputPath = {
                                rootPath: request.outputPath.rootPath,
                                dataPath: request.outputPath.rootPath + '/data',
                                successPath: request.outputPath.successPath || request.outputPath.rootPath + '/success',
                                errorPath: request.outputPath.errorPath || request.outputPath.rootPath + '/error',
                                dataType: 'local',
                                postFix: 'data'
                            };
                        } else {
                            inputPath = {
                                rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                                dataType: 'local',
                                postFix: 'data'
                            };
                        }
                        SERVICE.DefaultImportService.processImportData({
                            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                            importRun: request.importRun,
                            inputPath: inputPath
                        }).then(success => {
                            result.import = success;
                            this.finalizeImportRun(request, 'COMPLETED');
                            resolve(result);
                        }).catch(error => {
                            this.finalizeImportRun(request, 'FAILED');
                            reject(error);
                        });
                    }
                }).catch(error => {
                    this.finalizeImportRun(request, 'FAILED');
                    reject(error);
                });
            });
        } else {
            return SERVICE.DefaultPipelineService.start('localDataImportInitializerPipeline', request, {});
        }
    },

    /** Stages governed remote data and optionally dispatches its finalized records. */
    importRemoteData: function (request) {
        request.dataType = 'remote';
        request.importFinalizeData = request.importFinalizeData !== false;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('remoteDataImportInitializerPipeline', request, {}).then(success => {
                if (!request.importFinalizeData || success && (success.code === 'SUC_IMP_00001' || success.validationOnly)) {
                    resolve(success);
                    return;
                }
                let result = { finalizer: success, importRun: request.importRun };
                this.processImportData({
                    tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                    importRun: request.importRun,
                    inputPath: {
                        rootPath: request.outputPath.rootPath,
                        dataPath: request.outputPath.dataPath,
                        successPath: request.outputPath.successPath,
                        errorPath: request.outputPath.errorPath,
                        dataType: 'remote',
                        postFix: 'data'
                    }
                }).then(importResult => {
                    result.import = importResult;
                    this.finalizeImportRun(request, 'COMPLETED');
                    resolve(result);
                }).catch(error => {
                    this.finalizeImportRun(request, 'FAILED');
                    reject(error);
                });
            }).catch(error => {
                this.finalizeImportRun(request, 'FAILED');
                reject(error);
            });
        }).finally(() => {
            if (SERVICE.DefaultRemoteImportTransportService) return SERVICE.DefaultRemoteImportTransportService.cleanup(request);
        });
    },

    /** Dispatches finalized import files through the standard processing pipeline. */
    processImportData: function (request) {
        return SERVICE.DefaultPipelineService.start('processDataImportPipeline', request, {});
    }
};
