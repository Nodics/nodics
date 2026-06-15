/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    routerUpdateEventHandler: function (request) {
        let _self = this;
        let data = request.event.data;
        return new Promise((resolve, reject) => {
            if (!data.models || data.models.length <= 0) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'ClassName can not be null or empty'));
            }
            let query = {};
            if (data.propertyName === '_id') {
                data.models = data.models.map(id => {
                    return SERVICE.DefaultDatabaseConfigurationService.toObjectId(NODICS.getModels(request.moduleName, request.tenant)[data.modelName], id);
                });
            }
            query[data.propertyName] = {
                $in: data.models
            };
            this.registerRoutersFromDatabase({
                tenant: CONFIG.get('defaultTenant') || 'default'
            }).then(success => {
                if(success.code === 'ERR_SYS_00001'){
                    _self.LOG.error('Could not found any data for routers name ' + data.models);
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Could not found any data for routers name ' + data.models));
                }else{
                    resolve('Routers successfully activated');
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    loadPersistedRouters: function () {
        return new Promise((resolve, reject) => {
            if (typeof this.get !== 'function') {
                this.LOG.warn('Persisted router loading skipped; no router configuration model service is available');
                resolve(true);
                return;
            }
            this.registerRoutersFromDatabase({
                tenant: CONFIG.get('defaultTenant') || 'default',
                runtimeActivationSource: 'startup'
            }).then(success => {
                resolve(success.message)
            }).catch(error => {
                reject(error);
            });
        });
    },

    registerRoutersFromDatabase: function(query){
        return new Promise((resolve, reject) => {
            this.get(query).then(success => {
                try {
                    if (!success.result || success.result.length <= 0) {
                        resolve({
                            code:'ERR_SYS_00001',
                            message: 'None routers found to update'
                        });
                        return;
                    }

                    let runtimeRouters = this.prepareRuntimeRouterRegistry(success.result);
                    let previousSnapshots = this.collectPreviousRouterSnapshots(success.result);
                    this.evaluateRouterActivationPolicy(query, success.result).then(policyDecisions => {
                        let effectiveRouters = SERVICE.DefaultFilesLoaderService.mergeRuntimeRouterFiles(
                            SERVICE.DefaultRouterConfigurationService.getRawRouters(),
                            runtimeRouters
                        );
                        let runtimeContribution = SERVICE.DefaultFilesLoaderService.mergeRuntimeRouterFiles(
                            {},
                            runtimeRouters
                        );
                        SERVICE.DefaultRouterConfigurationService.setRawRouters(effectiveRouters);
                        SERVICE.DefaultRouterService.registerRouter(runtimeContribution).then(() => {
                            this.auditRouterActivations({
                                request: query,
                                routerDefinitions: success.result,
                                previousSnapshots: previousSnapshots,
                                policyDecisions: policyDecisions,
                                status: 'SUCCESS'
                            }).then(() => {
                                resolve({
                                    message: 'Routers successfully activated',
                                    count: success.result.length
                                });
                            });
                        }).catch(error => {
                            this.auditRouterActivations({
                                request: query,
                                routerDefinitions: success.result,
                                previousSnapshots: previousSnapshots,
                                policyDecisions: policyDecisions,
                                status: 'FAILED',
                                error: error
                            }).then(() => {
                                reject(error);
                            });
                        });
                    }).catch(error => {
                        this.auditRouterActivations({
                            request: query,
                            routerDefinitions: success.result,
                            previousSnapshots: previousSnapshots,
                            status: 'FAILED',
                            error: error
                        }).then(() => {
                            reject(error);
                        });
                    });
                } catch (error) {
                    reject(error);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Evaluates activation policy for runtime router definitions.
     *
     * @param {Object} request Runtime activation request.
     * @param {Object[]} routerDefinitions Runtime router definitions.
     * @returns {Promise<Object>} Policy decisions keyed by route code.
     */
    evaluateRouterActivationPolicy: function (request, routerDefinitions) {
        if (!SERVICE.DefaultRuntimeConfigurationActivationPolicyService) {
            return Promise.resolve({});
        }
        let policyService = SERVICE.DefaultRuntimeConfigurationActivationPolicyService;
        let decisions = {};
        let tasks = (routerDefinitions || []).map(routerDefinition => {
            return policyService.evaluateActivation(request, {
                configurationType: 'routerConfiguration',
                configurationCode: routerDefinition.code,
                configuration: routerDefinition
            }).then(decision => {
                decisions[routerDefinition.code] = decision;
            });
        });
        return Promise.all(tasks).then(() => decisions);
    },

    /**
     * Converts persisted route rows into the standard module -> group -> route map.
     *
     * @param {Object[]} routerDefinitions Persisted router definitions.
     * @returns {Object} Runtime router registry.
     */
    prepareRuntimeRouterRegistry: function (routerDefinitions) {
        let routers = {};
        routerDefinitions.forEach(routerDefinition => {
            let moduleName = routerDefinition.moduleName;
            let groupName = routerDefinition.groupName || routerDefinition.routerGroup || routerDefinition.group || 'runtime';
            routers[moduleName] = routers[moduleName] || {};
            routers[moduleName][groupName] = routers[moduleName][groupName] || {};
            routers[moduleName][groupName][routerDefinition.code] = routerDefinition;
        });
        return routers;
    },

    /**
     * Collects existing effective route definitions before runtime activation.
     *
     * @param {Object[]} routerDefinitions Runtime router definitions.
     * @returns {Object} Previous route snapshots keyed by module/group/code.
     */
    collectPreviousRouterSnapshots: function (routerDefinitions) {
        let snapshots = {};
        let rawRouters = SERVICE.DefaultRouterConfigurationService.getRawRouters() || {};
        routerDefinitions.forEach(routerDefinition => {
            let moduleName = routerDefinition.moduleName;
            let groupName = routerDefinition.groupName || routerDefinition.routerGroup || routerDefinition.group || 'runtime';
            snapshots[moduleName] = snapshots[moduleName] || {};
            snapshots[moduleName][groupName] = snapshots[moduleName][groupName] || {};
            snapshots[moduleName][groupName][routerDefinition.code] =
                rawRouters[moduleName] && rawRouters[moduleName][groupName] ? rawRouters[moduleName][groupName][routerDefinition.code] : undefined;
        });
        return snapshots;
    },

    /**
     * Records router activation history without blocking activation.
     *
     * @param {Object} options Audit options.
     * @returns {Promise<boolean>} Resolves after audit attempts complete.
     */
    auditRouterActivations: function (options) {
        if (!SERVICE.DefaultRuntimeConfigurationAuditService) {
            return Promise.resolve(true);
        }
        let auditService = SERVICE.DefaultRuntimeConfigurationAuditService;
        let records = (options.routerDefinitions || []).map(routerDefinition => {
            let groupName = routerDefinition.groupName || routerDefinition.routerGroup || routerDefinition.group || 'runtime';
            return auditService.recordActivation({
                configurationType: 'routerConfiguration',
                configurationCode: routerDefinition.code,
                moduleName: routerDefinition.moduleName,
                action: 'activate',
                status: options.status,
                tenant: options.request.tenant || CONFIG.get('defaultTenant') || 'default',
                requestedBy: auditService.resolveRequestedBy(options.request),
                correlationId: auditService.resolveCorrelationId(options.request),
                approvalStatus: options.policyDecisions && options.policyDecisions[routerDefinition.code] ?
                    options.policyDecisions[routerDefinition.code].approvalStatus : options.error && options.error.approvalStatus,
                approvedBy: options.policyDecisions && options.policyDecisions[routerDefinition.code] ?
                    options.policyDecisions[routerDefinition.code].approvedBy : undefined,
                approvalReason: options.policyDecisions && options.policyDecisions[routerDefinition.code] ?
                    options.policyDecisions[routerDefinition.code].approvalReason : undefined,
                riskLevel: options.policyDecisions && options.policyDecisions[routerDefinition.code] ?
                    options.policyDecisions[routerDefinition.code].riskLevel : options.error && options.error.riskLevel,
                activationRequestCode: options.policyDecisions && options.policyDecisions[routerDefinition.code] ?
                    options.policyDecisions[routerDefinition.code].activationRequestCode : options.request.activationRequestCode,
                warnings: options.policyDecisions && options.policyDecisions[routerDefinition.code] &&
                    options.policyDecisions[routerDefinition.code].preview ?
                    options.policyDecisions[routerDefinition.code].preview.warnings : options.error && options.error.warnings,
                previousSnapshot: options.previousSnapshots[routerDefinition.moduleName] &&
                    options.previousSnapshots[routerDefinition.moduleName][groupName] ?
                    options.previousSnapshots[routerDefinition.moduleName][groupName][routerDefinition.code] : undefined,
                nextSnapshot: routerDefinition,
                error: options.error
            });
        });
        return Promise.all(records).then(() => true);
    },
    remove: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    removeById: function (ids, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    removeByCode: function (codes, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    }
};
