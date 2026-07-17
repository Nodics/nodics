/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationAuditService
 * @description Records runtime configuration activation attempts for schema,
 * router, class, and pipeline control-plane changes without making activation
 * dependent on audit persistence availability.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to enrich audit metadata,
 * publish audit events, or route logs to an external compliance system while
 * preserving the same non-blocking activation contract.
 */
module.exports = {
    /**
     * Initializes the runtime configuration audit service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime configuration audit service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Records an activation attempt and never rejects the caller.
     *
     * @param {Object} entry Activation audit entry.
     * @returns {Promise<Object>} Resolves with audit status.
     * @sideEffects Persists through generated `DefaultConfigurationActivationLogService` when available.
     */
    recordActivation: function (entry) {
        return new Promise(resolve => {
            let auditEntry = this.prepareActivationEntry(entry || {});
            let auditService = SERVICE.DefaultConfigurationActivationLogService;
            if (!auditService || typeof auditService.save !== 'function') {
                this.LOG.warn('Runtime configuration activation audit skipped; DefaultConfigurationActivationLogService is not available');
                resolve({
                    skipped: true,
                    entry: auditEntry
                });
                return;
            }
            auditService.save({
                tenant: auditEntry.tenant || CONFIG.get('defaultTenant') || 'default',
                model: auditEntry
            }).then(success => {
                resolve(success);
            }).catch(error => {
                this.LOG.error('Runtime configuration activation audit failed');
                this.LOG.error(error);
                resolve({
                    skipped: true,
                    error: error,
                    entry: auditEntry
                });
            });
        });
    },

    /**
     * Queries runtime configuration activation history from the generated log service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation history response.
     */
    getActivationHistory: function (request) {
        return new Promise((resolve, reject) => {
            let auditService = SERVICE.DefaultConfigurationActivationLogService;
            if (!auditService || typeof auditService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation log service is not available'));
                return;
            }
            auditService.get({
                tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                query: this.prepareActivationHistoryQuery(request),
                searchOptions: request.searchOptions || this.prepareActivationHistorySearchOptions(request)
            }).then(success => {
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Runtime configuration activation history fetched successfully',
                    data: success.result || [],
                    metadata: {
                        query: this.prepareActivationHistoryQuery(request),
                        count: success.result ? success.result.length : 0,
                        tenant: request.tenant || CONFIG.get('defaultTenant') || 'default'
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Builds the activation history query from request body/query filters.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Activation history query.
     */
    prepareActivationHistoryQuery: function (request) {
        let filters = this.getActivationHistoryFilters(request);
        let query = {};
        [
            'code',
            'configurationType',
            'configurationCode',
            'moduleName',
            'action',
            'status',
            'tenant',
            'requestedBy',
            'approvedBy',
            'approvalStatus',
            'approvalReason',
            'riskLevel',
            'activationRequestCode',
            'correlationId'
        ].forEach(property => {
            if (filters[property]) {
                query[property] = filters[property];
            }
        });
        if (filters.activationCode && !query.code) {
            query.code = filters.activationCode;
        }
        return query;
    },

    /**
     * Builds search options for activation history queries.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Search options.
     */
    prepareActivationHistorySearchOptions: function (request) {
        let filters = this.getActivationHistoryFilters(request);
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
     * Returns activation history filters from request body, query, or direct request properties.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Filter map.
     */
    getActivationHistoryFilters: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return _.merge({}, request.filters || {}, query, body);
    },

    /**
     * Builds a normalized activation audit entry.
     *
     * @param {Object} entry Raw audit metadata.
     * @returns {Object} Normalized audit model.
     */
    prepareActivationEntry: function (entry) {
        let model = _.merge({
            active: true,
            action: 'activate',
            status: 'SUCCESS',
            tenant: CONFIG.get('defaultTenant') || 'default',
            warnings: []
        }, entry);
        model.configurationCode = model.configurationCode || entry.code || 'unknown';
        model.code = entry.auditCode || this.createActivationCode(model);
        if (model.error instanceof Error) {
            model.error = {
                name: model.error.name,
                code: model.error.code,
                message: model.error.message,
                stack: model.error.stack
            };
        }
        return model;
    },

    /**
     * Creates a stable-ish audit code from activation metadata.
     *
     * @param {Object} entry Raw audit metadata.
     * @returns {string} Audit record code.
     */
    createActivationCode: function (entry) {
        return [
            entry.configurationType || 'runtimeConfiguration',
            entry.configurationCode || entry.code || 'unknown',
            Date.now()
        ].join('_');
    },

    /**
     * Extracts a user/process identifier from a runtime request.
     *
     * @param {Object} request Runtime request.
     * @returns {string|undefined} Requesting user or process.
     */
    resolveRequestedBy: function (request) {
        let authData = request && (request.authData || request.autData);
        if (!authData) {
            return undefined;
        }
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
    },

    /**
     * Extracts a correlation id from a runtime request.
     *
     * @param {Object} request Runtime request.
     * @returns {string|undefined} Correlation id.
     */
    resolveCorrelationId: function (request) {
        return request && (request.correlationId || request.requestId || (request.event && request.event.id));
    }
};
