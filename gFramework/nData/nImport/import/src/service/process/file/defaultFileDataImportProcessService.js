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
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property fileName not have valid value'));
        } else if (!request.fileData) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property fileName not have valid value'));
        } else if (!request.dataFiles) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property dataFiles not have valid value'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models from file: ' + request.fileName);
        if (request.fileData.models && Object.keys(request.fileData.models).length > 0) {
            let header = request.fileData.header;
            let tenants = header.options.tenants || NODICS.getActiveTenants();
            if (request.tenant) {
                tenants = [request.tenant];
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
                let activeTenants = request.fileData.header.options.tenants || NODICS.getActiveTenants();
                if (activeTenants.includes(tenant) && NODICS.getActiveTenants().includes(tenant)) {
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
                    _self.LOG.warn('Tenant: ' + tenant + ' is no more active');
                    _self.processTenantModel(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
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
                    let header = request.fileData.header;
                    if (!fileObj.processed.includes(modelHash)) {
                        SERVICE.DefaultPipelineService.start('processModelImportPipeline', {
                            tenant: options.tenant,
                            authData: {
                                userGroups: header.options.userGroups
                            },
                            header: header,
                            dataModel: dataModel
                        }, {}).then(success => {
                            if (!response.success) response.success = [];
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
                reject(new CLASSES.DataImportError(error));
            }
        });
    }
};