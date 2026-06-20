/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationGovernanceCleanupService
 * @description Previews and applies retention cleanup for runtime configuration
 * activation requests and activation audit logs through generated model services.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to enforce organization
 * retention, archival, legal-hold, or compliance-specific cleanup policies
 * without changing Nodics core governance services.
 */
module.exports = {
    /**
     * Initializes the runtime governance cleanup service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime governance cleanup service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Previews runtime governance cleanup without removing records.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cleanup preview response.
     */
    previewCleanup: function (request) {
        return new Promise((resolve, reject) => {
            this.loadCleanupRecords(request).then(records => {
                let plan = this.createCleanupPlan(request, records);
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Runtime configuration governance cleanup preview completed successfully',
                    data: plan,
                    metadata: {
                        tenant: this.getTenant(request),
                        dryRun: true,
                        cleanupConfirmed: false
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Applies runtime governance cleanup when explicitly confirmed.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cleanup response.
     */
    cleanup: function (request) {
        return new Promise((resolve, reject) => {
            let payload = this.getPayload(request);
            if (payload.dryRun !== false || payload.confirmCleanup !== true) {
                this.previewCleanup(request).then(preview => {
                    preview.message = 'Runtime configuration governance cleanup requires confirmCleanup=true and dryRun=false';
                    preview.metadata.requiresConfirmation = true;
                    resolve(preview);
                }).catch(error => {
                    reject(error);
                });
                return;
            }
            this.loadCleanupRecords(request).then(records => {
                let plan = this.createCleanupPlan(request, records);
                this.applyCleanupPlan(request, plan).then(result => {
                    this.recordCleanupAudit(request, plan, result, 'SUCCESS').then(() => {
                        resolve({
                            code: 'SUC_SYS_00000',
                            message: 'Runtime configuration governance cleanup completed successfully',
                            data: Object.assign({}, plan, {
                                result: result
                            }),
                            metadata: {
                                tenant: this.getTenant(request),
                                dryRun: false,
                                cleanupConfirmed: true
                            }
                        });
                    });
                }).catch(error => {
                    this.recordCleanupAudit(request, plan, {
                        error: error
                    }, 'FAILED').then(() => {
                        reject(error);
                    });
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Loads activation requests and logs through generated model services.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Loaded cleanup records.
     */
    loadCleanupRecords: function (request) {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.loadActivationRequests(request),
                this.loadActivationLogs(request)
            ]).then(results => {
                resolve({
                    activationRequests: results[0],
                    activationLogs: results[1]
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Loads activation requests when cleanup target includes requests.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Array>} Activation request records.
     */
    loadActivationRequests: function (request) {
        if (!this.shouldTarget(request, 'requests')) {
            return Promise.resolve([]);
        }
        let service = SERVICE.DefaultConfigurationActivationRequestService;
        if (!service || typeof service.get !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
        }
        return service.get({
            tenant: this.getTenant(request),
            query: this.prepareActivationRequestQuery(request),
            searchOptions: this.prepareSearchOptions(request)
        }).then(success => success.result || []);
    },

    /**
     * Loads activation logs when cleanup target includes logs.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Array>} Activation log records.
     */
    loadActivationLogs: function (request) {
        if (!this.shouldTarget(request, 'logs')) {
            return Promise.resolve([]);
        }
        let service = SERVICE.DefaultConfigurationActivationLogService;
        if (!service || typeof service.get !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation log service is not available'));
        }
        return service.get({
            tenant: this.getTenant(request),
            query: this.prepareActivationLogQuery(request),
            searchOptions: this.prepareSearchOptions(request)
        }).then(success => success.result || []);
    },

    /**
     * Creates a cleanup plan with eligible and skipped records.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} records Loaded records.
     * @returns {Object} Cleanup plan.
     */
    createCleanupPlan: function (request, records) {
        let payload = this.getPayload(request);
        let requestPlan = this.selectRecords(records.activationRequests || [], payload, 'request');
        let logPlan = this.selectRecords(records.activationLogs || [], payload, 'log');
        return {
            policy: this.createPolicySummary(payload),
            activationRequests: requestPlan,
            activationLogs: logPlan,
            totals: {
                loaded: (records.activationRequests || []).length + (records.activationLogs || []).length,
                eligible: requestPlan.eligible.length + logPlan.eligible.length,
                skipped: requestPlan.skipped.length + logPlan.skipped.length
            }
        };
    },

    /**
     * Selects eligible cleanup records and records skip reasons.
     *
     * @param {Array} records Loaded records.
     * @param {Object} payload Cleanup payload.
     * @param {string} recordType Cleanup record type.
     * @returns {Object} Cleanup selection.
     */
    selectRecords: function (records, payload, recordType) {
        let selected = {
            loaded: records.length,
            eligible: [],
            skipped: []
        };
        records.forEach(record => {
            let skipReason = this.getSkipReason(record, payload, recordType);
            let entry = this.createCleanupRecord(record, recordType, skipReason);
            if (skipReason) {
                selected.skipped.push(entry);
            } else {
                selected.eligible.push(entry);
            }
        });
        return selected;
    },

    /**
     * Applies cleanup by removing eligible records through generated services.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} plan Cleanup plan.
     * @returns {Promise<Object>} Cleanup apply result.
     */
    applyCleanupPlan: function (request, plan) {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.removeRecords(request, SERVICE.DefaultConfigurationActivationRequestService, plan.activationRequests.eligible),
                this.removeRecords(request, SERVICE.DefaultConfigurationActivationLogService, plan.activationLogs.eligible)
            ]).then(results => {
                resolve({
                    activationRequests: {
                        requested: plan.activationRequests.eligible.length,
                        removed: results[0].removed,
                        result: results[0].result
                    },
                    activationLogs: {
                        requested: plan.activationLogs.eligible.length,
                        removed: results[1].removed,
                        result: results[1].result
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Removes eligible cleanup records through a generated model service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} service Generated model service.
     * @param {Array} records Eligible cleanup records.
     * @returns {Promise<Object>} Removal result.
     */
    removeRecords: function (request, service, records) {
        if (!records || records.length === 0) {
            return Promise.resolve({
                removed: 0,
                result: undefined
            });
        }
        if (!service || typeof service.remove !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Generated cleanup model service is not available'));
        }
        let codes = records.map(record => record.code);
        return service.remove({
            tenant: this.getTenant(request),
            codes: codes,
            query: {
                code: {
                    $in: codes
                }
            }
        }).then(success => {
            return {
                removed: records.length,
                result: success
            };
        });
    },

    /**
     * Records cleanup operation in the activation audit log when audit service is available.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} plan Cleanup plan.
     * @param {Object} result Cleanup result.
     * @param {string} status Cleanup status.
     * @returns {Promise<Object|boolean>} Audit result.
     */
    recordCleanupAudit: function (request, plan, result, status) {
        let auditService = SERVICE.DefaultRuntimeConfigurationAuditService;
        if (!auditService || typeof auditService.recordActivation !== 'function') {
            return Promise.resolve(true);
        }
        return auditService.recordActivation({
            configurationType: 'runtimeGovernanceCleanup',
            configurationCode: this.createCleanupCode(),
            moduleName: 'dynamo',
            action: 'cleanup',
            status: status,
            tenant: this.getTenant(request),
            requestedBy: auditService.resolveRequestedBy ? auditService.resolveRequestedBy(request) : this.resolveRequestedBy(request),
            correlationId: auditService.resolveCorrelationId ? auditService.resolveCorrelationId(request) : request.correlationId,
            previousSnapshot: {
                policy: plan.policy,
                totals: plan.totals
            },
            nextSnapshot: result,
            warnings: this.createCleanupWarnings(plan)
        });
    },

    /**
     * Returns skip reason for a cleanup record.
     *
     * @param {Object} record Runtime governance record.
     * @param {Object} payload Cleanup payload.
     * @param {string} recordType Cleanup record type.
     * @returns {string|undefined} Skip reason.
     */
    getSkipReason: function (record, payload, recordType) {
        if (!this.matchesRetentionAge(record, payload)) {
            return 'RETENTION_WINDOW_NOT_REACHED';
        }
        if (!payload.allowPending && recordType === 'request' && this.isPendingRequest(record)) {
            return 'PENDING_REQUEST_PROTECTED';
        }
        if (!payload.allowHighRisk && this.isHighRisk(record)) {
            return 'HIGH_RISK_PROTECTED';
        }
        if (!payload.allowRejectedPendingCleanup &&
            recordType === 'request' &&
            this.normalize(record.approvalStatus) === 'REJECTED' &&
            this.normalize(record.status) === 'REQUESTED') {
            return 'INCONSISTENT_REJECTED_REQUEST_PROTECTED';
        }
        return undefined;
    },

    /**
     * Determines if a record is outside the retention window.
     *
     * @param {Object} record Runtime governance record.
     * @param {Object} payload Cleanup payload.
     * @returns {boolean} True when record can be considered for cleanup.
     */
    matchesRetentionAge: function (record, payload) {
        let beforeDate = this.resolveBeforeDate(payload);
        if (!beforeDate) {
            return true;
        }
        let recordDate = this.resolveRecordDate(record);
        if (!recordDate) {
            return false;
        }
        return recordDate.getTime() <= beforeDate.getTime();
    },

    /**
     * Builds query filters for activation request cleanup reads.
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
     * Builds query filters for activation log cleanup reads.
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
     * Builds query filters shared by request and log cleanup reads.
     *
     * @param {Object} filters Runtime cleanup filters.
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
     * Builds generated-service search options for cleanup reads.
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
     * Determines whether cleanup includes a record target.
     *
     * @param {Object} request Nodics request context.
     * @param {string} target Target name.
     * @returns {boolean} True when target should be included.
     */
    shouldTarget: function (request, target) {
        let payload = this.getPayload(request);
        let cleanupTarget = payload.cleanupTarget || payload.target || 'all';
        if (Array.isArray(cleanupTarget)) {
            return cleanupTarget.includes(target) || cleanupTarget.includes('all');
        }
        return cleanupTarget === 'all' || cleanupTarget === target;
    },

    /**
     * Creates policy summary for cleanup response.
     *
     * @param {Object} payload Cleanup payload.
     * @returns {Object} Cleanup policy summary.
     */
    createPolicySummary: function (payload) {
        return {
            target: payload.cleanupTarget || payload.target || 'all',
            olderThanDays: payload.olderThanDays,
            before: payload.before,
            allowPending: payload.allowPending === true,
            allowHighRisk: payload.allowHighRisk === true,
            limit: Number(payload.limit || 500)
        };
    },

    /**
     * Creates cleanup record response item.
     *
     * @param {Object} record Runtime governance record.
     * @param {string} recordType Record type.
     * @param {string} skipReason Skip reason.
     * @returns {Object} Cleanup record item.
     */
    createCleanupRecord: function (record, recordType, skipReason) {
        return {
            code: record.code,
            recordType: recordType,
            configurationType: record.configurationType,
            configurationCode: record.configurationCode,
            moduleName: record.moduleName,
            approvalStatus: record.approvalStatus,
            status: record.status,
            action: record.action,
            riskLevel: record.riskLevel,
            destructive: this.isDestructive(record),
            creationTime: record.creationTime,
            skipReason: skipReason
        };
    },

    /**
     * Creates cleanup audit warnings from skipped records.
     *
     * @param {Object} plan Cleanup plan.
     * @returns {Array} Cleanup warning messages.
     */
    createCleanupWarnings: function (plan) {
        let skipped = plan.activationRequests.skipped.concat(plan.activationLogs.skipped);
        if (skipped.length === 0) {
            return [];
        }
        return ['Runtime governance cleanup skipped ' + skipped.length + ' protected records'];
    },

    /**
     * Determines whether request record is pending.
     *
     * @param {Object} record Activation request record.
     * @returns {boolean} True when record is pending.
     */
    isPendingRequest: function (record) {
        return this.normalize(record.approvalStatus) === 'PENDING' ||
            this.normalize(record.status) === 'REQUESTED';
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
     * Resolves cleanup cutoff date.
     *
     * @param {Object} payload Cleanup payload.
     * @returns {Date|undefined} Cutoff date.
     */
    resolveBeforeDate: function (payload) {
        if (payload.before) {
            return new Date(payload.before);
        }
        if (payload.olderThanDays) {
            return new Date(Date.now() - Number(payload.olderThanDays) * 24 * 60 * 60 * 1000);
        }
        return undefined;
    },

    /**
     * Resolves creation/update date from a governance record.
     *
     * @param {Object} record Runtime governance record.
     * @returns {Date|undefined} Record date.
     */
    resolveRecordDate: function (record) {
        let value = record.creationTime || record.modifiedTime || record.updatedTime;
        if (!value) {
            return undefined;
        }
        let date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
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
     * Returns payload from request body, query, filters, or direct cleanup fields.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Payload map.
     */
    getPayload: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return _.merge({}, request.filters || {}, request.runtimeGovernanceCleanup || {}, query, body);
    },

    /**
     * Resolves tenant for runtime governance cleanup.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getTenant: function (request) {
        return request.tenant || CONFIG.get('defaultTenant') || 'default';
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
     * Creates cleanup audit code suffix.
     *
     * @returns {string} Cleanup code.
     */
    createCleanupCode: function () {
        return 'runtimeGovernanceCleanup_' + Date.now();
    }
};
