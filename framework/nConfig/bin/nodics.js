/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function(env, nodicsHome, serverHome, argvs) {
    let _serverState = 'starting';
    let _activeTenant = 'default';
    let _activeChannel = 'master';
    let _activeEnv = env;
    let _nodicsHome = nodicsHome;
    let _serverHome = serverHome;
    let _argvs = argvs;
    let _activeModules = [];

    let _nodics = {
        modules: {},
        dbs: {},
        validators: {}
    };

    this.getArguments = function() {
        return _argvs;
    };

    this.getNodicsHome = function() {
        return _nodicsHome;
    };

    this.getServerHome = function() {
        return _serverHome;
    };

    this.getActiveEnvironment = function() {
        return _activeEnv;
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
            console.log('   ERROR: given tenant not supported here : ', tenant);
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
            console.log('   ERROR: given channel not supported here : ', channel);
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

    this.setValidators = function(validators) {
        _nodics.validators = validators;
    };
    this.getValidators = function() {
        return _nodics.validators;
    };

    this.getModels = function(moduleName) {
        let modules = this.getModule(moduleName);
        if (this.getActiveChannel() === 'master') {
            return modules.models[this.getActiveTanent()].master;
        }
        return modules.models[this.getActiveTanent()].test;
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