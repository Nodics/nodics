/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

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

    /** Imports one nMedia-owned upload through a selected governed import definition. */
    importMediaData: function (request) {
        request = request || {};
        request.dataType = 'media';
        request.options = request.options || {};
        request.importFinalizeData = request.importFinalizeData !== false;
        if (SERVICE.DefaultSystemDataImportInitializerService &&
            typeof SERVICE.DefaultSystemDataImportInitializerService.initImportRun === 'function') {
            SERVICE.DefaultSystemDataImportInitializerService.initImportRun(request);
        }
        return new Promise((resolve, reject) => {
            SERVICE.DefaultMediaImportDefinitionService.prepare(request).then(prepared => {
                request.inputPath = prepared.inputPath;
                request.outputPath = prepared.outputPath;
                request.mediaSource = prepared.mediaSource;
                request.importDefinition = prepared.importDefinition;
                request.stagedFile = prepared.stagedFile;
                if (request.importRun) {
                    request.importRun.sourceName = 'media:' + prepared.mediaSource.mediaCode;
                    request.importRun.mediaSource = prepared.mediaSource;
                    request.importRun.importDefinition = prepared.importDefinition;
                }
                SERVICE.DefaultPipelineService.start('localDataImportInitializerPipeline', request, {}).then(success => {
                    let result = {
                        finalizer: success,
                        importRun: request.importRun,
                        mediaSource: prepared.mediaSource,
                        importDefinition: prepared.importDefinition
                    };
                    if (request.options.validateOnly || request.validationOnly || success && success.validationOnly) {
                        let validationErrors = this.validatePreparedFinalizedImport(request);
                        let validationReport = this.createPreparedFinalizedValidationReport(request, validationErrors);
                        request.importRun.validationOnly = true;
                        request.importRun.validationReport = validationReport;
                        this.finalizeImportRun(request, validationErrors.length > 0 ? 'FAILED' : 'VALIDATED');
                        resolve(Object.assign({
                            code: 'SUC_IMP_00000',
                            validationOnly: true,
                            validationPassed: validationErrors.length === 0,
                            validationErrorCount: validationErrors.length,
                            validationErrors: validationErrors,
                            validationReport: validationReport
                        }, result));
                        return;
                    }
                    this.processImportData({
                        tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                        importRun: request.importRun,
                        inputPath: {
                            rootPath: request.outputPath.rootPath,
                            dataPath: request.outputPath.dataPath,
                            successPath: request.outputPath.successPath,
                            errorPath: request.outputPath.errorPath,
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
            }).catch(error => {
                this.finalizeImportRun(request, 'FAILED');
                reject(error);
            });
        });
    },

    /** Dispatches finalized import files through the standard processing pipeline. */
    processImportData: function (request) {
        return SERVICE.DefaultPipelineService.start('processDataImportPipeline', request, {});
    },

    /**
     * Validates finalized media import records against the generated header
     * dispatch contract before any schema write is attempted.
     *
     * @param {Object} request Media import request with outputPath and importRun.
     * @returns {Object[]} Business-readable validation errors.
     */
    validatePreparedFinalizedImport: function (request) {
        let errors = [];
        let dataPath = request && request.outputPath && request.outputPath.dataPath;
        if (!dataPath || !fs.existsSync(dataPath)) {
            return errors;
        }
        fs.readdirSync(dataPath).filter(fileName => fileName.endsWith('.js')).sort().forEach(fileName => {
            let filePath = path.join(dataPath, fileName);
            let fileData;
            try {
                delete require.cache[require.resolve(filePath)];
                fileData = require(filePath);
            } catch (error) {
                errors.push(this.createFinalizedValidationError({
                    code: 'ERR_IMP_VALIDATE_00007',
                    message: 'Finalized import file could not be read',
                    fileName: fileName
                }));
                return;
            }
            errors = errors.concat(this.validateFinalizedFileQueryPlaceholders(request, fileName, fileData));
        });
        if (request.importRun) {
            request.importRun.validationErrors = errors;
            request.importRun.summary = request.importRun.summary || {};
            request.importRun.summary.validationErrors = request.importRun.validationErrors.length;
        }
        return errors;
    },

    /**
     * Creates a row-level validation report that Axis and other clients can page,
     * search, and explain without parsing technical exception text.
     *
     * @param {Object} request Import request.
     * @param {Object[]} validationErrors Normalized validation errors.
     * @returns {Object} Structured validation report.
     */
    createPreparedFinalizedValidationReport: function (request, validationErrors) {
        let rows = [];
        let recordNumber = 0;
        let dataPath = request && request.outputPath && request.outputPath.dataPath;
        let errorsByRecord = this.indexValidationErrors(validationErrors);
        if (dataPath && fs.existsSync(dataPath)) {
            fs.readdirSync(dataPath).filter(fileName => fileName.endsWith('.js')).sort().forEach(fileName => {
                let filePath = path.join(dataPath, fileName);
                let fileData;
                try {
                    delete require.cache[require.resolve(filePath)];
                    fileData = require(filePath);
                } catch (error) {
                    return;
                }
                let header = fileData && fileData.header || {};
                let models = fileData && fileData.models || {};
                Object.keys(models).forEach(recordKey => {
                    recordNumber++;
                    let recordErrors = errorsByRecord[this.validationRecordKey(fileName, recordKey)] || [];
                    rows.push(this.createValidationReportRow({
                        fileName: fileName,
                        recordKey: recordKey,
                        rowNumber: recordNumber,
                        status: recordErrors.length > 0 ? 'INVALID' : 'VALID',
                        schemaName: header.options && header.options.schemaName,
                        indexName: header.options && header.options.indexName,
                        operation: header.options && header.options.operation,
                        tenant: request && request.tenant,
                        errors: recordErrors
                    }));
                });
            });
        }
        let invalidRecords = rows.filter(row => row.status === 'INVALID').length;
        let report = {
            totalRecords: rows.length,
            validRecords: rows.length - invalidRecords,
            invalidRecords: invalidRecords,
            warningRecords: 0,
            rows: rows
        };
        if (request && request.importRun) {
            request.importRun.summary = request.importRun.summary || {};
            request.importRun.summary.recordsValidated = rows.length;
            request.importRun.summary.recordsValid = report.validRecords;
            request.importRun.summary.recordsInvalid = report.invalidRecords;
        }
        return report;
    },

    /**
     * Validates all `$property` query placeholders for one finalized import file.
     *
     * @param {Object} request Import request.
     * @param {string} fileName Finalized file name.
     * @param {Object} fileData Finalized import payload.
     * @returns {Object[]} Validation errors.
     */
    validateFinalizedFileQueryPlaceholders: function (request, fileName, fileData) {
        let errors = [];
        let header = fileData && fileData.header || {};
        let query = header.query || {};
        let models = fileData && fileData.models || {};
        let requiredProperties = this.extractRequiredQueryProperties(query);
        if (requiredProperties.length === 0) {
            return errors;
        }
        Object.keys(models).forEach((recordKey, index) => {
            let model = models[recordKey] || {};
            requiredProperties.forEach(propertyName => {
                let value = this.resolveModelValue(model, propertyName);
                if (value === undefined || value === null || value === '') {
                    errors.push(this.createFinalizedValidationError({
                        code: 'ERR_IMP_VALIDATE_00008',
                        message: 'Import record is missing required property "' + propertyName + '" for the selected save/update operation',
                        fileName: fileName,
                        recordKey: recordKey,
                        schemaName: header.options && header.options.schemaName,
                        indexName: header.options && header.options.indexName,
                        operation: header.options && header.options.operation,
                        propertyName: propertyName,
                        rowNumber: index + 1,
                        tenant: request && request.tenant
                    }));
                }
            });
        });
        return errors;
    },

    /**
     * Extracts model property names referenced by query placeholders.
     *
     * @param {Object} query Header query object.
     * @returns {string[]} Required model properties.
     */
    extractRequiredQueryProperties: function (query) {
        let properties = [];
        Object.keys(query || {}).forEach(queryProperty => {
            let value = query[queryProperty];
            if (typeof value === 'string' && value.startsWith('$')) {
                properties.push(value.substring(1));
            }
        });
        return Array.from(new Set(properties.filter(Boolean)));
    },

    /**
     * Resolves a dot-notated model property.
     *
     * @param {Object} model Import model.
     * @param {string} propertyName Property path.
     * @returns {*} Resolved value.
     */
    resolveModelValue: function (model, propertyName) {
        return String(propertyName || '').split('.').reduce((value, property) => {
            if (value && Object.prototype.hasOwnProperty.call(value, property)) {
                return value[property];
            }
            return undefined;
        }, model);
    },

    /**
     * Groups validation errors by finalized file and record key.
     *
     * @param {Object[]} validationErrors Normalized validation errors.
     * @returns {Object} Error map.
     */
    indexValidationErrors: function (validationErrors) {
        return (validationErrors || []).reduce((index, error) => {
            let key = this.validationRecordKey(error.fileName, error.recordKey);
            index[key] = index[key] || [];
            index[key].push(error);
            return index;
        }, {});
    },

    /**
     * Builds a stable record-key for report grouping.
     *
     * @param {string} fileName Finalized file name.
     * @param {string} recordKey Finalized record key.
     * @returns {string} Group key.
     */
    validationRecordKey: function (fileName, recordKey) {
        return String(fileName || '') + '::' + String(recordKey || '');
    },

    /**
     * Creates one user-facing validation row.
     *
     * @param {Object} options Row options.
     * @returns {Object} Validation report row.
     */
    createValidationReportRow: function (options) {
        let errors = options.errors || [];
        let firstError = errors[0] || {};
        return {
            rowNumber: options.rowNumber,
            recordKey: options.recordKey,
            status: options.status,
            severity: options.status === 'INVALID' ? 'error' : 'success',
            fileName: options.fileName,
            schemaName: options.schemaName,
            indexName: options.indexName,
            operation: options.operation,
            tenant: options.tenant,
            field: firstError.propertyName,
            message: errors.length > 0 ?
                errors.map(error => error.message).join('; ') :
                'Record is ready for import',
            howToFix: errors.length > 0 ?
                errors.map(error => this.createValidationHowToFix(error)).join(' ') :
                '',
            technicalCode: firstError.code,
            errorCount: errors.length
        };
    },

    /**
     * Converts a validation error into a short business-readable repair hint.
     *
     * @param {Object} error Validation error.
     * @returns {string} Repair hint.
     */
    createValidationHowToFix: function (error) {
        if (error && error.propertyName) {
            return 'Add a valid value for "' + error.propertyName + '" because this save/update operation uses it to identify the record.';
        }
        return 'Correct the record data and validate the file again before installation.';
    },

    /**
     * Creates a safe validation error object that can be nested in DataImportError.
     *
     * @param {Object} options Error metadata.
     * @returns {Object} Nodics-compatible error payload.
     */
    createFinalizedValidationError: function (options) {
        return {
            code: options.code,
            responseCode: '400',
            name: 'DataImportError',
            message: options.message,
            fileName: options.fileName,
            recordKey: options.recordKey,
            schemaName: options.schemaName,
            indexName: options.indexName,
            operation: options.operation,
            propertyName: options.propertyName,
            rowNumber: options.rowNumber,
            tenant: options.tenant,
            metadata: {
                fileName: options.fileName,
                recordKey: options.recordKey,
                schemaName: options.schemaName,
                indexName: options.indexName,
                operation: options.operation,
                propertyName: options.propertyName,
                rowNumber: options.rowNumber,
                tenant: options.tenant
            }
        };
    }
};
