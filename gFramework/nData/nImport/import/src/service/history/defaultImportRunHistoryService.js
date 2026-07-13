/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module import/service/history/DefaultImportRunHistoryService
 * @description Persists and queries import run summaries through the generated
 * importRun model service without making import execution dependent on history
 * storage availability.
 * @layer service
 * @owner import
 * @override Project modules may override this service to redact sensitive
 * failures, change retention rules, publish audit events, or store import run
 * history in a dedicated observability platform without changing Nodics core.
 */
module.exports = {
    /**
     * Initializes the import run history service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the import run history service after startup.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Records an import run and never rejects the caller.
     *
     * @param {Object} request Import request context.
     * @param {Object} request.importRun Finalized import run summary.
     * @returns {Promise<Object>} Persistence result or skipped status.
     */
    recordRun: function (request) {
        return new Promise(resolve => {
            let importRun = this.prepareImportRunRecord(request || {});
            if (!importRun) {
                resolve({
                    skipped: true,
                    reason: 'MISSING_IMPORT_RUN'
                });
                return;
            }
            let importRunService = this.getImportRunService();
            if (!importRunService || typeof importRunService.save !== 'function') {
                this.warn('Import run history skipped; DefaultImportRunService is not available');
                resolve({
                    skipped: true,
                    entry: importRun
                });
                return;
            }
            importRunService.save({
                tenant: importRun.tenant || this.getDefaultTenant(),
                model: importRun
            }).then(success => {
                resolve(success);
            }).catch(error => {
                this.error('Import run history persistence failed', error);
                resolve({
                    skipped: true,
                    error: error,
                    entry: importRun
                });
            });
        });
    },

    /**
     * Returns import run history using query filters from body, query string, or request filters.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Import run history response.
     */
    getImportRunHistory: function (request) {
        return new Promise((resolve, reject) => {
            let importRunService = this.getImportRunService();
            if (!importRunService || typeof importRunService.get !== 'function') {
                reject(this.createUnavailableError('Import run history service is not available'));
                return;
            }
            let query = this.prepareImportRunHistoryQuery(request || {});
            let searchOptions = request.searchOptions || this.prepareImportRunHistorySearchOptions(request || {});
            importRunService.get({
                tenant: this.resolveTenant(request || {}),
                query: query,
                searchOptions: searchOptions
            }).then(success => {
                resolve({
                    code: 'SUC_IMP_00000',
                    message: 'Import run history fetched successfully',
                    data: success.result || [],
                    metadata: {
                        query: query,
                        count: success.result ? success.result.length : 0,
                        tenant: this.resolveTenant(request || {})
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Returns one import run by run id.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Import run detail response.
     */
    getImportRun: function (request) {
        request = request || {};
        let runId = request.runId || (request.httpRequest && request.httpRequest.params && request.httpRequest.params.runId);
        request.filters = _.merge({}, request.filters || {}, {
            runId: runId
        });
        return this.getImportRunHistory(request).then(history => {
            return {
                code: history.code,
                message: 'Import run fetched successfully',
                data: history.data && history.data.length > 0 ? history.data[0] : null,
                metadata: history.metadata
            };
        });
    },

    /**
     * Builds a persistence-ready import run model.
     *
     * @param {Object} request Import request context.
     * @returns {Object|undefined} Import run record.
     */
    prepareImportRunRecord: function (request) {
        if (!request.importRun) {
            return undefined;
        }
        let importRun = _.cloneDeep(request.importRun);
        importRun.code = importRun.code || importRun.runId || this.createImportRunCode(importRun);
        importRun.runId = importRun.runId || importRun.code;
        importRun.active = importRun.active !== undefined ? importRun.active : true;
        importRun.tenant = importRun.tenant || request.tenant || this.getDefaultTenant();
        importRun.dataType = importRun.dataType || request.dataType;
        importRun.modules = importRun.modules || request.modules || [];
        importRun.requestedBy = importRun.requestedBy || this.resolveRequestedBy(request);
        importRun.correlationId = importRun.correlationId || this.resolveCorrelationId(request);
        return importRun;
    },

    /**
     * Builds the import run history query from request filters.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Query object.
     */
    prepareImportRunHistoryQuery: function (request) {
        let filters = this.getImportRunHistoryFilters(request);
        let query = {};
        [
            'code',
            'runId',
            'status',
            'dataType',
            'tenant',
            'requestedBy',
            'correlationId'
        ].forEach(property => {
            if (filters[property]) {
                query[property] = filters[property];
            }
        });
        if (filters.moduleName) {
            query.modules = filters.moduleName;
        }
        return query;
    },

    /**
     * Builds search options for import run history.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Search options.
     */
    prepareImportRunHistorySearchOptions: function (request) {
        let filters = this.getImportRunHistoryFilters(request);
        let options = {};
        if (filters.limit) {
            options.limit = Number(filters.limit);
        }
        if (filters.skip) {
            options.skip = Number(filters.skip);
        }
        if (filters.projection) {
            options.projection = filters.projection;
        }
        options.sort = filters.sort || {
            creationTime: -1
        };
        return options;
    },

    /**
     * Returns merged filters from direct request fields, query string, and body.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Filter map.
     */
    getImportRunHistoryFilters: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return _.merge({}, request.filters || {}, query, body);
    },

    /**
     * Resolves the tenant used for history persistence or lookup.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    resolveTenant: function (request) {
        let filters = this.getImportRunHistoryFilters(request);
        return request.tenant || filters.tenant || this.getDefaultTenant();
    },

    /**
     * Returns the generated import run persistence service when available.
     *
     * @returns {Object|undefined} Generated import run service.
     */
    getImportRunService: function () {
        return typeof SERVICE !== 'undefined' ? SERVICE.DefaultImportRunService : undefined;
    },

    /**
     * Returns the configured default tenant with a safe fallback.
     *
     * @returns {string} Default tenant code.
     */
    getDefaultTenant: function () {
        if (typeof CONFIG !== 'undefined' && CONFIG.get) {
            return CONFIG.get('defaultTenant') || 'default';
        }
        return 'default';
    },

    /**
     * Creates an import run code when a run id is unavailable.
     *
     * @param {Object} importRun Import run record.
     * @returns {string} Generated import run code.
     */
    createImportRunCode: function (importRun) {
        return [
            'importRun',
            importRun.dataType || 'unknown',
            Date.now()
        ].join('_');
    },

    /**
     * Extracts the user/process that requested the import.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Requesting user or process.
     */
    resolveRequestedBy: function (request) {
        let authData = request && (request.authData || request.autData);
        if (!authData) {
            return request && request.requestedBy;
        }
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
    },

    /**
     * Extracts a correlation id from the request.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Correlation id.
     */
    resolveCorrelationId: function (request) {
        return request && (request.correlationId || request.requestId || (request.event && request.event.id));
    },

    /**
     * Creates a platform error for unavailable history storage.
     *
     * @param {string} message Error message.
     * @returns {Error} Nodics error when available.
     */
    createUnavailableError: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.DataImportError) {
            return new CLASSES.DataImportError('ERR_IMP_00002', message);
        }
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) {
            return new CLASSES.NodicsError('ERR_IMP_00002', message);
        }
        let error = new Error(message);
        error.code = 'ERR_IMP_00002';
        return error;
    },

    /**

     * Executes warn behavior.

     *

     * @param {*} message Method input.

     * @returns {*} Method result.

     */

    warn: function (message) {
        if (this.LOG && typeof this.LOG.warn === 'function') {
            this.LOG.warn(message);
        }
    },

    /**

     * Executes error behavior.

     *

     * @param {*} message Method input.

     * @param {*} error Method input.

     * @returns {*} Method result.

     */

    error: function (message, error) {
        if (this.LOG && typeof this.LOG.error === 'function') {
            this.LOG.error(message);
            if (error) {
                this.LOG.error(error);
            }
        }
    }
};
