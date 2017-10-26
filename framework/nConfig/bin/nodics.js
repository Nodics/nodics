module.exports = function() {
    let _nodics = {
        modules: {

        },
        dbs: {

        },
        validators: {

        }
    };

    this.setModules = function(modules) {
        _nodics.modules = modules;
    };

    this.addModule = function(moduleObject) {
        _nodics.modules[moduleObject.metaData.name] = moduleObject;
    };

    this.getModules = function() {
        return _nodics.modules;
    };

    this.getModule = function(moduleName) {
        return _nodics.modules[moduleName];
    };

    this.setDatabases = function(databases) {
        _nodics.dbs = databases;
    };

    this.addDatabase = function(moduleName, database) {
        if (!moduleName) {
            moduleName = 'default';
        }
        _nodics.dbs[moduleName] = database;
    };

    this.getDatabase = function(moduleName) {
        if (moduleName) {
            return _nodics.dbs[moduleName];
        }
        return _nodics.dbs.default;
    };

    this.setValidators = function(validators) {
        _nodics.validators = validators;
    };

    this.getValidators = function() {
        return _nodics.validators;
    };
};