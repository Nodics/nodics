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
                if (success && success.code && success.code === 'SUC_IMP_00001') {
                    resolve(success);
                } else {
                    let result = {
                        finalizer: success
                    };
                    this.processImportData({
                        tenant: request.tenant || 'default',
                        inputPath: {
                            rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                            dataType: request.dataType,
                            postFix: 'data'
                        }
                    }).then(success => {
                        result.import = success;
                        resolve(result);
                    }).catch(error => {
                        NODICS.LOG.error('Initial data import failed : ', error);
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    importCoreData: function (request) {
        request.dataType = 'core';
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {}).then(success => {
                if (success.code && success.code === 'SUC_IMP_00001') {
                    resolve(success);
                } else {
                    let result = {
                        finalizer: success
                    };
                    this.processImportData({
                        tenant: request.tenant || 'default',
                        inputPath: {
                            rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                            dataType: request.dataType,
                            postFix: 'data'
                        }
                    }).then(success => {
                        result.import = success;
                        resolve(result);
                    }).catch(error => {
                        NODICS.LOG.error('Initial data import failed : ', error);
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    importSampleData: function (request) {
        request.dataType = 'sample';
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {}).then(success => {
                if (success.code && success.code === 'SUC_IMP_00001') {
                    resolve(success);
                } else {
                    let result = {
                        finalizer: success
                    };
                    this.processImportData({
                        tenant: request.tenant || 'default',
                        inputPath: {
                            rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                            dataType: request.dataType,
                            postFix: 'data'
                        }
                    }).then(success => {
                        result.import = success;
                        resolve(result);
                    }).catch(error => {
                        NODICS.LOG.error('Initial data import failed : ', error);
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    importLocalData: function (request) {
        if (request.importFinalizeData) {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultPipelineService.start('localDataImportInitializerPipeline', request, {}).then(success => {
                    if (success && success.code && success.code === 'SUC_IMP_00001') {
                        resolve(success);
                    } else {
                        let result = {
                            finalizer: success
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
                            inputPath: inputPath
                        }).then(success => {
                            result.import = success;
                            resolve(result);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                }).catch(error => {
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