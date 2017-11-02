module.exports = function(env, nodicsHome, serverHome, argvs) {
    let _serverState = 'starting';
    let _activeTanent = 'default';
    let _activeChannel = 'master';
    let _activeEnv = env;
    let _nodicsHome = nodicsHome;
    let _serverHome = serverHome;
    let _argvs = argvs;
    let _activeModules = [];
    let _nodics = {
        modules: {

        },
        dbs: {

        },
        validators: {

        }
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

    this.setActiveTanent = function(tanent) {
        _activeTanent = tanent;
    };
    this.getActiveTanent = function() {
        return _activeTanent;
    };

    this.setActiveChannel = function(channel) {
        _activeChannel = channel;
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
    this.getDatabase = function(moduleName) {
        if (moduleName && _nodics.dbs[moduleName]) {
            return _nodics.dbs[moduleName];
        }
        return _nodics.dbs.default;
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
        if (this.getActiveChannel() && this.getActiveChannel() === 'master') {
            return modules.models.master;
        }
        return modules.models.test;
    };
};