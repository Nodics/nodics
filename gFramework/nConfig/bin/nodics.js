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
    let _tenants = [];
    let _apiKeys = {};

    let _nodics = {
        modules: {},
        dbs: {},
        //validators: {},
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
        _serverName = 'nodicsDefaultServer';
        process.argv.forEach(element => {
            if (element.startsWith('S=')) {
                _serverName = element.replace('S=', '');
            } else if (element.startsWith('SERVER=')) {
                _serverName = element.replace('SERVER=', '');
            }
        });
        _serverPath = this.getRawModule(_serverName).path;
        _envName = this.getRawModule(_serverName).parent;
        _envPath = this.getRawModule(_envName).path;

        _appName = this.getRawModule(_envName).parent;
        _appPath = this.getRawModule(_appName).path;

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

    this.setRawModels = function (rawModels) {
        _rawModels = rawModels;
    };
    this.getRawModels = function () {
        return _rawModels;
    };
    this.getRawModule = function (moduleName) {
        return _rawModules[moduleName];
    };

    this.getRawModules = function () {
        return _rawModules;
    };

    this.addAPIKey = function (tenant, apiKey, value) {
        value.key = apiKey;
        _apiKeys[tenant] = value;
    };

    this.getAPIKey = function (tenant = 'default') {
        return _apiKeys[tenant];
    };

    this.getAPIKeys = function () {
        return _apiKeys;
    };

    this.findAPIKey = function (apiKey) {
        let tenants = NODICS.getTenants();
        let value;
        for (var index = 0; index < tenants.length; index++) {
            if (_apiKeys[tenants[index]].key === apiKey) {
                value = _apiKeys[tenants[index]];
                break;
            }
        }
        return value;
    };

    this.removeAPIKey = function (tenant) {
        if (!tenant) {
            throw new Error('Invalid tenant id');
        }
        if (_apiKeys[tenant] && _apiKeys[tenant]) {
            delete _apiKeys[tenant];
        }
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

    this.getApplicationName = function () {
        return _appName;
    };

    this.getApplicationPath = function () {
        return _appPath;
    };

    this.addTenant = function (tntCode) {
        _tenants.push(tntCode);
    };

    this.getTenants = function () {
        return [].concat(_tenants);
    };

    this.removeTenant = function (tntCode) {
        let index = _tenants.indexOf(tntCode);
        if (index > -1) {
            _tenants.splice(index, 1);
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
        // Object.keys(indexedModules).forEach((index) => {
        //     let indexValues = indexedModules[index];
        //     if (indexValues && indexValues.length > 0) {
        //         _indexedModules[index] = indexValues[0];
        //     }
        // });
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
            NODICS.LOG.error('Given channel not supported here : ', channel);
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
        } else if (!NODICS.getTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else {
            let moduleObject = this.getModule(moduleName);
            return (moduleObject.searchModels) ? moduleObject.searchModels[tenant] : null;
        }
    };

    this.getSearchModel = function (moduleName, tenant, typeName) {
        let searchModels = NODICS.getSearchModels(moduleName, tenant);
        if (searchModels) {
            let searchModel = searchModels[typeName.toUpperCaseFirstChar() + 'SearchModel'];
            if (searchModel) {
                return searchModel;
            } else {
                throw new Error('Search is not enable for model: ' + typeName);
            }
        } else {
            throw new Error('Invalid search configuration, none search model found for ' + typeName);
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