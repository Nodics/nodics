/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationGovernanceSummaryService
 * @description Builds a read-only runtime governance summary for the admin control plane
 * from activation requests and activation audit logs.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to add workflow, ticketing,
 * release-window, or compliance-specific summary dimensions while preserving the
 * same control-plane summary contract.
 */
module.exports = {
    /**
     * Initializes the runtime governance summary service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime governance summary service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Returns an aggregated runtime governance summary.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime governance summary response.
     */
    getGovernanceSummary: function (request) {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getActivationRequests(request),
                this.getActivationLogs(request)
            ]).then(results => {
                let activationRequests = results[0] || [];
                let activationLogs = results[1] || [];
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Runtime configuration governance summary fetched successfully',
                    data: this.createSummary(request, activationRequests, activationLogs),
                    metadata: {
                        tenant: this.getTenant(request),
                        requestQuery: this.prepareActivationRequestQuery(request),
                        activationQuery: this.prepareActivationLogQuery(request),
                        requestCount: activationRequests.length,
                        activationCount: activationLogs.length
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Loads activation request models through the generated model service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Array>} Activation request records.
     */
    getActivationRequests: function (request) {
        return new Promise((resolve, reject) => {
            let requestService = SERVICE.DefaultConfigurationActivationRequestService;
            if (!requestService || typeof requestService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
                return;
            }
            requestService.get({
                tenant: this.getTenant(request),
                query: this.prepareActivationRequestQuery(request),
                searchOptions: request.requestSearchOptions || request.searchOptions || this.prepareSearchOptions(request)
            }).then(success => {
                resolve(success.result || []);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Loads activation audit log models through the generated model service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Array>} Activation log records.
     */
    getActivationLogs: function (request) {
        return new Promise((resolve, reject) => {
            let logService = SERVICE.DefaultConfigurationActivationLogService;
            if (!logService || typeof logService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation log service is not available'));
                return;
            }
            logService.get({
                tenant: this.getTenant(request),
                query: this.prepareActivationLogQuery(request),
                searchOptions: request.logSearchOptions || request.searchOptions || this.prepareSearchOptions(request)
            }).then(success => {
                resolve(success.result || []);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Creates the runtime governance summary payload.
     *
     * @param {Object} request Nodics request context.
     * @param {Array} activationRequests Activation request records.
     * @param {Array} activationLogs Activation log records.
     * @returns {Object} Summary payload.
     */
    createSummary: function (request, activationRequests, activationLogs) {
        let payload = this.getPayload(request);
        let recentLimit = Number(payload.recentLimit || 5);
        return {
            requests: this.createRequestSummary(activationRequests, recentLimit),
            activations: this.createActivationSummary(activationLogs, recentLimit),
            modules: this.createModuleSummary(activationRequests, activationLogs),
            configurationTypes: this.createConfigurationTypeSummary(activationRequests, activationLogs)
        };
    },

    /**
     * Summarizes activation requests for admin work queues.
     *
     * @param {Array} activationRequests Activation request records.
     * @param {number} recentLimit Number of recent records to include.
     * @returns {Object} Activation request summary.
     */
    createRequestSummary: function (activationRequests, recentLimit) {
        return {
            total: activationRequests.length,
            pending: this.countWhere(activationRequests, request => this.normalize(request.approvalStatus) === 'PENDING'),
            approved: this.countWhere(activationRequests, request => this.normalize(request.approvalStatus) === 'APPROVED'),
            rejected: this.countWhere(activationRequests, request => this.normalize(request.approvalStatus) === 'REJECTED'),
            activated: this.countWhere(activationRequests, request => this.normalize(request.status) === 'ACTIVATED'),
            approvedNotActivated: this.countWhere(activationRequests, request => {
                return this.normalize(request.approvalStatus) === 'APPROVED' && this.normalize(request.status) !== 'ACTIVATED';
            }),
            highRisk: this.countWhere(activationRequests, request => this.isHighRisk(request)),
            destructive: this.countWhere(activationRequests, request => this.isDestructive(request)),
            byApprovalStatus: this.countBy(activationRequests, 'approvalStatus'),
            byStatus: this.countBy(activationRequests, 'status'),
            byRiskLevel: this.countBy(activationRequests, 'riskLevel'),
            byConfigurationType: this.countBy(activationRequests, 'configurationType'),
            byModule: this.countBy(activationRequests, 'moduleName'),
            recentPending: this.getRecent(activationRequests, request => this.normalize(request.approvalStatus) === 'PENDING', recentLimit),
            highRiskItems: this.getRecent(activationRequests, request => this.isHighRisk(request), recentLimit)
        };
    },

    /**
     * Summarizes runtime activation audit history.
     *
     * @param {Array} activationLogs Activation audit records.
     * @param {number} recentLimit Number of recent records to include.
     * @returns {Object} Activation audit summary.
     */
    createActivationSummary: function (activationLogs, recentLimit) {
        return {
            total: activationLogs.length,
            success: this.countWhere(activationLogs, log => this.normalize(log.status) === 'SUCCESS'),
            failed: this.countWhere(activationLogs, log => this.normalize(log.status) === 'FAILED'),
            rollback: this.countWhere(activationLogs, log => this.normalize(log.action) === 'ROLLBACK'),
            highRisk: this.countWhere(activationLogs, log => this.isHighRisk(log)),
            byAction: this.countBy(activationLogs, 'action'),
            byStatus: this.countBy(activationLogs, 'status'),
            byRiskLevel: this.countBy(activationLogs, 'riskLevel'),
            byConfigurationType: this.countBy(activationLogs, 'configurationType'),
            byModule: this.countBy(activationLogs, 'moduleName'),
            recentFailures: this.getRecent(activationLogs, log => this.normalize(log.status) === 'FAILED', recentLimit),
            recentRollbacks: this.getRecent(activationLogs, log => this.normalize(log.action) === 'ROLLBACK', recentLimit)
        };
    },

    /**
     * Builds module-level runtime governance counts.
     *
     * @param {Array} activationRequests Activation request records.
     * @param {Array} activationLogs Activation audit records.
     * @returns {Object} Module summary.
     */
    createModuleSummary: function (activationRequests, activationLogs) {
        let modules = {};
        activationRequests.forEach(request => {
            let moduleName = request.moduleName || 'unknown';
            modules[moduleName] = modules[moduleName] || this.createEmptyModuleSummary();
            modules[moduleName].requests += 1;
            if (this.normalize(request.approvalStatus) === 'PENDING') {
                modules[moduleName].pending += 1;
            }
            if (this.isHighRisk(request)) {
                modules[moduleName].highRisk += 1;
            }
        });
        activationLogs.forEach(log => {
            let moduleName = log.moduleName || 'unknown';
            modules[moduleName] = modules[moduleName] || this.createEmptyModuleSummary();
            modules[moduleName].activations += 1;
            if (this.normalize(log.status) === 'FAILED') {
                modules[moduleName].failed += 1;
            }
            if (this.normalize(log.action) === 'ROLLBACK') {
                modules[moduleName].rollbacks += 1;
            }
        });
        return modules;
    },

    /**
     * Builds configuration-type governance counts.
     *
     * @param {Array} activationRequests Activation request records.
     * @param {Array} activationLogs Activation audit records.
     * @returns {Object} Configuration type summary.
     */
    createConfigurationTypeSummary: function (activationRequests, activationLogs) {
        return {
            requests: this.countBy(activationRequests, 'configurationType'),
            activations: this.countBy(activationLogs, 'configurationType')
        };
    },

    /**
     * Creates an empty module summary bucket.
     *
     * @returns {Object} Empty module summary.
     */
    createEmptyModuleSummary: function () {
        return {
            requests: 0,
            pending: 0,
            activations: 0,
            failed: 0,
            rollbacks: 0,
            highRisk: 0
        };
    },

    /**
     * Builds query filters for activation request summary reads.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Query filters.
     */
    prepareActivationRequestQuery: function (request) {
        let filters = this.getPayload(request);
        let query = this.prepareBaseQuery(filters);
        [
            'code',
            'requestedBy',
            'approvalStatus',
            'approvedBy',
            'riskLevel',
            'status',
            'activationLogCode'
        ].forEach(property => {
            if (filters[property]) {
                query[property] = filters[property];
            }
        });
        if (filters.activationRequestCode && !query.code) {
            query.code = filters.activationRequestCode;
        }
        return query;
    },

    /**
     * Builds query filters for activation log summary reads.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Query filters.
     */
    prepareActivationLogQuery: function (request) {
        let filters = this.getPayload(request);
        let query = this.prepareBaseQuery(filters);
        [
            'code',
            'action',
            'status',
            'requestedBy',
            'approvalStatus',
            'approvedBy',
            'riskLevel',
            'activationRequestCode'
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
     * Builds query filters shared by request and log summary reads.
     *
     * @param {Object} filters Runtime summary filters.
     * @returns {Object} Shared query filters.
     */
    prepareBaseQuery: function (filters) {
        let query = {};
        [
            'configurationType',
            'configurationCode',
            'moduleName',
            'tenant',
            'correlationId'
        ].forEach(property => {
            if (filters[property]) {
                query[property] = filters[property];
            }
        });
        return query;
    },

    /**
     * Builds generated-service search options for summary queries.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Search options.
     */
    prepareSearchOptions: function (request) {
        let filters = this.getPayload(request);
        let options = {};
        options.limit = Number(filters.limit || 500);
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
     * Counts records by a property value.
     *
     * @param {Array} records Records to summarize.
     * @param {string} property Property name.
     * @returns {Object} Count map.
     */
    countBy: function (records, property) {
        return records.reduce((summary, record) => {
            let value = record[property] || 'unknown';
            summary[value] = (summary[value] || 0) + 1;
            return summary;
        }, {});
    },

    /**
     * Counts records matching a predicate.
     *
     * @param {Array} records Records to inspect.
     * @param {Function} predicate Matching predicate.
     * @returns {number} Matching count.
     */
    countWhere: function (records, predicate) {
        return records.filter(predicate).length;
    },

    /**
     * Returns recent records matching a predicate.
     *
     * @param {Array} records Records to inspect.
     * @param {Function} predicate Matching predicate.
     * @param {number} limit Maximum records to return.
     * @returns {Array} Recent matching records.
     */
    getRecent: function (records, predicate, limit) {
        return records.filter(predicate).slice(0, limit);
    },

    /**
     * Determines whether a record is high risk.
     *
     * @param {Object} record Runtime governance record.
     * @returns {boolean} True when record is high risk.
     */
    isHighRisk: function (record) {
        return this.normalize(record.riskLevel) === 'HIGH' || this.isDestructive(record);
    },

    /**
     * Determines whether a record represents a destructive runtime change.
     *
     * @param {Object} record Runtime governance record.
     * @returns {boolean} True when record is destructive.
     */
    isDestructive: function (record) {
        return Boolean(record.preview && record.preview.destructive);
    },

    /**
     * Normalizes a status-like value.
     *
     * @param {string} value Status-like value.
     * @returns {string} Uppercase normalized value.
     */
    normalize: function (value) {
        return String(value || '').toUpperCase();
    },

    /**
     * Returns payload from request body, query, filters, or direct summary fields.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Payload map.
     */
    getPayload: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return _.merge({}, request.filters || {}, request.runtimeGovernanceSummary || {}, query, body);
    },

    /**
     * Resolves tenant for runtime governance summary reads.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getTenant: function (request) {
        return request.tenant || CONFIG.get('defaultTenant') || 'default';
    }
};
