/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const util = require('util');

/**
 * @module gFramework/nData/nImport/import/src/service/process/file/defaultFileDataImportProcessService
 * @description Implements nData default file data import process service business behavior and extension logic.
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

    /**

     * Processes models behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models from file: ' + request.fileName);
        if (request.fileData.models && Object.keys(request.fileData.models).length > 0) {
            let header = request.fileData.header;
            let tenants;
            try {
                tenants = this.resolveTargetTenants(request, header);
            } catch (error) {
                process.error(request, response, error);
                return;
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

    /**
     * Resolves the safe tenant set for one finalized import header.
     * A request tenant narrows the header tenant set and can never broaden it.
     *
     * @param {Object} request Import request carrying an optional trusted tenant scope.
     * @param {Object} header Effective layered import header.
     * @returns {string[]} Active tenants allowed by both request and header contracts.
     * @throws {CLASSES.DataImportError} When an explicit request tenant is inactive.
     */
    resolveTargetTenants: function (request, header) {
        let activeTenants = Array.from(new Set([].concat(NODICS.getActiveTenants() || []).filter(Boolean)));
        let configuredTenants = header && header.options && header.options.tenants;
        let headerTenants = configuredTenants && configuredTenants.length > 0 ?
            Array.from(new Set([].concat(configuredTenants).filter(Boolean))) : activeTenants;
        if (request.tenant) {
            if (!activeTenants.includes(request.tenant)) {
                throw new CLASSES.DataImportError('ERR_IMP_00003', 'Requested import tenant is not active: ' + request.tenant);
            }
            if (!headerTenants.includes(request.tenant)) {
                this.recordTenantExclusion(request, request.tenant, headerTenants);
                return [];
            }
            this.recordTargetTenants(request, [request.tenant]);
            return [request.tenant];
        }
        let resolvedTenants = headerTenants.filter(tenant => activeTenants.includes(tenant));
        this.recordTargetTenants(request, resolvedTenants);
        return resolvedTenants;
    },

    /** Records resolved target tenants in import diagnostics without duplicates. */
    recordTargetTenants: function (request, tenants) {
        if (request.importRun) {
            request.importRun.targetTenants = Array.from(new Set([].concat(request.importRun.targetTenants || [], tenants || [])));
        }
    },

    /** Records a safe no-dispatch decision when request and header tenant scopes do not intersect. */
    recordTenantExclusion: function (request, tenant, headerTenants) {
        this.LOG.warn('Skipping import header because requested tenant is outside header scope: ' + tenant);
        if (request.importRun) {
            request.importRun.tenantExclusions = request.importRun.tenantExclusions || [];
            request.importRun.tenantExclusions.push({
                requestedTenant: tenant,
                headerTenants: [].concat(headerTenants || [])
            });
        }
    },

    /**

     * Processes tenant model behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    processTenantModel: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.tenants && options.tenants.length > 0) {
                let tenant = options.tenants.shift();
                let activeTenants = [].concat(request.fileData.header.options.tenants || NODICS.getActiveTenants());
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

    /**

     * Processes model behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    processModel: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (options.pendingModels && options.pendingModels.length > 0) {
                    let fileObj = request.dataFiles[request.fileName];
                    let modelHash = options.pendingModels.shift();
                    let dataModel = request.fileData.models[modelHash];
                    let header = request.fileData.header;
                    let processedKey = options.tenant + ':' + modelHash;
                    if (!fileObj.processed.includes(processedKey)) {
                        if (SERVICE.DefaultImportDiagnosticsService) {
                            SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsDispatched', 1);
                        }
                        SERVICE.DefaultPipelineService.start('processModelImportPipeline', {
                            tenant: options.tenant,
                            authData: {
                                userGroups: header.options.userGroups
                            },
                            header: header,
                            dataModel: dataModel,
                            importRun: request.importRun
                        }, {}).then(success => {
                            if (SERVICE.DefaultImportDiagnosticsService) {
                                SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsSucceeded', 1);
                            }
                            if (!response.success) response.success = [];
                            if (success && UTILS.isArray(success)) {
                                success.forEach(element => {
                                    response.success.push(element);
                                });
                            } else {
                                response.success.push(success);
                            }
                            fileObj.processed.push(processedKey);
                            _self.processModel(request, response, options).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            if (SERVICE.DefaultImportDiagnosticsService) {
                                SERVICE.DefaultImportDiagnosticsService.addFailure(request, {
                                    tenant: options.tenant,
                                    owningModule: header.options.owningModule,
                                    targetModule: header.options.moduleName,
                                    fileName: request.fileName,
                                    recordKey: modelHash,
                                    schemaName: header.options.schemaName,
                                    indexName: header.options.indexName,
                                    operation: header.options.operation,
                                    error: error
                                });
                            }
                            reject(error);
                        });
                    } else {
                        if (SERVICE.DefaultImportDiagnosticsService) {
                            SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsSkipped', 1);
                        }
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
