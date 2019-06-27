/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = function () {

    let _startTime = 0;
    let _entTime = 0;
    let _rawModules = {};
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
    let _nodeName = null;
    let _nodePath = null;

    let _nodics = {
        modules: {},
        dbs: {},
        interceptors: {}
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

    this.initEnvironment = function () {
        _serverName = 'kickoffLocalServer';
        _nodeName = null;
        process.argv.forEach(element => {
            if (element.startsWith('S=')) {
                _serverName = element.replace('S=', '');
            } else if (element.startsWith('SERVER=')) {
                _serverName = element.replace('SERVER=', '');
            } else if (element.startsWith('NODE=')) {
                _nodeName = element.replace('NODE=', '');
            }
        });
        _serverPath = this.getRawModule(_serverName).path;
        _envName = this.getRawModule(_serverName).parent;
        _envPath = this.getRawModule(_envName).path;
        if (_nodeName) {
            if (this.getRawModule(_nodeName)) {
                _nodePath = this.getRawModule(_nodeName).path;
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
    };

    this.getRawModule = function (moduleName) {
        return _rawModules[moduleName];
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

    this.getArguments = function () {
        return _argvs;
    };

    this.getCustomHome = function () {
        return _customHome;
    };

    this.getEnvironmentName = function () {
        return _envName;
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
        //profile_enterprise_get - router name  - profile_iamlive
        let moduleObject = this.getModule(moduleName);
        if (UTILS.isBlank(moduleObject)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (moduleObject.routers && moduleObject.routers[prefix]) {
            throw new Error('Definition ' + prefix + ' is already available for module: ' + moduleName);
        } else {
            if (!moduleObject.routers) {
                moduleObject.routers = {};
            }
            moduleObject.routers[prefix] = router;
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