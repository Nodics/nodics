/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const util = require('util');

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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request');
        if (!request.fileName) {
            process.error(request, response, 'Please validate request. Mandate property fileName not have valid value');
        } else if (!request.fileData) {
            process.error(request, response, 'Please validate request. Mandate property fileName not have valid value');
        } else if (!request.dataFiles) {
            process.error(request, response, 'Please validate request. Mandate property dataFiles not have valid value');
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadRawSchema: function (request, response, process) {
        this.LOG.debug('Loading raw schema for header');
        let header = request.fileData.header;
        header.rawSchema = NODICS.getModule(header.options.moduleName).rawSchema[header.options.schemaName];
        process.nextSuccess(request, response);
    },

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models from file: ' + request.fileName);
        if (request.fileData.models && Object.keys(request.fileData.models).length > 0) {
            let header = request.fileData.header;
            let tenants = [];
            if (request.tenant && (!header.options.tenants || header.options.tenants.includes(request.tenant))) {
                tenants = [request.tenant];
            } else if (!header.options.tenants) {
                tenants = NODICS.getTenants();
            } else {
                header.options.tenants.forEach(tenantName => {
                    if (NODICS.getTenants().includes(tenantName)) {
                        tenants.push(tenantName);
                    }
                });
            }
            this.processTenantModel(request, response, {
                tenants: tenants,
                pendingModels: Object.keys(request.fileData.models)
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }

    },

    processTenantModel: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.tenants && options.tenants.length > 0) {
                let tenant = options.tenants.shift();
                this.processModel(request, response, {
                    tenant: tenant,
                    pendingModels: Object.keys(request.fileData.models)
                }).then(success => {
                    _self.processTenantModel(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    processModel: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (options.pendingModels && options.pendingModels.length > 0) {
                    let fileObj = request.dataFiles[request.fileName];
                    let modelHash = options.pendingModels.shift();
                    let dataModel = request.fileData.models[modelHash];
                    if (!fileObj.processed.includes(modelHash)) {
                        SERVICE.DefaultPipelineService.start('processModelImportPipeline', {
                            tenant: options.tenant,
                            dataFiles: request.dataFiles,
                            fileName: request.fileName,
                            fileData: request.fileData,
                            dataModel: dataModel
                        }, {}).then(success => {
                            if (success && UTILS.isArray(success)) {
                                success.forEach(element => {
                                    response.success.push(element);
                                });
                            } else {
                                response.success.push(success);
                            }
                            fileObj.processed.push(modelHash);
                            _self.processModel(request, response, options).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};