/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const props = require('../../config/properties');
const logger = require('./DefaultLoggerService');
const enumService = require('./defaultEnumService');
const fileLoader = require('./defaultFilesLoaderService');
const classesLoader = require('./defaultClassesHandlerService');
const utils = require('../utils/utils');

/**
 * @module config/service/DefaultFrameworkInitializerService
 * @description Core Nodics startup coordinator. It resolves the active module hierarchy,
 * validates environment/server/node topology, loads layered configuration, initializes
 * global registries, loads services/pipelines/facades/controllers, and executes entity
 * lifecycle hooks in module index order.
 * @layer service
 * @owner nConfig
 * @override Project modules should not normally replace this service wholesale; instead
 * they should contribute module metadata, properties, pre/post scripts, services, pipelines,
 * facades, and controllers through the active module hierarchy. If replacement is required,
 * preserve ordering, validation, and registry contracts documented here.
 *
 * @property {Object} CONFIG Global layered configuration registry.
 * @property {Object} NODICS Global runtime registry for module metadata, active modules, paths, and indexed modules.
 * @property {Object} SERVICE Dynamic service registry loaded from active modules.
 * @property {Object} PIPELINE Dynamic pipeline definition registry loaded from active modules.
 * @property {Object} FACADE Dynamic facade registry loaded from active modules.
 * @property {Object} CONTROLLER Dynamic controller registry loaded from active modules.
 * @property {Object} CLASSES Dynamic class registry loaded from active modules.
 * @property {Object} ENUMS Dynamic enum registry loaded from active modules.
 * @property {Object} TEST Dynamic test registry separated into environment and universal test pools.
 */
module.exports = {
    /**
     * Initializes the framework initializer service.
     *
     * @param {Object} options Startup options supplied by the Nodics launcher.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the framework initializer service after entity loading.
     *
     * @param {Object} options Startup options supplied by the Nodics launcher.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Sorts dotted module indexes numerically while preserving hierarchy semantics.
     *
     * @param {string[]} rawData Module index values such as `1.11` or `1000.10.1`.
     * @returns {string[]} Sorted module indexes.
     */
    sortModules: function (rawData) {
        let indexedData = rawData.map(a => a.split('.').map(n => +n + 100000).join('.')).sort()
            .map(a => a.split('.').map(n => +n - 100000).join('.'));
        return indexedData;
    },

    /**
     * Logs resolved Nodics paths and active module load sequence.
     *
     * @returns {void}
     * @sideEffects Logs runtime paths, sets `NODICS.activeModules`, and exits on missing runtime registry.
     */
    printInfo: function () {
        if (!NODICS) {
            this.LOG.error("System initialization error: options cannot be null or empty");
            process.exit(1);
        }
        this.LOG.info('###   Initializing Nodics, Node based enterprise application solution   ###');
        this.LOG.info('---------------------------------------------------------------------------');
        this.LOG.info('NODICS_HOME   : ' + NODICS.getNodicsHome());
        this.LOG.info('NODICS_ENV    : ' + NODICS.getEnvironmentPath());
        this.LOG.info('SERVER_ROOT   : ' + NODICS.getServerRootPath());
        this.LOG.info('SERVER        : ' + NODICS.getServerPath());
        if (NODICS.getNodePath()) {
            this.LOG.info('NODE     : ' + NODICS.getNodePath());
        }
        this.LOG.info('LOG_PATH      : ' + NODICS.getServerPath() + '/temp/logs');
        this.LOG.info('---------------------------------------------------------------------------\n');
        this.LOG.info('###   Sequence in which modules have been loaded (Top to Bottom)   ###\n');
        let counter = 1;
        let activeModules = [];
        let maxLength = 30;
        let space = ' ';
        NODICS.getIndexedModules().forEach((obj, key) => {
            let spaces = maxLength - obj.name.length;
            this.LOG.info('  ' + (counter < 10 ? '0' + counter : counter) + '  ' + obj.name + space.repeat(spaces) + ' : ' + key);
            activeModules.push(obj.name);
            counter++;
        });
        console.log();
        NODICS.setActiveModules(activeModules);
    },

    /**
     * Resets global runtime registries and validates the initial activation configuration.
     *
     * @returns {void}
     * @sideEffects Reinitializes global `CLASSES`, `ENUMS`, `UTILS`, `SERVICE`, `PIPELINE`, `FACADE`, `CONTROLLER`, and `TEST`.
     * @throws Propagates invalid activation configuration errors.
     */
    prepareOptions: function () {
        NODICS.setActiveModules(this.getActiveModules());
        this.validateModuleActivationConfiguration();
        CONFIG.setProperties({});
        global.CLASSES = {};
        global.ENUMS = {};
        global.UTILS = {};
        global.SERVICE = {};
        global.PIPELINE = {};
        global.FACADE = {};
        global.CONTROLLER = {};
        global.TEST = {
            nTestPool: {
                data: {
                    // Test cases that must execute in a specific environment.
                },
                suites: {
                    // Best use case could be testing all created pages.
                }
            },
            uTestPool: {
                data: {
                    // This pool for all test cases
                },
                suites: {
                    // This pool for all test cases
                }
            }
        };
    },

    /**
     * Returns the documented precedence for configuration loading.
     *
     * @returns {string[]} Human-readable configuration load order.
     */
    getConfigurationLoadOrder: function () {
        return [
            'gFramework/nConfig/config/properties.js',
            'active module /config/properties.js files in module index order',
            'externalPropertyFile entries',
            'tenant properties loaded from active enterprise tenant records',
            'runtime persisted configuration records'
        ];
    },

    /**
     * Logs configuration and environment/server/node load precedence.
     *
     * @returns {void}
     * @sideEffects Writes startup contract information to the logger.
     */
    printConfigurationLoadOrder: function () {
        this.LOG.info('###   Configuration loading contract   ###');
        this.getConfigurationLoadOrder().forEach((entry, index) => {
            this.LOG.info('  ' + (index + 1) + '. ' + entry);
        });
        this.LOG.info('###   Environment/server/node configuration precedence   ###');
        this.getServerConfigurationLoadOrder().forEach((entry, index) => {
            this.LOG.info('  ' + (index + 1) + '. ' + entry);
        });
    },

    /**
     * Returns the environment/server/node properties file precedence for the selected runtime.
     *
     * @returns {string[]} Human-readable file descriptions containing resolved file paths.
     */
    getServerConfigurationLoadOrder: function () {
        return [
            'environment config: ' + NODICS.getEnvironmentPath() + '/config/properties.js',
            'server-root config: ' + NODICS.getServerRootPath() + '/config/properties.js',
            'server config: ' + NODICS.getServerPath() + '/config/properties.js',
            NODICS.getNodePath() ? 'node config: ' + NODICS.getNodePath() + '/config/properties.js' : null
        ].filter(Boolean);
    },

    /**
     * Loads and merges environment, server-root, server, and optional node properties.
     *
     * @returns {Object} Merged server properties for startup resolution.
     * @sideEffects Requires discovered property files into Node module cache.
     */
    loadServerProperties: function () {
        let serverProperties = {};
        this.getServerConfigurationLoadOrder().forEach(fileDescription => {
            let filePath = fileDescription.substring(fileDescription.indexOf(': ') + 2);
            if (fs.existsSync(filePath)) {
                serverProperties = _.merge(serverProperties, require(filePath));
            }
        });
        return serverProperties;
    },

    /**
     * Returns active module groups with the framework group always first.
     *
     * @param {Object} serverProperties Merged selected-runtime properties.
     * @returns {string[]} Configured active module groups.
     */
    getConfiguredActiveModuleGroups: function (serverProperties) {
        return ['gFramework'].concat(serverProperties.activeModules ? serverProperties.activeModules.groups || [] : []);
    },

    /**
     * Returns configured active modules plus the selected node without mutating configuration.
     *
     * @param {Object} serverProperties Merged selected-runtime properties.
     * @returns {string[]} Configured active module names.
     */
    getConfiguredActiveModuleNames: function (serverProperties) {
        let configuredModules = [].concat(serverProperties.activeModules ? serverProperties.activeModules.modules || [] : []);
        if (NODICS.getNodePath() && !configuredModules.includes(NODICS.getNodeName())) {
            configuredModules.push(NODICS.getNodeName());
        }
        return configuredModules;
    },

    /**
     * Returns module endpoint names declared under `server.*` configuration.
     *
     * Endpoint coordinates describe where a module can be reached. They do not
     * activate that module locally; local activation remains owned by `activeModules`.
     *
     * @param {Object} serverProperties Merged selected-runtime properties.
     * @returns {string[]} Configured module endpoint names, excluding framework control keys.
     */
    getConfiguredServerEndpointNames: function (serverProperties) {
        return Object.keys(serverProperties.server || {}).filter(moduleName => {
            return moduleName !== 'default' && moduleName !== 'options';
        });
    },

    /**
     * Returns configured endpoint names for modules that are not active in this process.
     *
     * @param {Object} serverProperties Merged selected-runtime properties.
     * @returns {string[]} Remote module endpoint names.
     */
    getConfiguredRemoteModuleNames: function (serverProperties) {
        return this.getConfiguredServerEndpointNames(serverProperties).filter(moduleName => {
            return !NODICS.isModuleActive(moduleName);
        });
    },

    /**
     * Returns the selected runtime topology sequence in parent-to-child order.
     *
     * The sequence is derived from startup selection and parent relationships:
     * environment group -> environment/server-root -> server -> optional node.
     *
     * @returns {string[]} Selected runtime module names.
     */
    getSelectedRuntimeModuleNames: function () {
        return [
            NODICS.getEnvironmentName(),
            NODICS.getServerRootName(),
            NODICS.getServerName(),
            NODICS.getNodeName()
        ].filter(Boolean);
    },

    /**
     * Resolves active modules from gFramework, configured groups/modules, selected node, parents, and dependencies.
     *
     * @returns {string[]} Active module names that should participate in startup.
     * @sideEffects Creates an early logger using merged base/server log configuration.
     */
    getActiveModules: function () {
        try {
            let modules = [];
            let serverProperties = this.loadServerProperties();
            let prop = _.merge({}, props, serverProperties);
            this.LOG = logger.createLogger('DefaultModuleInitializerService', prop.log);
            let moduleGroups = this.getConfiguredActiveModuleGroups(serverProperties);
            moduleGroups.forEach((groupName) => {
                utils.prepareActiveModuleList(prop, groupName, modules);
            });
            this.getConfiguredActiveModuleNames(serverProperties).forEach(moduleName => {
                if (!modules.includes(moduleName)) {
                    modules.push(moduleName);
                }
            });
            modules.forEach(moduleName => {
                this.resolveModuleHierarchy(moduleName);
            });
            let dependantModules = [];
            modules.forEach(moduleName => {
                this.resolveSubDependency(moduleName, dependantModules);
                this.resolveParentDependency(moduleName, dependantModules);
            });
            dependantModules.forEach(moduleName => {
                if (!modules.includes(moduleName)) modules.push(moduleName);
            });
            return modules;
        } catch (error) {
            console.error('While preparing active module list : ', error);
        }
    },

    /**
     * Raises a standardized configuration validation failure.
     *
     * @param {string} message Validation failure detail.
     * @returns {never}
     * @throws {Error} Always throws invalid Nodics configuration error.
     */
    failConfiguration: function (message) {
        throw new Error('Invalid Nodics configuration: ' + message);
    },

    /**
     * Validates that a configuration property is an array.
     *
     * @param {*} value Configuration value.
     * @param {string} propertyPath Human-readable property path.
     * @returns {void}
     * @throws Invalid configuration error when the value is not an array.
     */
    validateArrayProperty: function (value, propertyPath) {
        if (!Array.isArray(value)) {
            this.failConfiguration(propertyPath + ' must be an array');
        }
    },

    /**
     * Validates that a module reference exists in raw module metadata.
     *
     * @param {string} moduleName Referenced module name.
     * @param {string} source Configuration source for diagnostics.
     * @returns {void}
     * @throws Invalid configuration error when the module cannot be resolved.
     */
    validateModuleReference: function (moduleName, source) {
        if (!moduleName || !NODICS.getRawModule(moduleName)) {
            this.failConfiguration(source + ' references unknown module: ' + moduleName);
        }
    },

    /**
     * Returns the standardized Nodics module metadata block for a runtime module.
     *
     * @param {Object} moduleObject Raw module object from the Nodics registry.
     * @returns {Object} Nodics metadata from package.json.
     */
    getModuleNodicsMetadata: function (moduleObject) {
        return utils.getNodicsMetadata(moduleObject && moduleObject.metaData);
    },

    /**
     * Validates the finalized module metadata contract.
     *
     * @param {Object} moduleObject Raw module object from the Nodics registry.
     * @returns {void}
     * @throws Invalid configuration error when legacy or incomplete metadata is found.
     */
    validateModuleMetadataContract: function (moduleObject) {
        if (!moduleObject || !moduleObject.metaData) {
            this.failConfiguration('runtime module metadata is missing');
        }
        let moduleName = moduleObject.name || moduleObject.metaData.name;
        let nodics = this.getModuleNodicsMetadata(moduleObject);
        if (moduleObject.metaData.type) {
            this.failConfiguration(moduleName + ' must not use package.json.type for Nodics module classification; use package.json.nodics.kind');
        }
        if (nodics.moduleType) {
            this.failConfiguration(moduleName + ' must not use package.json.nodics.moduleType; use package.json.nodics.kind');
        }
        if (!nodics.kind) {
            this.failConfiguration(moduleName + ' must define package.json.nodics.kind');
        }
        if (!nodics.runtime || typeof nodics.runtime !== 'object') {
            this.failConfiguration(moduleName + ' must define package.json.nodics.runtime');
        }
        ['router', 'publish', 'web'].forEach(flag => {
            if (typeof nodics.runtime[flag] !== 'boolean') {
                this.failConfiguration(moduleName + ' nodics.runtime.' + flag + ' must be a boolean');
            }
        });
        if (!Array.isArray(nodics.owns)) {
            this.failConfiguration(moduleName + ' must define package.json.nodics.owns as an array');
        }
    },

    /**
     * Validates metadata for all raw runtime modules.
     *
     * @returns {void}
     * @throws Invalid configuration error for stale or incomplete metadata.
     */
    validateRuntimeModuleMetadata: function () {
        _.each(NODICS.getRawModules(), moduleObject => {
            this.validateModuleMetadataContract(moduleObject);
        });
    },

    /**
     * Validates that a runtime module has the expected Nodics kind.
     *
     * @param {string} moduleName Module name to validate.
     * @param {string|string[]} expectedKind Allowed kind or kinds.
     * @param {string} source Diagnostic source.
     * @returns {void}
     * @throws Invalid configuration error when the module has a different kind.
     */
    validateModuleKind: function (moduleName, expectedKind, source) {
        this.validateModuleReference(moduleName, source);
        let moduleObject = NODICS.getRawModule(moduleName);
        let kind = this.getModuleNodicsMetadata(moduleObject).kind;
        let allowedKinds = Array.isArray(expectedKind) ? expectedKind : [expectedKind];
        if (!allowedKinds.includes(kind)) {
            this.failConfiguration(source + ' module ' + moduleName + ' must have nodics.kind ' + allowedKinds.join(' or ') + ', found: ' + kind);
        }
    },

    /**
     * Validates selected environment group, environment, server, and optional node kinds.
     *
     * @returns {void}
     * @throws Invalid configuration error when selected runtime modules do not match the topology contract.
     */
    validateSelectedRuntimeKinds: function () {
        this.validateModuleKind(NODICS.getEnvironmentName(), 'group', 'selected environment group');
        this.validateModuleKind(NODICS.getServerRootName(), ['group', 'environment'], 'selected environment');
        this.validateModuleKind(NODICS.getServerName(), 'server', 'selected server');
        if (NODICS.getNodeName()) {
            this.validateModuleKind(NODICS.getNodeName(), 'node', 'selected node');
        }
    },

    /**
     * Validates that selected runtime hierarchy modules provide their configuration files.
     *
     * @returns {void}
     * @throws Invalid configuration error when a selected runtime config file is missing.
     */
    validateSelectedRuntimeConfigurationFiles: function () {
        [
            { label: 'environment group', path: NODICS.getEnvironmentPath() },
            { label: 'environment', path: NODICS.getServerRootPath() },
            { label: 'server', path: NODICS.getServerPath() },
            NODICS.getNodePath() ? { label: 'node', path: NODICS.getNodePath() } : null
        ].filter(Boolean).forEach(entry => {
            let propertiesFile = entry.path + '/config/properties.js';
            if (!fs.existsSync(propertiesFile)) {
                this.failConfiguration('selected ' + entry.label + ' must provide config/properties.js: ' + propertiesFile);
            }
        });
    },

    /**
     * Validates required module dependencies for active modules.
     *
     * @returns {void}
     * @throws Invalid configuration error when dependencies are missing, inactive, or load after the dependent module.
     */
    validateRequiredModuleDependencies: function () {
        NODICS.getActiveModules().forEach(moduleName => {
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleKind = this.getModuleNodicsMetadata(moduleObject).kind;
            let requiredModules = moduleObject.metaData.requiredModules || [];
            this.validateArrayProperty(requiredModules, moduleName + '.requiredModules');
            requiredModules.forEach(requiredModuleName => {
                this.validateModuleReference(requiredModuleName, moduleName + '.requiredModules');
                if (moduleKind !== 'group' && !NODICS.isModuleActive(requiredModuleName)) {
                    this.failConfiguration(moduleName + ' requires inactive module: ' + requiredModuleName);
                }
                this.validateModuleIndexOrder(NODICS.getRawModule(requiredModuleName), moduleObject, moduleName + ' requiredModules');
            });
        });
    },

    /**
     * Validates server topology smoke-test configuration when a project defines it.
     *
     * @param {Object} serverProperties Merged server properties.
     * @returns {void}
     * @throws Invalid configuration error for missing servers, invalid kinds, duplicate entries, or bad communication checks.
     */
    validateRuntimeTopologyConfiguration: function (serverProperties) {
        let runtimeTopology = _.get(serverProperties, 'test.runtimeTopology');
        if (!runtimeTopology) {
            return;
        }
        if (!runtimeTopology.consolidatedServer) {
            this.failConfiguration('test.runtimeTopology.consolidatedServer must be defined');
        }
        this.validateModuleKind(runtimeTopology.consolidatedServer, 'server', 'test.runtimeTopology.consolidatedServer');
        this.validateArrayProperty(runtimeTopology.modularServers, 'test.runtimeTopology.modularServers');
        if (runtimeTopology.modularServers.length === 0) {
            this.failConfiguration('test.runtimeTopology.modularServers must define at least one server');
        }
        let seenServers = {};
        runtimeTopology.modularServers.forEach(serverName => {
            if (seenServers[serverName]) {
                this.failConfiguration('test.runtimeTopology.modularServers contains duplicate server: ' + serverName);
            }
            seenServers[serverName] = true;
            this.validateModuleKind(serverName, 'server', 'test.runtimeTopology.modularServers');
            let serverModule = NODICS.getRawModule(serverName);
            this.validateModuleKind(serverModule.parent, ['group', 'environment'], 'test.runtimeTopology.modularServers parent');
            let propertiesFile = serverModule.path + '/config/properties.js';
            if (!fs.existsSync(propertiesFile)) {
                this.failConfiguration('test.runtimeTopology server must provide config/properties.js: ' + serverName);
            }
        });
        let communicationChecks = runtimeTopology.communicationChecks || [];
        this.validateArrayProperty(communicationChecks, 'test.runtimeTopology.communicationChecks');
        communicationChecks.forEach((check, index) => {
            if (!check.server || !seenServers[check.server]) {
                this.failConfiguration('test.runtimeTopology.communicationChecks[' + index + '].server must reference a modular server');
            }
            this.validateModuleReference(check.moduleName, 'test.runtimeTopology.communicationChecks[' + index + '].moduleName');
            if (!check.path || typeof check.path !== 'string') {
                this.failConfiguration('test.runtimeTopology.communicationChecks[' + index + '].path must be defined');
            }
        });
    },

    /**
     * Validates configured module groups, modules, and resolved active module references.
     *
     * @param {Object} serverProperties Merged server properties.
     * @returns {void}
     * @sideEffects Normalizes missing `activeModules.groups` and `activeModules.modules` to arrays.
     * @throws Invalid configuration error for missing or unknown module references.
     */
    validateConfiguredModules: function (serverProperties) {
        if (!serverProperties.activeModules) {
            this.failConfiguration('activeModules must be defined for server: ' + NODICS.getServerName());
        }
        serverProperties.activeModules.groups = serverProperties.activeModules.groups || [];
        serverProperties.activeModules.modules = serverProperties.activeModules.modules || [];
        this.validateArrayProperty(serverProperties.activeModules.groups, 'activeModules.groups');
        this.validateArrayProperty(serverProperties.activeModules.modules, 'activeModules.modules');
        ['gFramework'].concat(serverProperties.activeModules.groups).forEach(groupName => {
            let moduleName = groupName;
            if (moduleName && moduleName.indexOf(':') > 0) {
                moduleName = moduleName.substring(0, moduleName.indexOf(':'));
            }
            this.validateModuleReference(moduleName, 'activeModules.groups');
        });
        serverProperties.activeModules.modules.forEach(moduleName => {
            this.validateModuleReference(moduleName, 'activeModules.modules');
        });
        NODICS.getActiveModules().forEach(moduleName => {
            this.validateModuleReference(moduleName, 'resolved activeModules');
        });
    },

    /**
     * Validates that raw module indexes are unique.
     *
     * @returns {void}
     * @throws Invalid configuration error when two modules share the same index.
     */
    validateRawModuleIndexes: function () {
        let indexes = {};
        _.each(NODICS.getRawModules(), moduleObject => {
            if (indexes[moduleObject.index]) {
                this.failConfiguration('duplicate module index ' + moduleObject.index + ' for modules ' + indexes[moduleObject.index] + ' and ' + moduleObject.name);
            }
            indexes[moduleObject.index] = moduleObject.name;
        });
    },

    /**
     * Checks whether one module index sorts before another.
     *
     * @param {Object} parentModule Parent or earlier module metadata.
     * @param {Object} childModule Child or later module metadata.
     * @returns {boolean} True when parent index loads before child index.
     */
    isModuleIndexBefore: function (parentModule, childModule) {
        return this.sortModules([parentModule.index, childModule.index])[0] === parentModule.index;
    },

    /**
     * Validates index ordering for a parent/child or dependency relation.
     *
     * @param {Object} parentModule Expected earlier module metadata.
     * @param {Object} childModule Expected later module metadata.
     * @param {string} relation Human-readable relation name.
     * @returns {void}
     * @throws Invalid configuration error when module indexes violate load order.
     */
    validateModuleIndexOrder: function (parentModule, childModule, relation) {
        if (!this.isModuleIndexBefore(parentModule, childModule)) {
            this.failConfiguration(relation + ' index order is invalid: ' + parentModule.name + ' (' + parentModule.index + ') must load before ' + childModule.name + ' (' + childModule.index + ')');
        }
    },

    /**
     * Validates selected server-root, server, and optional node hierarchy.
     *
     * @returns {void}
     * @throws Invalid configuration error when selected runtime modules are unknown, inactive, incorrectly parented, or mis-indexed.
     */
    validateSelectedRuntimeHierarchy: function () {
        let environmentName = NODICS.getEnvironmentName();
        let serverName = NODICS.getServerName();
        let serverRootName = NODICS.getServerRootName();
        let environmentModule = NODICS.getRawModule(environmentName);
        let serverModule = NODICS.getRawModule(serverName);
        let serverRootModule = NODICS.getRawModule(serverRootName);
        if (!environmentModule) {
            this.failConfiguration('selected environment group module is not valid: ' + environmentName);
        }
        if (!serverModule) {
            this.failConfiguration('selected server module is not valid: ' + serverName);
        }
        if (!serverRootModule) {
            this.failConfiguration('selected server root module is not valid for server ' + serverName + ': ' + serverRootName);
        }
        if (serverRootModule.parent !== environmentName) {
            this.failConfiguration('selected server root ' + serverRootName + ' must be a child of environment group ' + environmentName);
        }
        if (serverModule.parent !== serverRootName) {
            this.failConfiguration('selected server ' + serverName + ' must be a child of server root ' + serverRootName);
        }
        if (!NODICS.isModuleActive(serverRootName)) {
            this.failConfiguration('selected server root module must be active before server startup: ' + serverRootName);
        }
        if (!NODICS.isModuleActive(serverName)) {
            this.failConfiguration('selected server module must be active for startup: ' + serverName);
        }
        this.validateModuleIndexOrder(serverRootModule, serverModule, 'server root to server');
        if (NODICS.getNodeName()) {
            let nodeModule = NODICS.getRawModule(NODICS.getNodeName());
            if (!nodeModule) {
                this.failConfiguration('selected node module is not valid: ' + NODICS.getNodeName());
            }
            if (nodeModule.parent !== serverName) {
                this.failConfiguration('selected node ' + NODICS.getNodeName() + ' must be a child of selected server ' + serverName);
            }
            if (!NODICS.isModuleActive(NODICS.getNodeName())) {
                this.failConfiguration('selected node module must be active for startup: ' + NODICS.getNodeName());
            }
            this.validateModuleIndexOrder(serverModule, nodeModule, 'server to node');
        }
    },

    /**
     * Validates a server or module server configuration block.
     *
     * @param {string} moduleName Module name under `server` configuration.
     * @param {Object} moduleConfig Server configuration for the module.
     * @returns {void}
     * @throws Invalid configuration error when host, port, or node endpoint details are missing.
     */
    validateServerDefinition: function (moduleName, moduleConfig) {
        if (!moduleConfig || !moduleConfig.server) {
            this.failConfiguration('server.' + moduleName + '.server must be defined');
        }
        if (!moduleConfig.server.httpHost || !moduleConfig.server.httpPort) {
            this.failConfiguration('server.' + moduleName + '.server requires httpHost and httpPort');
        }
        if (moduleConfig.nodes && !utils.isBlank(moduleConfig.nodes)) {
            _.each(moduleConfig.nodes, (nodeConfig, nodeName) => {
                if (!nodeConfig.httpHost || !nodeConfig.httpPort) {
                    this.failConfiguration('server.' + moduleName + '.nodes.' + nodeName + ' requires httpHost and httpPort');
                }
            });
        }
    },

    /**
     * Validates the complete `server` configuration object.
     *
     * @param {Object} serverProperties Merged server properties.
     * @returns {void}
     * @throws Invalid configuration error when default or module server definitions are invalid.
     */
    validateServerConfiguration: function (serverProperties) {
        if (!serverProperties.server || !serverProperties.server.default) {
            this.failConfiguration('server.default must be defined for server: ' + NODICS.getServerName());
        }
        _.each(serverProperties.server, (moduleConfig, moduleName) => {
            if (moduleName !== 'options') {
                this.validateServerDefinition(moduleName, moduleConfig);
            }
        });
    },

    /**
     * Validates selected node configuration when Nodics starts a node-specific runtime.
     *
     * @param {Object} serverProperties Merged server properties.
     * @returns {void}
     * @throws Invalid configuration error when selected node does not belong to the selected server or lacks node config.
     */
    validateNodeConfiguration: function (serverProperties) {
        if (!NODICS.getNodeName()) {
            return;
        }
        let nodeModule = NODICS.getRawModule(NODICS.getNodeName());
        if (!nodeModule) {
            this.failConfiguration('unknown node module: ' + NODICS.getNodeName());
        }
        if (nodeModule.parent !== NODICS.getServerName()) {
            this.failConfiguration('node ' + NODICS.getNodeName() + ' does not belong to server ' + NODICS.getServerName());
        }
        let nodeId = serverProperties.nodeId || props.nodeId;
        if (!serverProperties.server.default.nodes || !serverProperties.server.default.nodes[nodeId]) {
            this.failConfiguration('server.default.nodes must define nodeId: ' + nodeId);
        }
    },

    /**
     * Validates profile module access for modular deployments.
     *
     * Profile may be local or remote. When not active locally, its server endpoint must
     * be configured because other modules may require profile services for auth/tenant data.
     *
     * @param {Object} serverProperties Merged server properties.
     * @returns {void}
     * @throws Invalid configuration error when remote profile server details are missing.
     */
    validateModularProfileConfiguration: function (serverProperties) {
        let profileModuleName = props.profileModuleName || 'profile';
        if (!NODICS.isModuleActive(profileModuleName)) {
            if (!this.getConfiguredRemoteModuleNames(serverProperties).includes(profileModuleName)) {
                this.failConfiguration('server.' + profileModuleName + ' must be defined when profile module is not active locally');
            }
            this.validateServerDefinition(profileModuleName, serverProperties.server[profileModuleName]);
        }
    },

    /**
     * Runs full resolved configuration validation after CONFIG has been loaded.
     *
     * @returns {void}
     * @throws Invalid configuration error for module, hierarchy, server, node, or modular profile problems.
     */
    validateResolvedConfiguration: function () {
        let serverProperties = CONFIG.getProperties() || this.loadServerProperties();
        this.validateRawModuleIndexes();
        this.validateRuntimeModuleMetadata();
        this.validateConfiguredModules(serverProperties);
        this.validateSelectedRuntimeHierarchy();
        this.validateSelectedRuntimeKinds();
        this.validateSelectedRuntimeConfigurationFiles();
        this.validateRequiredModuleDependencies();
        this.validateServerConfiguration(serverProperties);
        this.validateNodeConfiguration(serverProperties);
        this.validateModularProfileConfiguration(serverProperties);
        this.validateRuntimeTopologyConfiguration(serverProperties);
    },

    /**
     * Runs early activation validation before global runtime registries are reset.
     *
     * @returns {void}
     * @throws Invalid configuration error for raw indexes, active modules, or selected runtime hierarchy.
     */
    validateModuleActivationConfiguration: function () {
        let serverProperties = this.loadServerProperties();
        this.validateRawModuleIndexes();
        this.validateRuntimeModuleMetadata();
        this.validateConfiguredModules(serverProperties);
        this.validateSelectedRuntimeHierarchy();
        this.validateSelectedRuntimeKinds();
        this.validateSelectedRuntimeConfigurationFiles();
        this.validateRequiredModuleDependencies();
    },

    /**
     * Resolves active-runtime parent hierarchy for a module while respecting
     * selected environment boundary modules.
     *
     * This differs from the discovery utility resolver: active runtime expansion
     * stops before the selected environment group/application boundary so startup
     * does not accidentally activate project containers as capability modules.
     *
     * @param {string} moduleName Module to resolve.
     * @returns {string[]} Module and parent hierarchy names inside the selected runtime boundary.
     * @sideEffects Caches `parentModules` on raw module metadata.
     */
    resolveModuleHierarchy: function (moduleName) {
        let moduleObject = NODICS.getRawModule(moduleName);
        let modules = [moduleName];
        if (!moduleObject.parent) {
            return modules;
        } else if (moduleName === NODICS.getEnvironmentName() || NODICS.getEnvironmentPath().includes(moduleObject.path)) {
            return [];
        } else {
            if (!moduleObject.parentModules) {
                moduleObject.parentModules = this.resolveModuleHierarchy(moduleObject.parent);
            }
            modules = modules.concat(moduleObject.parentModules);
            return modules;
        }
    },

    /** Backward-compatible alias for legacy callers. */
    resolveModuleHiererchy: function (moduleName) {
        return this.resolveModuleHierarchy(moduleName);
    },

    /**
     * Recursively resolves required modules declared by module metadata.
     *
     * @param {string} moduleName Module whose required modules should be resolved.
     * @param {string[]} dependantModules Accumulator for dependency module names.
     * @returns {void}
     * @sideEffects Adds dependency names to `dependantModules` and exits process for invalid module metadata.
     */
    resolveSubDependency: function (moduleName, dependantModules) {
        let _self = this;
        let rawModule = NODICS.getRawModule(moduleName);
        if (!rawModule || !rawModule.metaData) {
            console.error('Invalid module name: ', moduleName);
            process.exit(1);
        } else {
            if (rawModule.metaData.requiredModules && rawModule.metaData.requiredModules.length > 0) {
                rawModule.metaData.requiredModules.forEach(nxtModuleName => {
                    if (!dependantModules.includes(nxtModuleName)) dependantModules.push(nxtModuleName);
                    _self.resolveSubDependency(nxtModuleName, dependantModules);
                });
            }
        }
    },

    /** Backward-compatible alias for legacy callers. */
    resolveSubDependancy: function (moduleName, dependantModules) {
        return this.resolveSubDependency(moduleName, dependantModules);
    },

    /**
     * Recursively resolves parent modules for an active module.
     *
     * @param {string} moduleName Module whose parent modules should be resolved.
     * @param {string[]} dependantModules Accumulator for parent module names.
     * @returns {void}
     * @sideEffects Adds parent module names to `dependantModules` and exits process for invalid module metadata.
     */
    resolveParentDependency: function (moduleName, dependantModules) {
        let _self = this;
        let rawModule = NODICS.getRawModule(moduleName);
        if (!rawModule || !rawModule.metaData) {
            console.error('Invalid module name : ', moduleName);
            process.exit(1);
        } else {
            if (rawModule.parentModules && rawModule.parentModules.length > 0) {
                rawModule.parentModules.forEach(pModuleName => {
                    if (!dependantModules.includes(pModuleName)) dependantModules.push(pModuleName);
                    _self.resolveParentDependency(pModuleName, dependantModules);
                });
            }
        }
    },

    /** Backward-compatible alias for legacy callers. */
    resolveParentDependancy: function (moduleName, dependantModules) {
        return this.resolveParentDependency(moduleName, dependantModules);
    },

    /**
     * Builds the sorted active module index map used for deterministic loading.
     *
     * @returns {void}
     * @sideEffects Writes `NODICS.indexedModules`.
     * @throws Error when two active modules share the same index.
     */
    loadModuleIndex: function () {
        let _self = this;
        let moduleIndex = {};
        let indexValue = [];
        _.each(NODICS.getRawModules(), (moduleObject, moduleName) => {
            if (NODICS.isModuleActive(moduleObject.metaData.name)) {
                indexValue.push(moduleObject.index);
                if (!moduleIndex[moduleObject.index]) {
                    moduleIndex[moduleObject.index] = {
                        index: moduleObject.index,
                        name: moduleName,
                        path: moduleObject.path,
                    };
                } else {
                    throw new Error('Module with index: ' + moduleObject.index + ' already exists: ' + moduleIndex[moduleObject.index].name);
                }
            }
        });

        let indexedValue = _self.sortModules(indexValue);
        let moduleList = new Map();
        indexedValue.forEach((key) => {
            moduleList.set(key, moduleIndex[key]);
        });
        NODICS.setIndexedModules(moduleList);
    },

    /**
     * Loads metadata for every indexed active module into the runtime module registry.
     *
     * @returns {void}
     * @sideEffects Populates `NODICS.modules` metadata entries.
     */
    loadModulesMetaData: function () {
        let _self = this;
        NODICS.getIndexedModules().forEach(function (moduleObject, index) {
            _self.loadModuleMetaData(moduleObject.name);
        });
    },

    /**
     * Loads metadata for one active module into the runtime module registry.
     *
     * @param {string} moduleName Active module name.
     * @returns {void}
     * @sideEffects Adds module metadata and path to `NODICS.modules`.
     */
    loadModuleMetaData: function (moduleName) {
        let module = NODICS.getRawModule(moduleName);
        if (module) {
            NODICS.addModule({
                metaData: module.metaData,
                modulePath: module.path
            });
        }
    },

    /**
     * Loads configuration files from all indexed active modules.
     *
     * @param {string} [fileName=/config/properties.js] Module-relative configuration file path.
     * @returns {void}
     * @sideEffects Merges discovered configuration into `CONFIG`.
     */
    loadConfigurations: function (fileName) {
        let _self = this;
        fileName = fileName || '/config/properties.js';
        NODICS.getIndexedModules().forEach(function (moduleObject, index) {
            _self.loadModuleConfiguration(moduleObject.name, fileName);
        });
    },

    /**
     * Loads one module's configuration file.
     *
     * @param {string} moduleName Active module name.
     * @param {string} fileName Module-relative configuration file path.
     * @returns {void}
     * @sideEffects Merges module configuration into `CONFIG`.
     */
    loadModuleConfiguration: function (moduleName, fileName) {
        let module = NODICS.getRawModule(moduleName);
        if (module) {
            this.loadConfiguration(module.path + fileName);
        }
    },

    /**
     * Loads a concrete configuration file if it exists.
     *
     * @param {string} filePath Absolute configuration file path.
     * @returns {void}
     * @sideEffects Requires file and merges exports into `CONFIG.properties`.
     */
    loadConfiguration: function (filePath) {
        let config = CONFIG.getProperties() || {};
        if (fs.existsSync(filePath)) {
            this.LOG.debug('Loading configuration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
            var propertyFile = require(filePath);
            CONFIG.setProperties(_.merge(config, propertyFile));
        }
    },

    /**
     * Loads external property files into default or tenant-specific configuration.
     *
     * @param {string[]} [externalFiles] Explicit property file list; defaults to `CONFIG.externalPropertyFile`.
     * @param {string} [tntCode] Tenant code for tenant-specific config merge.
     * @returns {void}
     * @sideEffects Merges external files into `CONFIG`, logs missing files.
     */
    loadExternalProperties: function (externalFiles, tntCode) {
        let _self = this;
        let files = externalFiles || CONFIG.get('externalPropertyFile');
        if (files && files.length > 0) {
            files.forEach(function (filePath) {
                if (fs.existsSync(filePath)) {
                    _self.LOG.debug('Loading configuration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    let props = tntCode ? CONFIG.getProperties(tntCode) || {} : CONFIG.getProperties() || {};
                    CONFIG.setProperties(_.merge(props, require(filePath)), tntCode);
                } else {
                    _self.LOG.warn('System cannot find configuration at : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                }
            });
        }
    },

    /**
     * Initializes shared enums and classes before module entities are loaded.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves after enum and class registries are loaded.
     * @sideEffects Populates `ENUMS` and `CLASSES`; exits process if core registries are missing.
     */
    initUtilities: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (!CONFIG || !NODICS) {
                    this.LOG.error("System initialization error: configuration initializer failure.");
                    process.exit(1);
                }
                enumService.LOG.info('Starting Enums loader process');
                enumService.loadEnums();
                classesLoader.LOG.info('Starting Classes loader process');
                classesLoader.loadClasses();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Loads all indexed active modules recursively in sorted module index order.
     *
     * @param {string[]} [modules] Module index values to load; defaults to all indexed modules.
     * @returns {Promise<boolean>} Resolves after all modules are loaded.
     * @throws Rejects when any module load fails.
     */
    loadModules: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.loadModule(moduleName).then(success => {
                    _self.loadModules(modules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });

            } else {
                resolve(true);
            }
        });
    },

    /**
     * Loads one module's nodics.js lifecycle, services, pipelines, facades, and controllers.
     *
     * @param {string} moduleName Active module name.
     * @returns {Promise<boolean>} Resolves after module runtime artifacts are loaded.
     * @sideEffects Requires module `nodics.js`, populates dynamic registries, and creates module logger.
     * @throws Rejects when module init or artifact loading fails.
     */
    loadModule: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Starting process for module : ' + moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.init) {
                moduleFile.LOG = logger.createLogger("Module-" + moduleName);
                moduleFile.init(moduleObject).then(success => {
                    _self.loadServices(moduleObject).then(() => {
                        return _self.loadPipelinesDefinition(moduleObject);
                    }).then(() => {
                        return _self.loadFacades(moduleObject);
                    }).then(() => {
                        return _self.loadControllers(moduleObject);
                    }).then(() => {
                        resolve(true);
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                _self.loadServices(moduleObject).then(() => {
                    return _self.loadPipelinesDefinition(moduleObject);
                }).then(() => {
                    return _self.loadFacades(moduleObject);
                }).then(() => {
                    return _self.loadControllers(moduleObject);
                }).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    },

    /**
     * Loads service artifacts from a module and merges with existing services by name.
     *
     * Later-loaded modules may override or extend earlier services by exporting the same
     * service name, preserving Nodics layered override behavior.
     *
     * @param {Object} module Raw module metadata containing path and name.
     * @returns {Promise<boolean>} Resolves after services are loaded.
     * @sideEffects Populates or merges entries in global `SERVICE` and assigns service loggers.
     */
    loadServices: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module services');
            let path = module.path + '/src/service';
            try {
                fileLoader.processFiles(path, "Service.js", (file) => {
                    let serviceName = UTILS.getFileNameWithoutExtension(file);
                    let artifact = require(file);
                    if (SERVICE[serviceName]) {
                        SERVICE[serviceName] = _.merge(SERVICE[serviceName], artifact);
                        fileLoader.recordArtifactContribution(SERVICE[serviceName], {
                            name: serviceName,
                            layer: 'service',
                            sourceModule: module.name,
                            action: 'override',
                            filePath: file
                        });
                    } else {
                        SERVICE[serviceName] = artifact;
                        SERVICE[serviceName].LOG = logger.createLogger(serviceName);
                        fileLoader.recordArtifactContribution(SERVICE[serviceName], {
                            name: serviceName,
                            layer: 'service',
                            sourceModule: module.name,
                            action: 'create',
                            filePath: file
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Loads pipeline definition artifacts from a module and merges with existing definitions.
     *
     * @param {Object} module Raw module metadata containing path and name.
     * @returns {Promise<boolean>} Resolves after pipeline definitions are loaded.
     * @sideEffects Populates or merges entries in global `PIPELINE`.
     */
    loadPipelinesDefinition: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module process definitions');
            let pipelinePath = module.path + '/src/pipelines';
            try {
                fileLoader.processFiles(pipelinePath, "Definition.js", (file) => {
                    let processName = UTILS.getFileNameWithoutExtension(file);
                    let artifact = require(file);
                    if (PIPELINE[processName]) {
                        PIPELINE[processName] = _.merge(PIPELINE[processName], artifact);
                        fileLoader.recordArtifactContribution(PIPELINE[processName], {
                            name: processName,
                            layer: 'pipeline',
                            sourceModule: module.name,
                            action: 'override',
                            filePath: file
                        });
                    } else {
                        PIPELINE[processName] = artifact;
                        fileLoader.recordArtifactContribution(PIPELINE[processName], {
                            name: processName,
                            layer: 'pipeline',
                            sourceModule: module.name,
                            action: 'create',
                            filePath: file
                        });
                    }
                });
                let registryPath = pipelinePath + '/pipelines.js';
                if (fs.existsSync(registryPath)) {
                    let pipelineRegistry = require(registryPath);
                    Object.keys(pipelineRegistry).forEach(processName => {
                        let artifact = pipelineRegistry[processName];
                        if (PIPELINE[processName]) {
                            PIPELINE[processName] = _.merge(PIPELINE[processName], artifact);
                            fileLoader.recordArtifactContribution(PIPELINE[processName], {
                                name: processName,
                                layer: 'pipeline',
                                sourceModule: module.name,
                                action: 'override',
                                filePath: registryPath
                            });
                        } else {
                            PIPELINE[processName] = artifact;
                            fileLoader.recordArtifactContribution(PIPELINE[processName], {
                                name: processName,
                                layer: 'pipeline',
                                sourceModule: module.name,
                                action: 'create',
                                filePath: registryPath
                            });
                        }
                    });
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Loads facade artifacts from a module and merges with existing facades by name.
     *
     * @param {Object} module Raw module metadata containing path and name.
     * @returns {Promise<boolean>} Resolves after facades are loaded.
     * @sideEffects Populates or merges entries in global `FACADE` and assigns facade loggers.
     */
    loadFacades: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module facades');
            let path = module.path + '/src/facade';
            try {
                fileLoader.processFiles(path, "Facade.js", (file) => {
                    let facadeName = UTILS.getFileNameWithoutExtension(file);
                    let artifact = require(file);
                    if (FACADE[facadeName]) {
                        FACADE[facadeName] = _.merge(FACADE[facadeName], artifact);
                        fileLoader.recordArtifactContribution(FACADE[facadeName], {
                            name: facadeName,
                            layer: 'facade',
                            sourceModule: module.name,
                            action: 'override',
                            filePath: file
                        });
                    } else {
                        FACADE[facadeName] = artifact;
                        FACADE[facadeName].LOG = logger.createLogger(facadeName);
                        fileLoader.recordArtifactContribution(FACADE[facadeName], {
                            name: facadeName,
                            layer: 'facade',
                            sourceModule: module.name,
                            action: 'create',
                            filePath: file
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Loads controller artifacts from a module and merges with existing controllers by name.
     *
     * @param {Object} module Raw module metadata containing path and name.
     * @returns {Promise<boolean>} Resolves after controllers are loaded.
     * @sideEffects Populates or merges entries in global `CONTROLLER` and assigns controller loggers.
     */
    loadControllers: function (module) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('  Loading all module controllers');
            let path = module.path + '/src/controller';
            try {
                fileLoader.processFiles(path, "Controller.js", (file) => {
                    let controllerName = UTILS.getFileNameWithoutExtension(file);
                    let artifact = require(file);
                    if (CONTROLLER[controllerName]) {
                        CONTROLLER[controllerName] = _.merge(CONTROLLER[controllerName], artifact);
                        fileLoader.recordArtifactContribution(CONTROLLER[controllerName], {
                            name: controllerName,
                            layer: 'controller',
                            sourceModule: module.name,
                            action: 'override',
                            filePath: file
                        });
                    } else {
                        CONTROLLER[controllerName] = artifact;
                        CONTROLLER[controllerName].LOG = logger.createLogger(controllerName);
                        fileLoader.recordArtifactContribution(CONTROLLER[controllerName], {
                            name: controllerName,
                            layer: 'controller',
                            sourceModule: module.name,
                            action: 'create',
                            filePath: file
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Executes entity initialization in service, facade, then controller order.
     *
     * @returns {Promise<boolean>} Resolves after all entity init hooks complete.
     * @throws Rejects when any entity init hook fails.
     */
    initEntities: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Initializing all entities');
            _self.initServices().then(() => {
                return _self.initFacades();
            }).then(() => {
                return _self.initControllers();
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    /**
     * Executes `init` hooks for all loaded services.
     *
     * @returns {Promise<boolean>} Resolves after service init hooks complete.
     * @throws Rejects when any service init hook fails.
     */
    initServices: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(SERVICE, (serviceClass, serviceName) => {
                if (serviceClass.init &&
                    typeof serviceClass.init === 'function') {
                    allPromise.push(serviceClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all Services');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Executes `init` hooks for all loaded facades.
     *
     * @returns {Promise<boolean>} Resolves after facade init hooks complete.
     * @throws Rejects when any facade init hook fails.
     */
    initFacades: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(FACADE, (facadeClass, facadeName) => {
                if (facadeClass.init &&
                    typeof facadeClass.init === 'function') {
                    allPromise.push(facadeClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all Facades');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Executes `init` hooks for all loaded controllers.
     *
     * @returns {Promise<boolean>} Resolves after controller init hooks complete.
     * @throws Rejects when any controller init hook fails.
     */
    initControllers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(CONTROLLER, (controllerClass, controllerName) => {
                if (controllerClass.init &&
                    typeof controllerClass.init === 'function') {
                    allPromise.push(controllerClass.init());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Initializing all Controllers');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Executes post-initialization in service, facade, then controller order.
     *
     * @returns {Promise<boolean>} Resolves after all entity post-init hooks complete.
     * @throws Rejects when any entity post-init hook fails.
     */
    finalizeEntities: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Finalizing all entities');
            _self.finalizeServices().then(() => {
                return _self.finalizeFacades();
            }).then(() => {
                return _self.finalizeControllers();
            }).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    /**
     * Executes `postInit` hooks for all loaded services.
     *
     * @returns {Promise<boolean>} Resolves after service post-init hooks complete.
     * @throws Rejects when any service post-init hook fails.
     */
    finalizeServices: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(SERVICE, (serviceClass, serviceName) => {
                if (serviceClass.postInit &&
                    typeof serviceClass.postInit === 'function') {
                    allPromise.push(serviceClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all Services');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Executes `postInit` hooks for all loaded facades.
     *
     * @returns {Promise<boolean>} Resolves after facade post-init hooks complete.
     * @throws Rejects when any facade post-init hook fails.
     */
    finalizeFacades: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(FACADE, (facadeClass, facadeName) => {
                if (facadeClass.postInit &&
                    typeof facadeClass.postInit === 'function') {
                    allPromise.push(facadeClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all Facades');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Executes `postInit` hooks for all loaded controllers.
     *
     * @returns {Promise<boolean>} Resolves after controller post-init hooks complete.
     * @throws Rejects when any controller post-init hook fails.
     */
    finalizeControllers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let allPromise = [];
            _.each(CONTROLLER, (controllerClass, controllerName) => {
                if (controllerClass.postInit &&
                    typeof controllerClass.postInit === 'function') {
                    allPromise.push(controllerClass.postInit());
                }
            });
            if (allPromise.length > 0) {
                _self.LOG.debug('  Finalizing all controllers');
                Promise.all(allPromise).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Finalizes all indexed active modules recursively in module index order.
     *
     * @param {string[]} [modules] Module index values to finalize; defaults to all indexed modules.
     * @returns {Promise<boolean>} Resolves after all module post-init hooks complete.
     * @throws Rejects when any module finalize hook fails.
     */
    finalizeModules: function (modules = Array.from(NODICS.getIndexedModules().keys())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleIndex = modules.shift();
                let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
                _self.finalizeModule(moduleName).then(success => {
                    _self.finalizeModules(modules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });

            } else {
                resolve(true);
            }
        });
    },

    /**
     * Executes one module's `nodics.js` postInit hook when present.
     *
     * @param {string} moduleName Active module name.
     * @returns {Promise<boolean>} Resolves after module post-init completes or when no hook exists.
     * @throws Rejects when module post-init fails.
     */
    finalizeModule: function (moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Starting process to finalize module : ' + moduleName);
            let moduleObject = NODICS.getRawModule(moduleName);
            let moduleFile = require(moduleObject.path + '/nodics.js');
            if (moduleFile.postInit && typeof moduleFile.postInit === 'function') {
                moduleFile.postInit(moduleObject).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};
