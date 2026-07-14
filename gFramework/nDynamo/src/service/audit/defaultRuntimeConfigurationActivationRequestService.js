/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationActivationRequestService
 * @description Manages runtime configuration activation request lifecycle:
 * request, approve, reject, and activate approved schema, router, property,
 * and schema access-policy changes.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to integrate enterprise
 * workflow engines, ticketing, approval matrices, or release governance while
 * preserving the control-plane request lifecycle contract.
 */
module.exports = {

    /**
     * Initializes the runtime activation request service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime activation request service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Creates a persisted activation request with captured preview impact.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request response.
     */
    createActivationRequest: function (request) {
        return new Promise((resolve, reject) => {
            let payload = this.getPayload(request);
            this.previewActivationRequest(request, payload).then(preview => {
                let model = this.createRequestModel(request, payload, preview);
                this.persistRequestModel(request, model).then(success => {
                    resolve({
                        code: 'SUC_SYS_00000',
                        message: 'Runtime configuration activation request created successfully',
                        data: model,
                        result: success
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
     * Approves a pending activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Approval response.
     */
    approveActivationRequest: function (request) {
        return this.transitionActivationRequest(request, 'APPROVED', 'APPROVED');
    },

    /**
     * Rejects a pending activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Rejection response.
     */
    rejectActivationRequest: function (request) {
        return this.transitionActivationRequest(request, 'REJECTED', 'REJECTED');
    },

    /**
     * Activates an approved runtime configuration request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation response.
     */
    activateApprovedRequest: function (request) {
        return new Promise((resolve, reject) => {
            this.resolveActivationRequest(request).then(activationRequest => {
                if (activationRequest.approvalStatus !== 'APPROVED') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Activation request must be approved before activation'));
                    return;
                }
                let actor = this.resolveRequestedBy(request);
                try {
                    this.assertActivationSeparation(activationRequest, actor);
                } catch (error) {
                    reject(error);
                    return;
                }
                this.activateConfiguration(request, activationRequest).then(success => {
                    let updatedRequest = Object.assign({}, activationRequest, {
                        status: 'ACTIVATED',
                        activatedBy: actor
                    });
                    this.persistRequestModel(request, updatedRequest).then(() => {
                        resolve({
                            code: 'SUC_SYS_00000',
                            message: 'Approved runtime configuration request activated successfully',
                            data: updatedRequest,
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
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
     * Queries activation requests for the control-plane work queue.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request query response.
     */
    getActivationRequests: function (request) {
        return new Promise((resolve, reject) => {
            let requestService = this.getActivationRequestModelService();
            if (!requestService || typeof requestService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
                return;
            }
            let query = this.prepareActivationRequestQuery(request);
            requestService.get({
                tenant: this.getTenant(request),
                query: query,
                searchOptions: request.searchOptions || this.prepareActivationRequestSearchOptions(request)
            }).then(success => {
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Runtime configuration activation requests fetched successfully',
                    data: success.result || [],
                    metadata: {
                        query: query,
                        count: success.result ? success.result.length : 0,
                        tenant: this.getTenant(request)
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Transitions approval status for an activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {string} approvalStatus New approval status.
     * @param {string} status New lifecycle status.
     * @returns {Promise<Object>} Transition response.
     */
    transitionActivationRequest: function (request, approvalStatus, status) {
        return new Promise((resolve, reject) => {
            this.resolveActivationRequest(request).then(activationRequest => {
                let payload = this.getPayload(request);
                let actor = this.resolveRequestedBy(request);
                try {
                    this.assertDecisionSeparation(activationRequest, actor);
                } catch (error) {
                    reject(error);
                    return;
                }
                let updatedRequest = Object.assign({}, activationRequest, {
                    approvalStatus: approvalStatus,
                    status: status,
                    approvedBy: actor,
                    approvalReason: payload.approvalReason || payload.reason
                });
                this.persistRequestModel(request, updatedRequest).then(success => {
                    resolve({
                        code: 'SUC_SYS_00000',
                        message: 'Runtime configuration activation request ' + approvalStatus.toLowerCase() + ' successfully',
                        data: updatedRequest,
                        result: success
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
     * Runs preview for the requested runtime activation.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} payload Activation request payload.
     * @returns {Promise<Object>} Preview data.
     */
    previewActivationRequest: function (request, payload) {
        if (!SERVICE.DefaultRuntimeConfigurationPreviewService ||
            typeof SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration preview service is not available'));
        }
        return SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation({
            tenant: this.getTenant(request),
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId,
            preview: {
                configurationType: payload.configurationType,
                configurationCode: payload.configurationCode,
                moduleName: payload.moduleName,
                configuration: payload.configuration
            }
        }).then(success => success.data);
    },

    /**
     * Activates schema or router configuration for an approved request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationRequest Activation request model.
     * @returns {Promise<Object>} Activation result.
     */
    activateConfiguration: function (request, activationRequest) {
        let activationContext = this.createActivationContext(request, activationRequest);
        if (activationRequest.configurationType === 'schemaConfiguration') {
            if (!SERVICE.DefaultSchemaConfigurationService ||
                typeof SERVICE.DefaultSchemaConfigurationService.handleSchemaUpdate !== 'function') {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Schema configuration service is not available for activation request'));
            }
            return SERVICE.DefaultSchemaConfigurationService.handleSchemaUpdate(activationContext, [activationRequest.configurationCode]);
        }
        if (activationRequest.configurationType === 'routerConfiguration') {
            if (!SERVICE.DefaultRouterConfigurationService ||
                typeof SERVICE.DefaultRouterConfigurationService.registerRoutersFromDatabase !== 'function') {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Router configuration service is not available for activation request'));
            }
            return SERVICE.DefaultRouterConfigurationService.registerRoutersFromDatabase(activationContext);
        }
        if (activationRequest.configurationType === 'propertyConfiguration') {
            if (!SERVICE.DefaultConfigurationService ||
                typeof SERVICE.DefaultConfigurationService.applyPropertyConfiguration !== 'function') {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Property configuration service is not available for activation request'));
            }
            if (!activationRequest.configuration ||
                activationRequest.configurationDigest !== this.createConfigurationDigest(activationRequest.configuration)) {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Approved property configuration payload failed integrity validation'));
            }
            return SERVICE.DefaultConfigurationService.applyPropertyConfiguration(
                activationContext,
                activationRequest.configuration,
                activationRequest.preview
            );
        }
        if (activationRequest.configurationType === 'schemaAccessPolicy') {
            return this.activateSchemaAccessPolicyConfiguration(request, activationRequest, activationContext);
        }
        return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Activation request is not supported for configuration type: ' + activationRequest.configurationType));
    },

    /**
     * Activates a governed schema/property access policy through the generated model service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationRequest Approved activation request.
     * @param {Object} activationContext Runtime activation context.
     * @returns {Promise<Object>} Activation result.
     */
    activateSchemaAccessPolicyConfiguration: function (request, activationRequest, activationContext) {
        return new Promise((resolve, reject) => {
            let policyService = SERVICE.DefaultSchemaAccessPolicyService;
            if (!policyService || typeof policyService.save !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Schema access policy service is not available for activation request'));
                return;
            }
            if (!activationRequest.configuration ||
                activationRequest.configurationDigest !== this.createConfigurationDigest(activationRequest.configuration)) {
                reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Approved schema access policy payload failed integrity validation'));
                return;
            }
            policyService.save({
                tenant: activationContext.tenant,
                authData: activationContext.authData,
                autData: activationContext.autData,
                model: activationRequest.configuration
            }).then(saveResult => {
                return this.recordSchemaAccessPolicyActivation(activationContext, activationRequest, 'SUCCESS').then(auditResult => {
                    resolve({
                        saveResult: saveResult,
                        auditResult: auditResult
                    });
                });
            }).catch(error => {
                this.recordSchemaAccessPolicyActivation(activationContext, activationRequest, 'FAILED', error).then(() => {
                    reject(error);
                });
            });
        });
    },

    /**
     * Records schema access-policy activation audit after governed save.
     *
     * @param {Object} activationContext Runtime activation context.
     * @param {Object} activationRequest Approved activation request.
     * @param {string} status Activation status.
     * @param {Error} [error] Activation error.
     * @returns {Promise<Object>} Audit result.
     */
    recordSchemaAccessPolicyActivation: function (activationContext, activationRequest, status, error) {
        let auditService = SERVICE.DefaultRuntimeConfigurationAuditService;
        if (!auditService || typeof auditService.recordActivation !== 'function') {
            return Promise.resolve(true);
        }
        let preview = activationRequest.preview || {};
        return auditService.recordActivation({
            configurationType: activationRequest.configurationType,
            configurationCode: activationRequest.configurationCode,
            moduleName: activationRequest.moduleName,
            action: 'activate',
            status: status,
            tenant: activationContext.tenant,
            requestedBy: activationRequest.requestedBy,
            approvedBy: activationRequest.approvedBy,
            approvalStatus: activationRequest.approvalStatus,
            approvalReason: activationRequest.approvalReason,
            riskLevel: activationRequest.riskLevel,
            activationRequestCode: activationRequest.code,
            correlationId: activationContext.correlationId,
            previousSnapshot: preview.previousSnapshot,
            nextSnapshot: preview.nextSnapshot,
            warnings: preview.warnings,
            error: error
        });
    },

    /**
     * Creates runtime activation context from approved request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationRequest Activation request model.
     * @returns {Object} Activation context.
     */
    createActivationContext: function (request, activationRequest) {
        return {
            tenant: this.getTenant(request),
            runtimeActivationSource: 'approvedRequest',
            trustedRuntimeActivation: true,
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId || activationRequest.correlationId,
            activationRequestCode: activationRequest.code,
            activationApproval: {
                approved: true,
                approvedBy: activationRequest.approvedBy,
                approvalReason: activationRequest.approvalReason,
                activationRequestCode: activationRequest.code
            },
            query: {
                code: activationRequest.configurationCode
            },
            event: {
                data: {
                    models: [activationRequest.configurationCode],
                    activationApproval: {
                        approved: true,
                        approvedBy: activationRequest.approvedBy,
                        approvalReason: activationRequest.approvalReason,
                        activationRequestCode: activationRequest.code
                    }
                }
            }
        };
    },

    /**
     * Builds the activation request model from payload and preview.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} payload Request payload.
     * @param {Object} preview Preview data.
     * @returns {Object} Activation request model.
     */
    createRequestModel: function (request, payload, preview) {
        let requestedBy = this.resolveRequestedBy(request);
        this.assertActor(requestedBy);
        let model = {
            code: payload.code || this.createActivationRequestCode(payload),
            active: true,
            configurationType: payload.configurationType,
            configurationCode: payload.configurationCode || preview.configurationCode,
            moduleName: payload.moduleName || preview.moduleName,
            requestedBy: requestedBy,
            requestReason: payload.requestReason || payload.reason,
            approvalStatus: 'PENDING',
            riskLevel: preview.destructive ? 'HIGH' : 'LOW',
            preview: preview,
            status: 'REQUESTED',
            correlationId: request.correlationId
        };
        if (payload.configurationType === 'propertyConfiguration' || payload.configurationType === 'schemaAccessPolicy') {
            model.configuration = payload.configuration;
            model.configurationDigest = this.createConfigurationDigest(payload.configuration);
        }
        return model;
    },

    /**
     * Creates an order-independent digest binding approval to an exact patch.
     *
     * @param {Object} configuration Property patch.
     * @returns {string} SHA-256 digest.
     */
    createConfigurationDigest: function (configuration) {
        let canonicalize = value => {
            if (Array.isArray(value)) return value.map(canonicalize);
            if (value && typeof value === 'object') {
                return Object.keys(value).sort().reduce((result, key) => {
                    result[key] = canonicalize(value[key]);
                    return result;
                }, {});
            }
            return value;
        };
        return crypto.createHash('sha256').update(JSON.stringify(canonicalize(configuration || {}))).digest('hex');
    },

    /**
     * Resolves an activation request by code.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request model.
     */
    resolveActivationRequest: function (request) {
        return new Promise((resolve, reject) => {
            let requestCode = this.getActivationRequestCode(request);
            if (!requestCode) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'activationRequestCode is required'));
                return;
            }
            let requestService = this.getActivationRequestModelService();
            if (!requestService || typeof requestService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
                return;
            }
            requestService.get({
                tenant: this.getTenant(request),
                query: {
                    code: requestCode
                }
            }).then(success => {
                let activationRequest = success.result && success.result.length > 0 ? success.result[0] : undefined;
                if (!activationRequest) {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Activation request not found for code: ' + requestCode));
                } else {
                    resolve(activationRequest);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Builds query filters for activation request lookup.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Query filters.
     */
    prepareActivationRequestQuery: function (request) {
        let filters = this.getPayload(request);
        let query = {};
        [
            'code',
            'configurationType',
            'configurationCode',
            'moduleName',
            'requestedBy',
            'approvalStatus',
            'approvedBy',
            'riskLevel',
            'status',
            'correlationId',
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
     * Builds generated-service search options for activation request queries.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Search options.
     */
    prepareActivationRequestSearchOptions: function (request) {
        let filters = this.getPayload(request);
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
     * Persists an activation request model.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} model Activation request model.
     * @returns {Promise<Object>} Persistence result.
     */
    persistRequestModel: function (request, model) {
        let requestService = this.getActivationRequestModelService();
        if (!requestService || typeof requestService.save !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
        }
        return requestService.save({
            tenant: this.getTenant(request),
            authData: request.authData,
            model: model
        });
    },

    /**
     * Returns the generated activation request model service.
     *
     * @returns {Object|undefined} Generated service.
     */
    getActivationRequestModelService: function () {
        return SERVICE.DefaultConfigurationActivationRequestService;
    },

    /**
     * Returns payload from request body, query, or direct request fields.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Payload map.
     */
    getPayload: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return Object.assign({}, request.activationRequest || {}, query, body);
    },

    /**
     * Returns activation request code from request.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Activation request code.
     */
    getActivationRequestCode: function (request) {
        let payload = this.getPayload(request);
        return payload.activationRequestCode || payload.code;
    },

    /**
     * Creates a unique activation request code.
     *
     * @param {Object} payload Request payload.
     * @returns {string} Request code.
     */
    createActivationRequestCode: function (payload) {
        return [
            'activationRequest',
            payload.configurationType || 'runtimeConfiguration',
            payload.configurationCode || 'unknown',
            Date.now()
        ].join('_');
    },

    /**
     * Resolves tenant for activation request persistence.
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

     * Retrieves separation policy information.

     *

     * @returns {*} Method result.

     */

    getSeparationPolicy: function () {
        let governance = CONFIG.get('identityGovernance') || {};
        return governance.separationOfDuties || {};
    },

    /**

     * Executes assert actor behavior.

     *

     * @param {*} actor Method input.

     * @returns {*} Method result.

     */

    assertActor: function (actor) {
        if (!actor && this.getSeparationPolicy().requireActor !== false) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'An authenticated actor is required for governed runtime changes');
        }
    },

    /**

     * Executes assert decision separation behavior.

     *

     * @param {*} activationRequest Method input.

     * @param {*} actor Method input.

     * @returns {*} Method result.

     */

    assertDecisionSeparation: function (activationRequest, actor) {
        let policy = this.getSeparationPolicy();
        this.assertActor(actor);
        if (policy.preventSelfDecision !== false && actor === activationRequest.requestedBy) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'The requester cannot approve or reject the same runtime change');
        }
    },

    /**

     * Executes assert activation separation behavior.

     *

     * @param {*} activationRequest Method input.

     * @param {*} actor Method input.

     * @returns {*} Method result.

     */

    assertActivationSeparation: function (activationRequest, actor) {
        let policy = this.getSeparationPolicy();
        this.assertActor(actor);
        if (policy.preventRequesterActivation !== false && actor === activationRequest.requestedBy) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'The requester cannot activate the same runtime change');
        }
        if (policy.preventApproverActivation !== false && actor === activationRequest.approvedBy) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'The approver cannot activate the same runtime change');
        }
    }
};
