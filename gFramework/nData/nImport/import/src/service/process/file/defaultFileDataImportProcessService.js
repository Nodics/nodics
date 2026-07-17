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
                pendingModels: Object.keys(request.fileData.models),
                errors: []
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
                        pendingModels: Object.keys(request.fileData.models),
                        errors: options.errors
                    }).then(success => {
                        _self.processTenantModel(request, response, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        if (_self.shouldStopImportOnFailure(request)) {
                            reject(error);
                            return;
                        }
                        _self.processTenantModel(request, response, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
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
                if (options.errors && options.errors.length > 0) {
                    reject(_self.createAggregateImportError(options.errors, 'Import processing completed with record-level errors'));
                } else {
                    resolve(true);
                }
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
                let batch = _self.collectNextImportBatch(request, options);
                if (!batch || batch.length === 0) {
                    resolve(true);
                    return;
                }
                _self.dispatchImportBatch(request, response, options, batch).then(success => {
                    _self.processModel(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    if (_self.shouldStopImportOnFailure(request)) {
                        reject(error);
                        return;
                    }
                    _self.processModel(request, response, options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } catch (error) {
                reject(new CLASSES.DataImportError(error));
            }
        });
    },

    /**
     * Collects the next unprocessed record batch for the active tenant.
     *
     * @param {Object} request Import request containing finalized file data.
     * @param {Object} options Tenant processing options.
     * @returns {Object[]} Batch entries containing record keys, processed keys, and models.
     */
    collectNextImportBatch: function (request, options) {
        let batchOptions = this.resolveBatchImportOptions(request);
        let batch = [];
        let fileObj = request.dataFiles[request.fileName];
        while (options.pendingModels && options.pendingModels.length > 0 && batch.length < batchOptions.size) {
            let modelHash = options.pendingModels.shift();
            let processedKey = options.tenant + ':' + modelHash;
            if (fileObj.processed.includes(processedKey)) {
                if (SERVICE.DefaultImportDiagnosticsService) {
                    SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsSkipped', 1);
                }
            } else {
                batch.push({
                    recordKey: modelHash,
                    processedKey: processedKey,
                    model: request.fileData.models[modelHash]
                });
            }
            if (!batchOptions.enabled && batch.length > 0) {
                break;
            }
        }
        return batch;
    },

    /**
     * Dispatches one finalized import batch through the standard model import pipeline.
     *
     * @param {Object} request Import request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} options Tenant processing options.
     * @param {Object[]} batch Batch entries.
     * @returns {Promise<boolean>} Resolves when the batch succeeds or is recorded as recoverable.
     */
    dispatchImportBatch: function (request, response, options, batch) {
        let header = request.fileData.header;
        let models = batch.map(entry => entry.model);
        if (SERVICE.DefaultImportDiagnosticsService) {
            SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsDispatched', batch.length);
        }
        return SERVICE.DefaultPipelineService.start('processModelImportPipeline', {
            tenant: options.tenant,
            authData: {
                userGroups: header.options.userGroups
            },
            header: header,
            dataModel: models.length === 1 ? models[0] : models,
            importRun: request.importRun
        }, {}).then(success => {
            if (SERVICE.DefaultImportDiagnosticsService) {
                SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsSucceeded', batch.length);
            }
            this.appendImportSuccess(response, success);
            this.markImportBatchProcessed(request, batch);
            return true;
        }).catch(error => {
            this.recordImportBatchFailure(request, options, batch, error);
            if (this.shouldStopImportOnFailure(request)) {
                return Promise.reject(error);
            }
            return Promise.resolve(true);
        });
    },

    /**
     * Appends model import output without assuming single-record or batch shape.
     *
     * @param {Object} response Pipeline response accumulator.
     * @param {*} success Import pipeline success output.
     * @returns {undefined}
     */
    appendImportSuccess: function (response, success) {
        if (!response.success) response.success = [];
        if (success && UTILS.isArray(success)) {
            success.forEach(element => {
                response.success.push(element);
            });
        } else {
            response.success.push(success);
        }
    },

    /**
     * Marks all records in a successful batch as processed for the file and tenant.
     *
     * @param {Object} request Import request.
     * @param {Object[]} batch Successful batch entries.
     * @returns {undefined}
     */
    markImportBatchProcessed: function (request, batch) {
        let fileObj = request.dataFiles[request.fileName];
        batch.forEach(entry => {
            fileObj.processed.push(entry.processedKey);
        });
    },

    /**
     * Records one failed batch against every record contained in that batch.
     *
     * @param {Object} request Import request.
     * @param {Object} options Tenant processing options.
     * @param {Object[]} batch Failed batch entries.
     * @param {*} error Batch failure.
     * @returns {undefined}
     */
    recordImportBatchFailure: function (request, options, batch, error) {
        let header = request.fileData.header;
        options.errors = options.errors || [];
        batch.forEach(entry => {
            if (SERVICE.DefaultImportDiagnosticsService) {
                SERVICE.DefaultImportDiagnosticsService.addFailure(request, {
                    tenant: options.tenant,
                    owningModule: header.options.owningModule,
                    targetModule: header.options.moduleName,
                    fileName: request.fileName,
                    recordKey: entry.recordKey,
                    schemaName: header.options.schemaName,
                    indexName: header.options.indexName,
                    operation: header.options.operation,
                    error: error
                });
            }
            options.errors.push(error);
        });
    },

    /**
     * Resolves whether import processing should stop at the first record failure.
     *
     * @param {Object} request Import request carrying header and layered configuration context.
     * @returns {boolean} True when the active configuration requires fail-fast behavior.
     */
    shouldStopImportOnFailure: function (request) {
        let headerOption = request && request.fileData && request.fileData.header &&
            request.fileData.header.options && request.fileData.header.options.stopImportOnFailure;
        if (headerOption === true || headerOption === false) {
            return headerOption;
        }
        let dataConfig = this.getDataConfig();
        return dataConfig.stopImportOnFailure === true;
    },

    /**
     * Resolves active batch import options from header overrides and layered data configuration.
     *
     * @param {Object} request Import request carrying header options.
     * @returns {{enabled: boolean, size: number}} Effective batch import options.
     */
    resolveBatchImportOptions: function (request) {
        let dataConfig = this.getDataConfig();
        let configuredBatch = dataConfig.batchImport || {};
        let headerBatch = request && request.fileData && request.fileData.header &&
            request.fileData.header.options && request.fileData.header.options.batchImport || {};
        let enabled = headerBatch.enabled === true || headerBatch.enabled === false ?
            headerBatch.enabled : configuredBatch.enabled === true;
        let configuredSize = headerBatch.size !== undefined ? headerBatch.size : configuredBatch.size;
        let size = parseInt(configuredSize, 10);
        if (!enabled || !Number.isFinite(size) || size <= 0) {
            size = 1;
        }
        return {
            enabled: enabled,
            size: size
        };
    },

    /**
     * Reads layered data configuration with safe defaults for isolated tests.
     *
     * @returns {Object} Active data configuration or an empty object.
     */
    getDataConfig: function () {
        if (typeof CONFIG === 'undefined' || !CONFIG || typeof CONFIG.get !== 'function') {
            return {};
        }
        return CONFIG.get('data') || {};
    },

    /**
     * Creates a single import error that preserves all record-level failures.
     *
     * @param {Array} errors Record-level errors collected during recursive processing.
     * @param {string} message Aggregate error message.
     * @returns {CLASSES.DataImportError} Aggregate import error.
     */
    createAggregateImportError: function (errors, message) {
        let aggregateError = new CLASSES.DataImportError('ERR_IMP_00000', message || 'Import processing completed with errors');
        [].concat(errors || []).forEach(error => {
            if (typeof aggregateError.add === 'function') {
                aggregateError.add(error);
            }
        });
        return aggregateError;
    }
};
