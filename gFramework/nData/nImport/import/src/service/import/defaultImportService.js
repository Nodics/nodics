/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    importLocalData: function (request) {
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
                            tenant: request.tenant,
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

    importRemoteData: function (request) {
        return SERVICE.DefaultPipelineService.start('remoteDataImportInitializerPipeline', request, {});
    },

    processImportData: function (request) {
        return SERVICE.DefaultPipelineService.start('processDataImportPipeline', request, {});
    }
};
