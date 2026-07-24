/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');

/**
 * @module config/bin/NodicsRuntime
 * @description Mutable process-level runtime registry for Nodics paths, environment/server/node selection, indexed modules, tenant and enterprise state, models, loggers, scripts, authentication tokens, and startup state.
 * @layer module
 * @owner nConfig
 * @override Project modules should customize runtime state through module metadata, startup options, layered configuration, and services. Any replacement must preserve environment resolution, active-module ordering, tenant state, and registry accessors used across the platform.
 * @property {Object<string,Object>} _rawModules Discovered runtime module metadata keyed by module name.
 * @property {Map<string,Object>} _indexedModules Active modules ordered by hierarchical index.
 * @property {string[]} _activeTenants Tenant codes initialized for request processing.
 * @property {string|null} _serverName Selected server package name.
 * @property {string|null} _nodeName Optional selected node package name.
 */
module.exports = function () {

    let _startTime = 0;
    let _entTime = 0;
    let _rawModules = {};
    let _rawModuleNames = {};
    let _rawModels = {};
    let _serverState = 'starting';
    let _activeChannel = 'master';
    let _nTestRunning = false;
    let _initRequired = false;
    let _loggers = {};
    let _preScripts = {};
    let _activeEnterprises = {};
    let _activeTenants = [];
    let _internalAuthTokens = {};
    let _options = {};
    let _nodicsHome = null;
    let _customHome = null;
    let _serverName = null;
    let _serverModuleKey = null;
    let _serverPath = null;
    let _serverRootName = null;
    let _serverRootPath = null;
    let _envName = null;
    let _envPath = null;
    let _argvs = [];
    let _postScripts = {};
    let _activeModules = [];
    let _indexedModules = new Map();
    let _nodeName = null;
    let _nodeModuleKey = null;
    let _nodePath = null;

    let _nodics = {
        modules: {},
        dbs: {},
        interceptors: {}
    };

    /**
     * Reads one interactive startup selection.
     *
     * npm can leave stdin in non-blocking mode on macOS, causing an immediate
     * EAGAIN even though the process owns an interactive terminal. Reopening
     * the controlling terminal gives the startup prompt a blocking descriptor
     * without changing non-interactive startup behavior.
     */
    let readInteractiveSelection = function () {
        let buffer = Buffer.alloc(256);
        let terminalFd;
        try {
            let length;
            try {
                length = fs.readSync(process.stdin.fd, buffer, 0, buffer.length, null);
            } catch (error) {
                if (process.platform === 'win32' || (error.code !== 'EAGAIN' && error.code !== 'EWOULDBLOCK')) {
                    throw error;
                }
                terminalFd = fs.openSync('/dev/tty', 'r');
                length = fs.readSync(terminalFd, buffer, 0, buffer.length, null);
            }
            return buffer.toString('utf8', 0, length).trim();
        } finally {
            if (terminalFd !== undefined) fs.closeSync(terminalFd);
        }
    };

    this.init = function (options) {
        if (!options.NODICS_HOME) {
            options.NODICS_HOME = process.env.NODICS_HOME || process.cwd();
        }
        _options = options;
        _nodicsHome = options.NODICS_HOME;

        if (!options.CUSTOM_HOME) {
            options.CUSTOM_HOME = process.env.CUSTOM_HOME || options.NODICS_HOME;
        }
        _customHome = options.CUSTOM_HOME;
    };

    this.initEnvironment = function (options) {
        let explicitServer = process.env.S || process.env.SERVER || null;
        let argumentServerExplicit = false;
        let argumentEnvironmentExplicit = false;
        _serverName = explicitServer || options.defaultServer || null;
        let selectedEnvironment = process.env.E || process.env.ENV || (!explicitServer && options.defaultEnvironment) || null;
        _nodeName = process.env.NODICS_NODE || process.env.N || null;
        if (!_nodeName && process.env.NODE && process.env.NODE.indexOf('/') === -1 && process.env.NODE.indexOf('\\') === -1) {
            _nodeName = process.env.NODE;
        }
        process.argv.forEach(element => {
            if (element.startsWith('S=')) {
                _serverName = element.replace('S=', '');
                argumentServerExplicit = true;
            } else if (element.startsWith('SERVER=')) {
                _serverName = element.replace('SERVER=', '');
                argumentServerExplicit = true;
            } else if (element.startsWith('ENV=')) {
                selectedEnvironment = element.replace('ENV=', '');
                argumentEnvironmentExplicit = true;
            } else if (element.startsWith('E=')) {
                selectedEnvironment = element.replace('E=', '');
                argumentEnvironmentExplicit = true;
            } else if (element.startsWith('NODE=')) {
                _nodeName = element.replace('NODE=', '');
            }
        });
        if (argumentServerExplicit && !argumentEnvironmentExplicit && !process.env.E && !process.env.ENV) selectedEnvironment = null;
        if (!_serverName) {
            throw new Error('Default server is not configured. Set defaultOptions.defaultServer or pass S=<serverName>');
        }
        if (_nodeName && !explicitServer && !argumentServerExplicit) {
            throw new Error('Node startup requires an explicit SERVER=<serverName> or S=<serverName>');
        }
        let serverModule = this.resolveTopologyModule(_serverName, 'server', selectedEnvironment);
        if (!serverModule || !serverModule.path) {
            throw new Error('Invalid server name: ' + _serverName);
        }
        _serverName = serverModule.name;
        _serverModuleKey = serverModule.registryKey;
        _serverPath = serverModule.path;
        //_envName = this.getRawModule(_serverName).parent;
        // _envPath = this.getRawModule(_envName).path;
        // -------------------------------------

        _serverRootName = serverModule.parent;
        _serverRootPath = this.getRawModule(serverModule.parentKey || _serverRootName).path;

        _envName = this.getRawModule(serverModule.parentKey || _serverRootName).parent;
        _envPath = this.getRawModule(_envName).path;
        // -------------------------------------
        if (_nodeName) {
            let nodeModule = this.resolveTopologyModule(_nodeName, 'node', _serverRootName, _serverName);
            if (nodeModule) {
                _nodeName = nodeModule.name;
                _nodeModuleKey = nodeModule.registryKey;
                _nodePath = nodeModule.path;
            } else {
                throw new Error('Invalid node name: ' + _nodeName);
            }
        }
        // _appName = this.getRawModule(_envName).parent;
        // _appPath = this.getRawModule(_appName).path;
    };

    this.getNodicsHome = function () {
        return _nodicsHome;
    };

    this.addRawModule = function (metaData, path, parent) {
        if (!metaData || !path) {
            throw new Error('Invalid module meta data or path');
        }
        if (!metaData.name || !metaData.index) {
            throw new Error('Invalid module meta data properties, verify name and index');
        }
        _rawModules[metaData.name] = {
            path: path,
            index: metaData.index,
            parent: parent,
            metaData: metaData
        };
    };

    this.addRawModules = function (rawModules) {
        _rawModules = rawModules;
        _rawModuleNames = {};
        _.each(rawModules, moduleObject => {
            _rawModuleNames[moduleObject.name] = _rawModuleNames[moduleObject.name] || [];
            _rawModuleNames[moduleObject.name].push(moduleObject);
        });
    };

    this.getRawModule = function (moduleName) {
        if (_rawModules[moduleName]) return _rawModules[moduleName];
        let candidates = _rawModuleNames[moduleName] || [];
        if (candidates.length === 1) return candidates[0];
        if (candidates.length > 1) {
            let selected = candidates.find(candidate => candidate.registryKey === _serverModuleKey ||
                candidate.registryKey === _nodeModuleKey);
            if (!selected && _serverRootName) selected = candidates.find(candidate =>
                candidate.metaData.nodics.kind === 'server' && candidate.parent === _serverRootName);
            if (!selected && _serverName) selected = candidates.find(candidate =>
                candidate.metaData.nodics.kind === 'node' && candidate.parent === _serverName);
            return selected;
        }
    };

    /** Resolves a server or node within its selected topology scope and prompts only on an interactive terminal. */
    this.resolveTopologyModule = function (name, kind, environmentName, serverName) {
        let candidates = (_rawModuleNames[name] || []).filter(candidate =>
            candidate.metaData.nodics.kind === kind && (!serverName || candidate.parent === serverName));
        if (environmentName) candidates = candidates.filter(candidate => kind === 'server' ?
            candidate.parent === environmentName : this.getRawModule(candidate.parentKey || candidate.parent).parent === environmentName);
        if (candidates.length === 1) return candidates[0];
        if (candidates.length === 0) return undefined;
        if (kind !== 'server') throw new Error('Ambiguous ' + kind + ' name: ' + name);
        let environments = candidates.map(candidate => candidate.parent);
        if (typeof _options.environmentSelector === 'function') {
            let selectedEnvironment = _options.environmentSelector({ serverName: name, environments: environments.slice() });
            let selectedCandidate = candidates.find(candidate => candidate.parent === selectedEnvironment);
            if (selectedCandidate) return selectedCandidate;
            throw new Error('Invalid environment selection for server "' + name + '"');
        }
        if (process.stdin.isTTY && process.stdout.isTTY && process.env.CI !== 'true' && process.env.NODICS_NON_INTERACTIVE !== 'true') {
            process.stdout.write('Server "' + name + '" exists in multiple environments.\n\n' + environments
                .map((candidate, index) => '  ' + (index + 1) + '. ' + candidate).join('\n') + '\n\nEnvironment: ');
            let answer = readInteractiveSelection();
            let selected = /^\d+$/.test(answer) ? environments[Number(answer) - 1] : answer;
            let match = candidates.find(candidate => candidate.parent === selected);
            if (match) return match;
            throw new Error('Invalid environment selection for server "' + name + '"');
        }
        throw new Error('Ambiguous server "' + name + '". Available environments: ' + environments.join(', ') +
            '. Specify ENV=<environment> SERVER=' + name);
    };

    this.getRawModules = function () {
        return _rawModules;
    };

    this.setRawModels = function (rawModels) {
        _rawModels = rawModels;
    };
    this.getRawModels = function () {
        return _rawModels;
    };

    this.addInternalAuthToken = function (tenant, authToken) {
        _internalAuthTokens[tenant] = authToken;
    };

    this.getInternalAuthToken = function (tenant) {
        return _internalAuthTokens[tenant];
    };

    this.getInternalAuthTokens = function (tenant) {
        return _internalAuthTokens;
    };

    this.removeInternalAuthToken = function (tenant) {
        delete _internalAuthTokens[tenant];
    };

    this.setStartTime = function (time) {
        _startTime = time;
    };
    this.getStartTime = function () {
        return _startTime;
    };
    this.setEndTime = function (time) {
        _entTime = time;
    };
    this.getEndTime = function () {
        return _entTime;
    };

    this.getStartDuration = function () {
        return (_entTime - _startTime);
    };

    this.getNodeName = function () {
        return _nodeName;
    };

    this.getNodePath = function () {
        return _nodePath;
    };

    this.getServerName = function () {
        return _serverName;
    };

    this.getServerPath = function () {
        return _serverPath;
    };

    this.getServerRootName = function () {
        return _serverRootName;
    };

    this.getServerRootPath = function () {
        return _serverRootPath;
    };

    this.getArguments = function () {
        return _argvs;
    };

    this.getCustomHome = function () {
        return _customHome;
    };

    this.getEnvironmentName = function () {
        return _envName;
    };

    /** Returns the concrete selected environment/server-root name, such as startioLocal. */
    this.getSelectedEnvironmentName = function () {
        return _serverRootName;
    };

    /** Returns the organizational environment-group name retained for hierarchy composition. */
    this.getEnvironmentGroupName = function () {
        return _envName;
    };

    /** Returns the runtime-derived canonical identity of the selected server. */
    this.getServerCanonicalIdentity = function () {
        let moduleObject = _serverModuleKey && _rawModules[_serverModuleKey];
        return moduleObject && moduleObject.canonicalIdentity;
    };

    /** Returns the runtime-derived canonical identity of the selected node. */
    this.getNodeCanonicalIdentity = function () {
        let moduleObject = _nodeModuleKey && _rawModules[_nodeModuleKey];
        return moduleObject && moduleObject.canonicalIdentity;
    };

    this.getEnvironmentPath = function () {
        return _envPath;
    };

    this.addActiveEnterprise = function (entCode, tenant) {
        _activeEnterprises[entCode] = tenant;
    };

    this.removeActiveEnterprise = function (entCode) {
        return delete _activeEnterprises[entCode];
    };

    this.getTenantForEnterprise = function (entCode) {
        return _activeEnterprises[entCode];
    };

    this.getActiveEnterprises = function () {
        return Object.keys(_activeEnterprises);
    }

    this.addActiveTenant = function (tntCode) {
        _activeTenants.push(tntCode);
    };

    this.getActiveTenants = function () {
        return [].concat(_activeTenants);
    };

    this.removeActiveTenant = function (tntCode) {
        let index = _activeTenants.indexOf(tntCode);
        if (index > -1) {
            _activeTenants.splice(index, 1);
            return true;
        }
        return false;
    };

    this.setPreScripts = function (preScripts) {
        _preScripts = preScripts;
    };
    this.getPreScripts = function () {
        return _preScripts;
    };

    this.setPostScripts = function (postScripts) {
        _postScripts = postScripts;
    };
    this.getPostScripts = function () {
        return _postScripts;
    };

    this.addLogger = function (entityName, logger) {
        _loggers[entityName] = logger;
    };

    this.getLogger = function (entityName) {
        return _loggers[entityName];
    };

    this.getLoggers = function () {
        return _loggers;
    };

    this.setActiveModules = function (activeModules) {
        _activeModules = activeModules;
    };
    this.getActiveModules = function () {
        return [].concat(_activeModules);
    };
    this.isModuleActive = function (moduleName) {
        if (_activeModules.indexOf(moduleName) > -1) {
            return true;
        }
        return false;
    };

    this.setIndexedModules = function (indexedModules) {
        _indexedModules = indexedModules;
    };

    this.getIndexedModules = function () {
        return _indexedModules;
    };

    this.setModules = function (modules) {
        _nodics.modules = modules;
    };
    this.getModules = function () {
        return _nodics.modules;
    };

    this.addModule = function (moduleObject) {
        _nodics.modules[moduleObject.metaData.name] = moduleObject;
    };

    this.getModule = function (moduleName) {
        return _nodics.modules[moduleName];
    };

    this.setInitRequired = function (flag) {
        _initRequired = flag;
    };

    this.isInitRequired = function () {
        return _initRequired;
    };

    this.setNTestRunning = function (isRunning) {
        _nTestRunning = isRunning;
    };

    this.isNTestRunning = function () {
        return _nTestRunning;
    };

    this.setServerState = function (serverState) {
        _serverState = serverState;
    };
    this.getServerState = function () {
        return _serverState;
    };

    this.setActiveChannel = function (channel) {
        if (channel === 'master' || channel === 'test') {
            _activeChannel = channel;
        } else {
            NODICS.LOG.error('Given channel not supported here : ' + channel);
            process.exit(1);
        }
    };

    this.getActiveChannel = function () {
        return _activeChannel;
    };

    this.getModels = function (moduleName, tenant, channel = this.getActiveChannel()) {
        if (tenant && !UTILS.isBlank(tenant)) {
            let moduleObject = this.getModule(moduleName);
            if (channel === 'master') {
                return (moduleObject.models) ? moduleObject.models[tenant].master : null;
            } else {
                return (moduleObject.models) ? moduleObject.models[tenant].test : null;
            }
        } else {
            throw new Error('Invalid tenant id...');
        }
    };

    this.getSearchModels = function (moduleName, tenant) {
        if (!NODICS.isModuleActive(moduleName) || !this.getModule(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let moduleObject = this.getModule(moduleName);
            return (moduleObject.searchModels) ? moduleObject.searchModels[tenant] : null;
        }
    };

    this.getSearchModel = function (moduleName, tenant, indexName) {
        let searchModels = NODICS.getSearchModels(moduleName, tenant);
        if (searchModels) {
            let searchModel = searchModels[indexName.toUpperCaseFirstChar() + 'SearchModel'];
            if (searchModel) {
                return searchModel;
            } else {
                throw new Error('Search is not enable for model: ' + indexName);
            }
        } else {
            throw new Error('Invalid search configuration, none search model found for ' + indexName);
        }
    };

    this.addRouters = function (routers, moduleName) {
        let moduleObject = this.getModule(moduleName);
        if (UTILS.isBlank(moduleObject)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            moduleObject.routers = routers;
        }
    };

    this.addRouter = function (prefix, router, moduleName) {
        let moduleObject = this.getModule(moduleName);
        if (UTILS.isBlank(moduleObject)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            if (!moduleObject.routers) {
                moduleObject.routers = {};
            }
            moduleObject.routers[prefix] = router;
            this.LOG.debug(router.method + '\t : ' + router.url);
        }
    };

    this.getRouters = function (moduleName) {
        let moduleObject = this.getModule(moduleName);
        if (UTILS.isBlank(moduleObject)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            return moduleObject.routers;
        }
    };

    this.getRouter = function (prefix, moduleName) {
        let moduleObject = this.getModule(moduleName);
        if (UTILS.isBlank(moduleObject)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            return moduleObject.routers ? moduleObject.routers[prefix] : undefined;
        }
    };
};
