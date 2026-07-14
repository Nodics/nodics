/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationRollbackService
 * @description Restores runtime schema, router, tenant-property, and schema
 * access-policy configurations from activation history without bypassing the
 * normal generated service and activation pipelines.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to add approval gates,
 * release windows, external backup lookup, or stricter rollback policy while
 * preserving the control-plane contract.
 */
module.exports = {

    /**
     * Initializes the runtime rollback service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime rollback service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Rolls back a runtime configuration using an activation log entry.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.activationCode Activation audit log code.
     * @returns {Promise<Object>} Rollback response.
     */
    rollbackActivation: function (request) {
        return new Promise((resolve, reject) => {
            this.resolveActivationLog(request).then(activationLog => {
                this.resolveRollbackSnapshot(activationLog).then(snapshot => {
                    this.restoreSnapshot(request, activationLog, snapshot).then(success => {
                        this.recordRollbackAudit(request, activationLog, snapshot, 'SUCCESS').then(() => {
                            resolve({
                                code: 'SUC_SYS_00000',
                                message: 'Runtime configuration rollback completed successfully',
                                data: {
                                    activationCode: activationLog.code,
                                    configurationType: activationLog.configurationType,
                                    configurationCode: activationLog.configurationCode,
                                    moduleName: activationLog.moduleName,
                                    result: success
                                }
                            });
                        });
                    }).catch(error => {
                        this.recordRollbackAudit(request, activationLog, snapshot, 'FAILED', error).then(() => {
                            reject(error);
                        });
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Resolves the activation log entry to rollback.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation log model.
     */
    resolveActivationLog: function (request) {
        return new Promise((resolve, reject) => {
            let activationCode = request.activationCode ||
                (request.httpRequest && request.httpRequest.body && request.httpRequest.body.activationCode) ||
                (request.httpRequest && request.httpRequest.query && request.httpRequest.query.activationCode);
            if (!activationCode) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Activation code is required for runtime configuration rollback'));
                return;
            }
            let auditLogService = SERVICE.DefaultConfigurationActivationLogService;
            if (!auditLogService || typeof auditLogService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation log service is not available'));
                return;
            }
            auditLogService.get({
                tenant: this.getRollbackTenant(request),
                query: {
                    code: activationCode
                }
            }).then(success => {
                let activationLog = success.result && success.result.length > 0 ? success.result[0] : undefined;
                if (!activationLog) {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Activation log not found for code: ' + activationCode));
                } else {
                    resolve(activationLog);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Returns the snapshot that should be restored.
     *
     * @param {Object} activationLog Activation log model.
     * @returns {Promise<Object>} Snapshot to restore.
     */
    resolveRollbackSnapshot: function (activationLog) {
        return new Promise((resolve, reject) => {
            if (!activationLog.previousSnapshot) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Activation log does not contain a previous snapshot'));
                return;
            }
            resolve(activationLog.previousSnapshot);
        });
    },

    /**
     * Restores the previous snapshot through the owning runtime configuration service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationLog Activation log model.
     * @param {Object} snapshot Snapshot to restore.
     * @returns {Promise<Object>} Runtime activation result.
     */
    restoreSnapshot: function (request, activationLog, snapshot) {
        if (activationLog.configurationType === 'schemaConfiguration') {
            return this.restoreSchemaConfiguration(request, activationLog, snapshot);
        }
        if (activationLog.configurationType === 'routerConfiguration') {
            return this.restoreRouterConfiguration(request, activationLog, snapshot);
        }
        if (activationLog.configurationType === 'propertyConfiguration') {
            return this.restorePropertyConfiguration(request, snapshot);
        }
        if (activationLog.configurationType === 'schemaAccessPolicy') {
            return this.restoreSchemaAccessPolicyConfiguration(request, activationLog, snapshot);
        }
        return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Rollback is not supported for configuration type: ' + activationLog.configurationType));
    },

    /**
     * Restores a tenant-property snapshot through the standard system
     * configuration service.
     *
     * @param {Object} request Rollback request context.
     * @param {Object} snapshot Minimal property snapshot.
     * @returns {Promise<Object>} Restoration result.
     */
    restorePropertyConfiguration: function (request, snapshot) {
        if (!SERVICE.DefaultConfigurationService ||
            typeof SERVICE.DefaultConfigurationService.restorePropertyConfigurationSnapshot !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Property configuration service is not available for rollback'));
        }
        return SERVICE.DefaultConfigurationService.restorePropertyConfigurationSnapshot({
            tenant: this.getRollbackTenant(request),
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId
        }, snapshot);
    },

    /**
     * Restores a runtime schema configuration and reruns schema activation.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationLog Activation log model.
     * @param {Object} snapshot Schema snapshot to restore.
     * @returns {Promise<Object>} Activation result.
     */
    restoreSchemaConfiguration: function (request, activationLog, snapshot) {
        return new Promise((resolve, reject) => {
            let schemaService = SERVICE.DefaultSchemaConfigurationService;
            if (!schemaService || typeof schemaService.save !== 'function' || typeof schemaService.handleSchemaUpdate !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Schema configuration service is not available for rollback'));
                return;
            }
            let rollbackModel = this.prepareRollbackModel(snapshot, activationLog);
            schemaService.save({
                tenant: this.getRollbackTenant(request),
                authData: request.authData,
                model: rollbackModel
            }).then(saveResult => {
                return schemaService.handleSchemaUpdate(this.createActivationRequest(request, activationLog), [rollbackModel.code]).then(activationResult => {
                    resolve({
                        saveResult: saveResult,
                        activationResult: activationResult
                    });
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Restores a runtime router configuration and reruns router activation.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationLog Activation log model.
     * @param {Object} snapshot Router snapshot to restore.
     * @returns {Promise<Object>} Activation result.
     */
    restoreRouterConfiguration: function (request, activationLog, snapshot) {
        return new Promise((resolve, reject) => {
            let routerService = SERVICE.DefaultRouterConfigurationService;
            if (!routerService || typeof routerService.save !== 'function' || typeof routerService.registerRoutersFromDatabase !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Router configuration service is not available for rollback'));
                return;
            }
            let rollbackModel = this.prepareRollbackModel(snapshot, activationLog);
            routerService.save({
                tenant: this.getRollbackTenant(request),
                authData: request.authData,
                model: rollbackModel
            }).then(saveResult => {
                return routerService.registerRoutersFromDatabase(this.createActivationRequest(request, activationLog)).then(activationResult => {
                    resolve({
                        saveResult: saveResult,
                        activationResult: activationResult
                    });
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Restores a schema/property access policy through the generated policy service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationLog Activation log model.
     * @param {Object} snapshot Policy snapshot to restore.
     * @returns {Promise<Object>} Restoration result.
     */
    restoreSchemaAccessPolicyConfiguration: function (request, activationLog, snapshot) {
        return new Promise((resolve, reject) => {
            let policyService = SERVICE.DefaultSchemaAccessPolicyService;
            if (!policyService || typeof policyService.save !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Schema access policy service is not available for rollback'));
                return;
            }
            let rollbackModel = this.prepareRollbackModel(snapshot, activationLog);
            policyService.save({
                tenant: this.getRollbackTenant(request),
                authData: request.authData,
                autData: request.autData,
                model: rollbackModel
            }).then(saveResult => {
                resolve({
                    saveResult: saveResult
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Ensures restored snapshots preserve the configuration identity.
     *
     * @param {Object} snapshot Previous snapshot.
     * @param {Object} activationLog Activation log model.
     * @returns {Object} Rollback model.
     */
    prepareRollbackModel: function (snapshot, activationLog) {
        let rollbackModel = Object.assign({}, snapshot);
        rollbackModel.code = rollbackModel.code || activationLog.configurationCode;
        rollbackModel.moduleName = rollbackModel.moduleName || activationLog.moduleName;
        rollbackModel.active = rollbackModel.active !== false;
        return rollbackModel;
    },

    /**
     * Creates an activation request that carries rollback context.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationLog Activation log model.
     * @returns {Object} Activation request.
     */
    createActivationRequest: function (request, activationLog) {
        return {
            tenant: this.getRollbackTenant(request),
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId,
            runtimeActivationSource: 'rollback',
            query: {
                code: activationLog.configurationCode
            },
            event: {
                data: {
                    models: [activationLog.configurationCode]
                }
            }
        };
    },

    /**
     * Records rollback history without blocking rollback response handling.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationLog Activation log model.
     * @param {Object} snapshot Snapshot used for rollback.
     * @param {string} status Rollback status.
     * @param {Error} [error] Rollback error.
     * @returns {Promise<Object>} Audit result.
     */
    recordRollbackAudit: function (request, activationLog, snapshot, status, error) {
        let auditService = SERVICE.DefaultRuntimeConfigurationAuditService;
        if (!auditService || typeof auditService.recordActivation !== 'function') {
            return Promise.resolve(true);
        }
        return auditService.recordActivation({
            configurationType: activationLog.configurationType,
            configurationCode: activationLog.configurationCode,
            moduleName: activationLog.moduleName,
            action: 'rollback',
            status: status,
            tenant: this.getRollbackTenant(request),
            requestedBy: auditService.resolveRequestedBy(request),
            correlationId: auditService.resolveCorrelationId(request),
            previousSnapshot: activationLog.nextSnapshot,
            nextSnapshot: snapshot,
            error: error
        });
    },

    /**
     * Resolves the tenant used for rollback persistence and activation.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getRollbackTenant: function (request) {
        return request.tenant || CONFIG.get('defaultTenant') || 'default';
    }
};
