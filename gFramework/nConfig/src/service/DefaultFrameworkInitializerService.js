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
            this.LOG.error("System initialization error: options cann't be null or empty");
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
        this.LOG.info('###   Sequence in which modules has been loaded (Top to Bottom)   ###\n');
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
                    //All the test cases, those needs to be executed in secific environment.
                },
                suites: {
                    //Best usecase could be testing all created pages     
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
     * Resolves active modules from gFramework, configured groups/modules, selected node, parents, and dependencies.
     *
     * @returns {string[]} Active module names that should participate in startup.
     * @sideEffects Creates an early logger using merged base/server log configuration.
     */
    getActiveModules: function () {
        try {
            let modules = [];
            let serverProperties = this.loadServerProperties();
            let prop = _.merge(props, serverProperties);
            this.LOG = logger.createLogger('DefaultModuleInitializerService', prop.log);
            let moduleGroups = ['gFramework'].concat(serverProperties.activeModules ? serverProperties.activeModules.groups || [] : []);
            moduleGroups.forEach((groupName) => {
                utils.prepareActiveModuleList(prop, groupName, modules);
            });
            if (NODICS.getNodePath()) {
                serverProperties.activeModules.modules.push(NODICS.getNodeName());
            }
            serverProperties.activeModules.modules.forEach(moduleName => {
                if (!modules.includes(moduleName)) {
                    modules.push(moduleName);
                }
            });
            modules.forEach(moduleName => {
                this.resolveModuleHiererchy(moduleName);
            });
            let dependantModules = [];
            modules.forEach(moduleName => {
                this.resolveSubDependancy(moduleName, dependantModules);
                this.resolveParentDependancy(moduleName, dependantModules);
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
        let serverName = NODICS.getServerName();
        let serverRootName = NODICS.getServerRootName();
        let serverModule = NODICS.getRawModule(serverName);
        let serverRootModule = NODICS.getRawModule(serverRootName);
        if (!serverModule) {
            this.failConfiguration('selected server module is not valid: ' + serverName);
        }
        if (!serverRootModule) {
            this.failConfiguration('selected server root module is not valid for server ' + serverName + ': ' + serverRootName);
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
            if (!serverProperties.server || !serverProperties.server[profileModuleName]) {
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
        this.validateConfiguredModules(serverProperties);
        this.validateSelectedRuntimeHierarchy();
        this.validateServerConfiguration(serverProperties);
        this.validateNodeConfiguration(serverProperties);
        this.validateModularProfileConfiguration(serverProperties);
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
        this.validateConfiguredModules(serverProperties);
        this.validateSelectedRuntimeHierarchy();
    },

    /**
     * Resolves parent hierarchy for a module while respecting environment boundary modules.
     *
     * @param {string} moduleName Module to resolve.
     * @returns {string[]} Parent hierarchy module names.
     * @sideEffects Caches `parentModules` on raw module metadata.
     */
    resolveModuleHiererchy: function (moduleName) {
        let moduleObject = NODICS.getRawModule(moduleName);
        let modules = [moduleName];
        if (!moduleObject.parent) {
            return modules;
        } else if (moduleName === NODICS.getEnvironmentName() || NODICS.getEnvironmentPath().includes(moduleObject.path)) {
            return [];
        } else {
            if (!moduleObject.parentModules) {
                moduleObject.parentModules = this.resolveModuleHiererchy(moduleObject.parent);
            }
            modules = modules.concat(moduleObject.parentModules);
            return modules;
        }
    },

    /**
     * Recursively resolves required modules declared by module metadata.
     *
     * @param {string} moduleName Module whose required modules should be resolved.
     * @param {string[]} dependantModules Accumulator for dependency module names.
     * @returns {void}
     * @sideEffects Adds dependency names to `dependantModules` and exits process for invalid module metadata.
     */
    resolveSubDependancy: function (moduleName, dependantModules) {
        let _self = this;
        let rawModule = NODICS.getRawModule(moduleName);
        if (!rawModule || !rawModule.metaData) {
            console.error('Invalid module name1 : ', moduleName);
            process.exit(1);
        } else {
            if (rawModule.metaData.requiredModules && rawModule.metaData.requiredModules.length > 0) {
                rawModule.metaData.requiredModules.forEach(nxtModuleName => {
                    if (!dependantModules.includes(nxtModuleName)) dependantModules.push(nxtModuleName);
                    _self.resolveSubDependancy(nxtModuleName, dependantModules);
                });
            }
        }
    },

    /**
     * Recursively resolves parent modules for an active module.
     *
     * @param {string} moduleName Module whose parent modules should be resolved.
     * @param {string[]} dependantModules Accumulator for parent module names.
     * @returns {void}
     * @sideEffects Adds parent module names to `dependantModules` and exits process for invalid module metadata.
     */
    resolveParentDependancy: function (moduleName, dependantModules) {
        let _self = this;
        let rawModule = NODICS.getRawModule(moduleName);
        if (!rawModule || !rawModule.metaData) {
            console.error('Invalid module name : ', moduleName);
            process.exit(1);
        } else {
            if (rawModule.parentModules && rawModule.parentModules.length > 0) {
                rawModule.parentModules.forEach(pModuleName => {
                    if (!dependantModules.includes(pModuleName)) dependantModules.push(pModuleName);
                    _self.resolveParentDependancy(pModuleName, dependantModules);
                });
            }
        }
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
                    throw new Error('Module with index: ' + moduleObject.index + ' already exist ' + moduleIndex[moduleObject.index].name);
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
        let config = CONFIG.getProperties();
        if (fs.existsSync(filePath)) {
            this.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
            var propertyFile = require(filePath);
            config = _.merge(config, propertyFile);
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
                    _self.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    let props = CONFIG.getProperties();
                    if (tntCode) {
                        props = CONFIG.getProperties(tntCode);
                    }
                    _.merge(props, require(filePath));
                } else {
                    _self.LOG.warn('System cant find configuration at : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
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
            let path = module.path + '/src/pipelines';
            try {
                fileLoader.processFiles(path, "Definition.js", (file) => {
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
