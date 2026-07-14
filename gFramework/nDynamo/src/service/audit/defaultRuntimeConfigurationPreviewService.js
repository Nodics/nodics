/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationPreviewService
 * @description Computes non-destructive previews for runtime schema, router,
 * tenant-property, and schema access-policy configuration activations before
 * they are activated.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to enrich impact analysis,
 * add approval policy, or apply project-specific risk scoring while preserving
 * the same preview response contract.
 */
module.exports = {

    /**
     * Initializes the runtime configuration preview service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime configuration preview service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Previews a runtime configuration activation without mutating runtime state.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Preview response.
     */
    previewActivation: function (request) {
        return new Promise((resolve, reject) => {
            this.resolvePreviewConfiguration(request).then(configuration => {
                let preview = this.createPreview(configuration);
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Runtime configuration activation preview completed successfully',
                    data: preview
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Resolves the proposed runtime configuration from request payload or database.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Preview configuration descriptor.
     */
    resolvePreviewConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            let payload = this.getPreviewPayload(request);
            let configurationType = payload.configurationType;
            if (!configurationType) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'configurationType is required for runtime configuration preview'));
                return;
            }
            if (payload.configuration) {
                if (configurationType === 'schemaAccessPolicy') {
                    this.loadExistingSchemaAccessPolicy(request, payload).then(previousConfiguration => {
                        resolve({
                            configurationType: configurationType,
                            configurationCode: payload.configurationCode || payload.configuration.code,
                            moduleName: payload.moduleName || payload.configuration.moduleName,
                            tenant: this.getPreviewTenant(request),
                            configuration: payload.configuration,
                            previousConfiguration: previousConfiguration
                        });
                    }).catch(error => {
                        reject(error);
                    });
                    return;
                }
                resolve({
                    configurationType: configurationType,
                    configurationCode: payload.configurationCode || payload.configuration.code,
                    moduleName: payload.moduleName || payload.configuration.moduleName,
                    tenant: this.getPreviewTenant(request),
                    configuration: payload.configuration
                });
                return;
            }
            this.loadPersistedConfiguration(request, payload).then(configuration => {
                resolve({
                    configurationType: configurationType,
                    configurationCode: payload.configurationCode || configuration.code,
                    moduleName: payload.moduleName || configuration.moduleName,
                    configuration: configuration
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Loads a persisted runtime configuration for preview by type and code.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} payload Preview request payload.
     * @returns {Promise<Object>} Persisted runtime configuration.
     */
    loadPersistedConfiguration: function (request, payload) {
        return new Promise((resolve, reject) => {
            if (!payload.configurationCode) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'configurationCode is required when preview configuration is not supplied'));
                return;
            }
            let service = this.getRuntimeConfigurationService(payload.configurationType);
            if (!service || typeof service.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration service is not available for type: ' + payload.configurationType));
                return;
            }
            service.get({
                tenant: this.getPreviewTenant(request),
                query: {
                    code: payload.configurationCode
                }
            }).then(success => {
                let configuration = success.result && success.result.length > 0 ? success.result[0] : undefined;
                if (!configuration) {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration not found for code: ' + payload.configurationCode));
                } else {
                    resolve(configuration);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Creates a preview for schema or router runtime configuration changes.
     *
     * @param {Object} descriptor Runtime configuration descriptor.
     * @returns {Object} Preview result.
     */
    createPreview: function (descriptor) {
        if (descriptor.configurationType === 'schemaConfiguration') {
            return this.createSchemaPreview(descriptor);
        }
        if (descriptor.configurationType === 'routerConfiguration') {
            return this.createRouterPreview(descriptor);
        }
        if (descriptor.configurationType === 'propertyConfiguration') {
            return this.createPropertyPreview(descriptor);
        }
        if (descriptor.configurationType === 'schemaAccessPolicy') {
            return this.createSchemaAccessPolicyPreview(descriptor);
        }
        throw new CLASSES.NodicsError('ERR_SYS_00002', 'Preview is not supported for configuration type: ' + descriptor.configurationType);
    },

    /**
     * Creates a schema/property access-policy preview from captured policy state.
     *
     * @param {Object} descriptor Runtime schema access policy descriptor.
     * @returns {Object} Schema access policy preview.
     */
    createSchemaAccessPolicyPreview: function (descriptor) {
        let configuration = descriptor.configuration;
        this.validateSchemaAccessPolicy(configuration);
        let previousSnapshot = descriptor.previousConfiguration;
        let nextSnapshot = this.normalizeSchemaAccessPolicy(configuration);
        return this.createPreviewResponse({
            configurationType: descriptor.configurationType,
            configurationCode: descriptor.configurationCode || nextSnapshot.code,
            moduleName: descriptor.moduleName || nextSnapshot.moduleName,
            tenant: descriptor.tenant || CONFIG.get('defaultTenant') || 'default',
            previousSnapshot: previousSnapshot,
            nextSnapshot: nextSnapshot,
            warnings: this.collectSchemaAccessPolicyWarnings(previousSnapshot, nextSnapshot),
            affectedArtifacts: this.collectSchemaAccessPolicyAffectedArtifacts(nextSnapshot)
        });
    },

    /**
     * Validates a proposed schema access policy through the shared contract service.
     *
     * @param {Object} configuration Proposed schema access policy.
     * @returns {void}
     */
    validateSchemaAccessPolicy: function (configuration) {
        let contractService = SERVICE.DefaultSchemaAccessPolicyContractService;
        if (!contractService || typeof contractService.validatePolicy !== 'function') {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Schema access policy contract service is not available');
        }
        let validation = contractService.validatePolicy(configuration || {});
        if (!validation.valid) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'Schema access policy configuration is invalid');
        }
    },

    /**
     * Normalizes a schema access policy through the shared contract service.
     *
     * @param {Object} configuration Proposed schema access policy.
     * @returns {Object} Normalized policy.
     */
    normalizeSchemaAccessPolicy: function (configuration) {
        let validation = SERVICE.DefaultSchemaAccessPolicyContractService.validatePolicy(configuration || {});
        return validation.policy;
    },

    /**
     * Loads the current schema access policy when a direct configuration payload is previewed.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} payload Preview request payload.
     * @returns {Promise<Object|undefined>} Current policy snapshot.
     */
    loadExistingSchemaAccessPolicy: function (request, payload) {
        return new Promise((resolve, reject) => {
            let configurationCode = payload.configurationCode || (payload.configuration && payload.configuration.code);
            if (!configurationCode) {
                resolve(undefined);
                return;
            }
            let service = this.getRuntimeConfigurationService('schemaAccessPolicy');
            if (!service || typeof service.get !== 'function') {
                resolve(undefined);
                return;
            }
            service.get({
                tenant: this.getPreviewTenant(request),
                query: {
                    code: configurationCode
                }
            }).then(success => {
                resolve(success.result && success.result.length > 0 ? success.result[0] : undefined);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Creates a tenant-property preview using only changed paths.
     *
     * @param {Object} descriptor Runtime property descriptor.
     * @returns {Object} Property configuration preview.
     */
    createPropertyPreview: function (descriptor) {
        let configuration = descriptor.configuration;
        this.validatePropertyConfiguration(configuration);
        let tenant = descriptor.tenant || CONFIG.get('defaultTenant') || 'default';
        let previousProperties = CONFIG.getProperties(tenant) || {};
        let nextProperties = _.merge({}, previousProperties, configuration);
        let changedPaths = this.collectChangedPaths(previousProperties, nextProperties);
        return {
            operation: changedPaths.some(path => _.has(previousProperties, path)) ? 'update' : 'create',
            destructive: changedPaths.length > 0,
            configurationType: descriptor.configurationType,
            configurationCode: descriptor.configurationCode || 'tenantProperties',
            moduleName: descriptor.moduleName || 'system',
            tenant: tenant,
            previousSnapshot: this.createPropertySnapshot(previousProperties, changedPaths),
            nextSnapshot: this.createPropertySnapshot(nextProperties, changedPaths),
            changedPaths: changedPaths,
            warnings: changedPaths.map(path => 'tenant runtime property will change: ' + path),
            affectedArtifacts: changedPaths.map(path => ({ type: 'property', code: path }))
        };
    },

    /**
     * Rejects prototype-mutating keys and secret-bearing runtime property paths.
     * Secrets belong in layered external configuration or a secret manager.
     *
     * @param {Object} configuration Proposed property patch.
     * @returns {void}
     */
    validatePropertyConfiguration: function (configuration) {
        if (!_.isPlainObject(configuration) || Object.keys(configuration).length === 0) {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Property configuration must be a non-empty object');
        }
        let unsafePaths = [];
        let sensitivePaths = [];
        let sensitivePatterns = this.getSensitivePropertyPatterns();
        let inspect = (value, prefix) => {
            Object.keys(value || {}).forEach(key => {
                let path = prefix ? prefix + '.' + key : key;
                if (key === '__proto__' || key === 'prototype' || key === 'constructor') unsafePaths.push(path);
                if (sensitivePatterns.some(pattern => pattern.test(path))) sensitivePaths.push(path);
                if (_.isPlainObject(value[key])) inspect(value[key], path);
            });
        };
        inspect(configuration, '');
        if (unsafePaths.length > 0) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'Unsafe runtime property paths are not allowed: ' + unsafePaths.join(', '));
        }
        if (sensitivePaths.length > 0) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'Sensitive properties must use layered external configuration or a secret manager: ' + sensitivePaths.join(', '));
        }
    },

    /**
     * Resolves layer-overridable sensitive property path patterns.
     *
     * @returns {RegExp[]} Case-insensitive sensitive path patterns.
     */
    getSensitivePropertyPatterns: function () {
        let governance = CONFIG.get('runtimePropertyGovernance') || {};
        let patterns = governance.sensitivePathPatterns || [
            'password', 'passwd', 'secret', 'token', 'api[-_]?key', 'private[-_]?key', 'credential'
        ];
        return patterns.map(pattern => pattern instanceof RegExp ?
            new RegExp(pattern.source, pattern.flags.replace('g', '')) : new RegExp(pattern, 'i'));
    },

    /**
     * Captures values and absent paths required for deterministic rollback.
     *
     * @param {Object} properties Effective tenant properties.
     * @param {string[]} changedPaths Changed property paths.
     * @returns {Object} Minimal rollback snapshot.
     */
    createPropertySnapshot: function (properties, changedPaths) {
        let snapshot = { values: [], missingPaths: [] };
        (changedPaths || []).forEach(path => {
            if (_.has(properties, path)) {
                snapshot.values.push({ path: path, value: _.cloneDeep(_.get(properties, path)) });
            } else {
                snapshot.missingPaths.push(path);
            }
        });
        return snapshot;
    },

    /**
     * Creates a schema activation preview.
     *
     * @param {Object} descriptor Runtime configuration descriptor.
     * @returns {Object} Schema preview result.
     */
    createSchemaPreview: function (descriptor) {
        let configuration = descriptor.configuration;
        let moduleName = descriptor.moduleName || configuration.moduleName;
        let configurationCode = descriptor.configurationCode || configuration.code;
        let previousSnapshot = this.getCurrentSchemaSnapshot(moduleName, configurationCode);
        let effectiveRegistry = SERVICE.DefaultFilesLoaderService.mergeRuntimeSchemaFiles(
            this.createSchemaRegistry(moduleName, configurationCode, previousSnapshot),
            this.createSchemaRegistry(moduleName, configurationCode, configuration),
            moduleName,
            'runtime:preview'
        );
        let nextSnapshot = effectiveRegistry[moduleName] ? effectiveRegistry[moduleName][configurationCode] : undefined;
        return this.createPreviewResponse({
            configurationType: descriptor.configurationType,
            configurationCode: configurationCode,
            moduleName: moduleName,
            previousSnapshot: previousSnapshot,
            nextSnapshot: nextSnapshot,
            warnings: this.collectSchemaWarnings(previousSnapshot, configuration, nextSnapshot),
            affectedArtifacts: this.collectSchemaAffectedArtifacts(configurationCode, nextSnapshot)
        });
    },

    /**
     * Creates a router activation preview.
     *
     * @param {Object} descriptor Runtime configuration descriptor.
     * @returns {Object} Router preview result.
     */
    createRouterPreview: function (descriptor) {
        let configuration = descriptor.configuration;
        let moduleName = descriptor.moduleName || configuration.moduleName;
        let groupName = configuration.groupName || configuration.routerGroup || configuration.group || 'runtime';
        let configurationCode = descriptor.configurationCode || configuration.code;
        let previousSnapshot = this.getCurrentRouterSnapshot(moduleName, groupName, configurationCode);
        let effectiveRegistry = SERVICE.DefaultFilesLoaderService.mergeRuntimeRouterFiles(
            this.createRouterRegistry(moduleName, groupName, configurationCode, previousSnapshot),
            this.createRouterRegistry(moduleName, groupName, configurationCode, configuration),
            moduleName,
            'runtime:preview'
        );
        let nextSnapshot = effectiveRegistry[moduleName] &&
            effectiveRegistry[moduleName][groupName] ? effectiveRegistry[moduleName][groupName][configurationCode] : undefined;
        return this.createPreviewResponse({
            configurationType: descriptor.configurationType,
            configurationCode: configurationCode,
            moduleName: moduleName,
            groupName: groupName,
            previousSnapshot: previousSnapshot,
            nextSnapshot: nextSnapshot,
            warnings: this.collectRouterWarnings(previousSnapshot, configuration, nextSnapshot),
            affectedArtifacts: this.collectRouterAffectedArtifacts(configurationCode, nextSnapshot)
        });
    },

    /**
     * Builds a normalized preview response with change metadata.
     *
     * @param {Object} preview Preview fields.
     * @returns {Object} Normalized preview.
     */
    createPreviewResponse: function (preview) {
        let changedPaths = this.collectChangedPaths(preview.previousSnapshot || {}, preview.nextSnapshot || {});
        let operation = preview.previousSnapshot ? 'update' : 'create';
        return _.merge({
            operation: operation,
            destructive: this.hasDestructiveChange(preview.previousSnapshot, preview.nextSnapshot, preview.warnings),
            changedPaths: changedPaths,
            warnings: []
        }, preview);
    },

    /**
     * Returns the current effective schema snapshot.
     *
     * @param {string} moduleName Owning module.
     * @param {string} schemaCode Schema code.
     * @returns {Object|undefined} Current schema snapshot.
     */
    getCurrentSchemaSnapshot: function (moduleName, schemaCode) {
        let module = moduleName && NODICS.getModule ? NODICS.getModule(moduleName) : undefined;
        return module && module.rawSchema ? module.rawSchema[schemaCode] : undefined;
    },

    /**
     * Returns the current effective router snapshot.
     *
     * @param {string} moduleName Owning module.
     * @param {string} groupName Router group.
     * @param {string} routeCode Route code.
     * @returns {Object|undefined} Current router snapshot.
     */
    getCurrentRouterSnapshot: function (moduleName, groupName, routeCode) {
        let rawRouters = SERVICE.DefaultRouterConfigurationService &&
            SERVICE.DefaultRouterConfigurationService.getRawRouters ? SERVICE.DefaultRouterConfigurationService.getRawRouters() : {};
        return rawRouters[moduleName] && rawRouters[moduleName][groupName] ? rawRouters[moduleName][groupName][routeCode] : undefined;
    },

    /**
     * Creates a schema registry for governed merge preview.
     *
     * @param {string} moduleName Owning module.
     * @param {string} schemaCode Schema code.
     * @param {Object} schema Schema definition.
     * @returns {Object} Schema registry.
     */
    createSchemaRegistry: function (moduleName, schemaCode, schema) {
        let registry = {};
        if (moduleName && schemaCode && schema) {
            registry[moduleName] = {};
            registry[moduleName][schemaCode] = schema;
        }
        return registry;
    },

    /**
     * Creates a router registry for governed merge preview.
     *
     * @param {string} moduleName Owning module.
     * @param {string} groupName Router group.
     * @param {string} routeCode Route code.
     * @param {Object} route Route definition.
     * @returns {Object} Router registry.
     */
    createRouterRegistry: function (moduleName, groupName, routeCode, route) {
        let registry = {};
        if (moduleName && groupName && routeCode && route) {
            registry[moduleName] = {};
            registry[moduleName][groupName] = {};
            registry[moduleName][groupName][routeCode] = route;
        }
        return registry;
    },

    /**
     * Collects schema preview warnings.
     *
     * @param {Object} previousSnapshot Current schema.
     * @param {Object} configuration Proposed schema.
     * @param {Object} nextSnapshot Effective schema after merge.
     * @returns {string[]} Warning messages.
     */
    collectSchemaWarnings: function (previousSnapshot, configuration, nextSnapshot) {
        let warnings = [];
        let override = configuration.$override || {};
        if (override.mode === 'replace') {
            warnings.push('schema will be replaced');
        }
        (override.removeProperties || []).forEach(propertyName => {
            warnings.push('schema property will be removed: ' + propertyName);
        });
        let previousDefinition = previousSnapshot && previousSnapshot.definition ? previousSnapshot.definition : {};
        let nextDefinition = nextSnapshot && nextSnapshot.definition ? nextSnapshot.definition : {};
        Object.keys(previousDefinition).forEach(propertyName => {
            if (!nextDefinition[propertyName]) {
                warnings.push('schema property missing after preview: ' + propertyName);
            } else if (previousDefinition[propertyName].type &&
                nextDefinition[propertyName].type &&
                previousDefinition[propertyName].type !== nextDefinition[propertyName].type) {
                warnings.push('schema property type will change: ' + propertyName);
            } else if (previousDefinition[propertyName].required !== nextDefinition[propertyName].required) {
                warnings.push('schema property required flag will change: ' + propertyName);
            }
        });
        return warnings;
    },

    /**
     * Collects router preview warnings.
     *
     * @param {Object} previousSnapshot Current route.
     * @param {Object} configuration Proposed route.
     * @param {Object} nextSnapshot Effective route after merge.
     * @returns {string[]} Warning messages.
     */
    collectRouterWarnings: function (previousSnapshot, configuration, nextSnapshot) {
        let warnings = [];
        let override = configuration.$override || {};
        if (override.mode === 'replace') {
            warnings.push('route will be replaced');
        }
        if (!previousSnapshot || !nextSnapshot) {
            return warnings;
        }
        ['key', 'method', 'controller', 'operation', 'secured'].forEach(propertyName => {
            if (previousSnapshot[propertyName] !== undefined &&
                nextSnapshot[propertyName] !== undefined &&
                !_.isEqual(previousSnapshot[propertyName], nextSnapshot[propertyName])) {
                warnings.push('route ' + propertyName + ' will change');
            }
        });
        if (previousSnapshot.accessGroups !== undefined &&
            nextSnapshot.accessGroups !== undefined &&
            !_.isEqual(previousSnapshot.accessGroups, nextSnapshot.accessGroups)) {
            warnings.push('route accessGroups will change');
        }
        return warnings;
    },

    /**
     * Collects schema access-policy preview warnings.
     *
     * @param {Object} previousSnapshot Current policy.
     * @param {Object} nextSnapshot Proposed policy.
     * @returns {string[]} Warning messages.
     */
    collectSchemaAccessPolicyWarnings: function (previousSnapshot, nextSnapshot) {
        let warnings = [];
        if (!previousSnapshot) {
            return warnings;
        }
        ['effect', 'status', 'moduleName', 'schemaName', 'propertyName'].forEach(propertyName => {
            if (!_.isEqual(previousSnapshot[propertyName], nextSnapshot[propertyName])) {
                warnings.push('schema access policy ' + propertyName + ' will change');
            }
        });
        ['actions', 'userGroups', 'appliesToTenants'].forEach(propertyName => {
            if (!_.isEqual(previousSnapshot[propertyName] || [], nextSnapshot[propertyName] || [])) {
                warnings.push('schema access policy ' + propertyName + ' will change');
            }
        });
        return warnings;
    },

    /**
     * Collects schema-generated artifacts that may be affected by activation.
     *
     * @param {string} schemaCode Schema code.
     * @param {Object} schema Effective schema.
     * @returns {Object[]} Affected artifact descriptors.
     */
    collectSchemaAffectedArtifacts: function (schemaCode, schema) {
        let artifacts = [{
            type: 'schema',
            code: schemaCode
        }];
        if (schema && schema.model) {
            artifacts.push({
                type: 'model',
                code: schemaCode
            });
        }
        if (schema && schema.service && schema.service.enabled !== false) {
            artifacts.push({
                type: 'service',
                code: schemaCode
            });
        }
        if (schema && schema.router && schema.router.enabled !== false) {
            artifacts.push({
                type: 'router',
                code: schemaCode
            });
        }
        return artifacts;
    },

    /**
     * Collects router artifacts affected by activation.
     *
     * @param {string} routeCode Route code.
     * @param {Object} route Effective route.
     * @returns {Object[]} Affected artifact descriptors.
     */
    collectRouterAffectedArtifacts: function (routeCode, route) {
        return [{
            type: 'router',
            code: routeCode,
            key: route && route.key,
            method: route && route.method,
            controller: route && route.controller,
            operation: route && route.operation
        }];
    },

    /**
     * Collects artifacts affected by schema access-policy activation.
     *
     * @param {Object} policy Effective policy.
     * @returns {Object[]} Affected artifact descriptors.
     */
    collectSchemaAccessPolicyAffectedArtifacts: function (policy) {
        return [{
            type: 'schemaAccessPolicy',
            code: policy && policy.code,
            moduleName: policy && policy.moduleName,
            schemaName: policy && policy.schemaName,
            propertyName: policy && policy.propertyName
        }];
    },

    /**
     * Determines if the preview contains destructive or potentially breaking changes.
     *
     * @param {Object} previousSnapshot Current snapshot.
     * @param {Object} nextSnapshot Effective next snapshot.
     * @param {string[]} warnings Preview warnings.
     * @returns {boolean} True when destructive changes are present.
     */
    hasDestructiveChange: function (previousSnapshot, nextSnapshot, warnings) {
        return !!previousSnapshot && (!nextSnapshot || (warnings || []).length > 0);
    },

    /**
     * Collects changed object paths between two snapshots.
     *
     * @param {Object} previousSnapshot Previous snapshot.
     * @param {Object} nextSnapshot Next snapshot.
     * @param {string} [prefix] Path prefix.
     * @returns {string[]} Changed paths.
     */
    collectChangedPaths: function (previousSnapshot, nextSnapshot, prefix) {
        let changedPaths = [];
        let keys = _.uniq(Object.keys(previousSnapshot || {}).concat(Object.keys(nextSnapshot || {})));
        keys.forEach(key => {
            let path = prefix ? prefix + '.' + key : key;
            let previousValue = previousSnapshot ? previousSnapshot[key] : undefined;
            let nextValue = nextSnapshot ? nextSnapshot[key] : undefined;
            if (_.isPlainObject(previousValue) && _.isPlainObject(nextValue)) {
                changedPaths = changedPaths.concat(this.collectChangedPaths(previousValue, nextValue, path));
            } else if (!_.isEqual(previousValue, nextValue)) {
                changedPaths.push(path);
            }
        });
        return changedPaths;
    },

    /**
     * Resolves the generated runtime configuration service for a type.
     *
     * @param {string} configurationType Runtime configuration type.
     * @returns {Object|undefined} Generated runtime service.
     */
    getRuntimeConfigurationService: function (configurationType) {
        if (configurationType === 'schemaConfiguration') {
            return SERVICE.DefaultSchemaConfigurationService;
        }
        if (configurationType === 'routerConfiguration') {
            return SERVICE.DefaultRouterConfigurationService;
        }
        if (configurationType === 'schemaAccessPolicy') {
            return SERVICE.DefaultSchemaAccessPolicyService;
        }
        return undefined;
    },

    /**
     * Returns preview payload from body, query, or direct request fields.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Preview payload.
     */
    getPreviewPayload: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return _.merge({}, request.preview || {}, query, body);
    },

    /**
     * Resolves tenant used for preview reads.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getPreviewTenant: function (request) {
        return request.tenant || CONFIG.get('defaultTenant') || 'default';
    }
};
