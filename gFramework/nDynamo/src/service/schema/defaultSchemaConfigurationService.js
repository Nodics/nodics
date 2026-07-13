/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/service/schema/defaultSchemaConfigurationService
 * @description Implements nDynamo default schema configuration service business behavior and extension logic.
 * @layer service
 * @owner nDynamo
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

     * Executes schema update event handler behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    schemaUpdateEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.handleSchemaUpdate(request, request.event.data.models).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    /**

     * Processes schema update behavior.

     *

     * @param {*} request Method input.

     * @param {*} schemaList Method input.

     * @returns {*} Method result.

     */

    handleSchemaUpdate: function (request, schemaList) {
        return new Promise((resolve, reject) => {
            if (schemaList && schemaList.length > 0) {
                let schemaCode = schemaList.shift();
                this.evaluateSchemaActivationPolicy(request, schemaCode).then(policyDecision => {
                    request.runtimeActivationPolicyDecisions = request.runtimeActivationPolicyDecisions || {};
                    request.runtimeActivationPolicyDecisions[schemaCode] = policyDecision;
                    return SERVICE.DefaultPipelineService.start('schemaUpdatedPipeline', {
                        tenant: request.tenant,
                        autData: request.autData,
                        event: request.event,
                        schemaCode: schemaCode
                    }, {});
                }).then(success => {
                    this.auditSchemaActivation({
                        request: request,
                        schemaCode: schemaCode,
                        status: 'SUCCESS',
                        result: success
                    }).then(() => {
                        this.handleSchemaUpdate(request, schemaList).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    this.auditSchemaActivation({
                        request: request,
                        schemaCode: schemaCode,
                        status: 'FAILED',
                        error: error
                    }).then(() => {
                        reject(error);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve('Updated all schemas');
            }
        });
    },

    /**
     * Evaluates activation policy before a runtime schema update.
     *
     * @param {Object} request Runtime activation request.
     * @param {string} schemaCode Runtime schema code.
     * @returns {Promise<Object>} Policy decision.
     */
    evaluateSchemaActivationPolicy: function (request, schemaCode) {
        if (!SERVICE.DefaultRuntimeConfigurationActivationPolicyService) {
            return Promise.resolve({});
        }
        return SERVICE.DefaultRuntimeConfigurationActivationPolicyService.evaluateActivation(request, {
            configurationType: 'schemaConfiguration',
            configurationCode: schemaCode
        });
    },

    /**
     * Records schema activation history without blocking activation.
     *
     * @param {Object} options Audit options.
     * @returns {Promise<boolean>} Resolves after the audit attempt.
     */
    auditSchemaActivation: function (options) {
        if (!SERVICE.DefaultRuntimeConfigurationAuditService) {
            return Promise.resolve(true);
        }
        let auditService = SERVICE.DefaultRuntimeConfigurationAuditService;
        return this.get({
            tenant: CONFIG.get('defaultTenant') || 'default',
            query: {
                code: options.schemaCode
            }
        }).then(success => {
            let runtimeSchema = success.result && success.result.length > 0 ? success.result[0] : undefined;
            return auditService.recordActivation({
                configurationType: 'schemaConfiguration',
                configurationCode: options.schemaCode,
                moduleName: runtimeSchema ? runtimeSchema.moduleName : undefined,
                action: runtimeSchema && runtimeSchema.active === false ? 'deactivate' : 'activate',
                status: options.status,
                tenant: options.request.tenant || CONFIG.get('defaultTenant') || 'default',
                requestedBy: auditService.resolveRequestedBy(options.request),
                correlationId: auditService.resolveCorrelationId(options.request),
                approvalStatus: options.request.runtimeActivationPolicyDecisions &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode] ?
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].approvalStatus : options.error && options.error.approvalStatus,
                approvedBy: options.request.runtimeActivationPolicyDecisions &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode] ?
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].approvedBy : undefined,
                approvalReason: options.request.runtimeActivationPolicyDecisions &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode] ?
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].approvalReason : undefined,
                riskLevel: options.request.runtimeActivationPolicyDecisions &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode] ?
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].riskLevel : options.error && options.error.riskLevel,
                activationRequestCode: options.request.runtimeActivationPolicyDecisions &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode] ?
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].activationRequestCode : options.request.activationRequestCode,
                warnings: options.request.runtimeActivationPolicyDecisions &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode] &&
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].preview ?
                    options.request.runtimeActivationPolicyDecisions[options.schemaCode].preview.warnings : options.error && options.error.warnings,
                previousSnapshot: runtimeSchema && runtimeSchema.moduleName && NODICS.getModule(runtimeSchema.moduleName) ?
                    this.getRawSchemaSnapshot(runtimeSchema.moduleName, runtimeSchema.code) : undefined,
                nextSnapshot: runtimeSchema,
                error: options.error
            });
        }).catch(error => {
            return auditService.recordActivation({
                configurationType: 'schemaConfiguration',
                configurationCode: options.schemaCode,
                action: 'activate',
                status: 'FAILED',
                tenant: options.request.tenant || CONFIG.get('defaultTenant') || 'default',
                requestedBy: auditService.resolveRequestedBy(options.request),
                correlationId: auditService.resolveCorrelationId(options.request),
                approvalStatus: options.error && options.error.approvalStatus,
                riskLevel: options.error && options.error.riskLevel,
                activationRequestCode: options.request.activationRequestCode,
                warnings: options.error && options.error.warnings,
                error: options.error || error
            });
        }).then(() => true);
    },

    /**
     * Safely resolves current effective schema snapshot.
     *
     * @param {string} moduleName Owning module.
     * @param {string} schemaCode Schema code.
     * @returns {Object|undefined} Current schema snapshot.
     */
    getRawSchemaSnapshot: function (moduleName, schemaCode) {
        let module = moduleName && NODICS.getModule ? NODICS.getModule(moduleName) : undefined;
        return module && module.rawSchema ? module.rawSchema[schemaCode] : undefined;
    },

    /**

     * Removes or clears  information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    remove: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    /**
     * Removes or clears by id information.
     *
     * @param {*} ids Method input.
     * @param {*} tenant Method input.
     * @returns {*} Method result.
     */
    removeById: function (ids, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    /**
     * Removes or clears by code information.
     *
     * @param {*} codes Method input.
     * @param {*} tenant Method input.
     * @returns {*} Method result.
     */
    removeByCode: function (codes, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    /**
     * Updates  information.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    update: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
};
