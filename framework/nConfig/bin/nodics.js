/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function(nodicsHome, customHome, app, env, serverName, argvs) {
    let _serverState = 'starting';
    let _activeTenant = 'default';
    let _activeChannel = 'master';
    let _activeEnv = env;
    let _activeApp = app;
    let _nodicsHome = nodicsHome;
    let _serverName = serverName;
    let _serverHome = '';
    let _customHome = customHome;
    let _argvs = argvs;
    let _activeModules = [];
    let _nTestRunning = false;
    let _initRequired = false;
    let _startTime = 0;
    let _entTime = 0;
    let _loggers = {};
    this.LOG = {};

    let _nodics = {
        modules: {},
        dbs: {},
        validators: {}
    };

    this.setStartTime = function(time) {
        _startTime = time;
    };
    this.getStartTime = function() {
        return _startTime;
    };
    this.setEndTime = function(time) {
        _entTime = time;
    };
    this.getEndTime = function() {
        return _entTime;
    };

    this.getStartDuration = function() {
        return (_entTime - _startTime);
    };

    this.addLogger = function(entityName, logger) {
        _loggers[entityName] = logger;
    };

    this.getLogger = function(entityName) {
        return _loggers[entityName];
    };

    this.getLoggers = function() {
        return _loggers;
    };

    this.setInitRequired = function(flag) {
        _initRequired = flag;
    };

    this.isInitRequired = function() {
        return _initRequired;
    };

    this.setNTestRunning = function(isRunning) {
        _nTestRunning = isRunning;
    };

    this.isNTestRunning = function() {
        return _nTestRunning;
    };

    this.getArguments = function() {
        return _argvs;
    };

    this.getNodicsHome = function() {
        return _nodicsHome;
    };

    this.getCustomHome = function() {
        return _customHome;
    };

    this.getServerName = function() {
        return _serverName;
    };

    this.getServerHome = function() {
        return _serverHome;
    };

    this.setServerHome = function(serverHome) {
        _serverHome = serverHome;
    };

    this.getActiveEnvironment = function() {
        return _activeEnv;
    };

    this.getActiveApplication = function() {
        return _activeApp;
    };

    this.setActiveModules = function(activeModules) {
        _activeModules = activeModules;
    };
    this.getActiveModules = function() {
        return _activeModules;
    };
    this.isModuleActive = function(moduleName) {
        if (_activeModules.indexOf(moduleName) > -1) {
            return true;
        }
        return false;
    };

    this.setServerState = function(serverState) {
        _serverState = serverState;
    };
    this.getServerState = function() {
        return _serverState;
    };

    this.setActiveTanent = function(tenant) {
        if (CONFIG.get('installedTanents').includes(tenant)) {
            _activeTenant = tenant;
        } else {
            SYSTEM.LOG.error('   ERROR: given tenant not supported here : ', tenant);
            process.exit(1);
        }
    };
    this.getActiveTanent = function() {
        return _activeTenant;
    };

    this.setActiveChannel = function(channel) {
        if (channel === 'master' || channel === 'test') {
            _activeChannel = channel;
        } else {
            SYSTEM.LOG.error('   ERROR: given channel not supported here : ', channel);
            process.exit(1);
        }
    };
    this.getActiveChannel = function() {
        return _activeChannel;
    };

    this.setModules = function(modules) {
        _nodics.modules = modules;
    };
    this.getModules = function() {
        return _nodics.modules;
    };

    this.addModule = function(moduleObject) {
        _nodics.modules[moduleObject.metaData.name] = moduleObject;
    };
    this.getModule = function(moduleName) {
        return _nodics.modules[moduleName];
    };

    this.setDatabases = function(databases) {
        _nodics.dbs = databases;
    };

    this.getDatabases = function() {
        return _nodics.dbs;
    };

    this.addDatabase = function(moduleName, database) {
        if (!moduleName) {
            moduleName = 'default';
        }
        _nodics.dbs[moduleName] = database;
    };

    this.addTenantDatabase = function(moduleName, tenant, database) {
        if (!moduleName) {
            moduleName = 'default';
        }
        if (!_nodics.dbs[moduleName]) {
            _nodics.dbs[moduleName] = {};
        }
        _nodics.dbs[moduleName][tenant] = database;
    };

    this.setValidators = function(validators) {
        _nodics.validators = validators;
    };
    this.getValidators = function() {
        return _nodics.validators;
    };

    this.getModels = function(moduleName, tenant) {
        if (tenant && !UTILS.isBlank(tenant)) {
            let modules = this.getModule(moduleName);
            if (this.getActiveChannel() === 'master') {
                return modules.models[tenant].master;
            }
            return modules.models[tenant].test;
        } else {
            throw new Error('Invalid tenant id...');
        }
    };

    this.getDatabase = function(moduleName, tenant) {
        let database = {};
        if (moduleName && _nodics.dbs[moduleName]) {
            database = _nodics.dbs[moduleName];
        } else {
            database = _nodics.dbs.default;
        }
        if (!tenant) {
            tenant = this.getActiveTanent();
        }
        return database[tenant];
    };

    this.getDatabaseConfiguration = function(moduleName, tenant) {
        let properties = CONFIG.get('database', tenant);
        if (properties[moduleName]) {
            return properties[moduleName];
        } else {
            return properties.default;
        }
    };
};