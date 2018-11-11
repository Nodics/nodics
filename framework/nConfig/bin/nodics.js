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

    let _nodics = {
        modules: {},
        dbs: {},
        validators: {},
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
        _serverName = 'sampleServer';
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
        if (isNaN(metaData.index)) {
            throw new Error('Property index contain invalid value in package.json for module : ' + metaData.name);
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
        return _tenants;
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
            SYSTEM.LOG.error('Given channel not supported here : ', channel);
            process.exit(1);
        }
    };
    this.getActiveChannel = function () {
        return _activeChannel;
    };



    this.setDatabases = function (databases) {
        _nodics.dbs = databases;
    };

    this.getDatabases = function () {
        return _nodics.dbs;
    };

    this.addDatabase = function (moduleName, database) {
        if (!moduleName) {
            moduleName = 'default';
        }
        _nodics.dbs[moduleName] = database;
    };

    this.addTenantDatabase = function (moduleName, tenant, database) {
        if (!moduleName) {
            moduleName = 'default';
        }
        if (!_nodics.dbs[moduleName]) {
            _nodics.dbs[moduleName] = {};
        }
        _nodics.dbs[moduleName][tenant] = database;
    };

    this.setValidators = function (validators) {
        _nodics.validators = validators;
    };

    this.getValidators = function () {
        return _nodics.validators;
    };

    this.setInterceptors = function (interceptors) {
        let defaultInterceptors = _.merge({}, interceptors.default);
        _.each(this.getModules(), (moduleObject, moduleName) => {
            if (!_nodics.interceptors[moduleName]) {
                _nodics.interceptors[moduleName] = {};
            }
            let moduleInterceptors = _.merge({}, interceptors[moduleName]);
            let moduleDefault = _.merge(_.merge({}, defaultInterceptors), moduleInterceptors.default || {});
            _.each(moduleObject.models, (tenantObject, tenantName) => {
                _.each(tenantObject.master, (model, modelName) => {
                    let modelInterceptors = _.merge({}, moduleInterceptors[model.schemaName]);
                    if (!_nodics.interceptors[moduleName][modelName]) {
                        _nodics.interceptors[moduleName][modelName] = {};
                    }
                    let interceptorPool = _nodics.interceptors[moduleName][modelName];
                    _.each(moduleDefault, (interceptor, interceptorName) => {
                        if (!interceptorPool[interceptor.type]) {
                            interceptorPool[interceptor.type] = [];
                        }
                        interceptorPool[interceptor.type].push(interceptor);
                    });
                    _.each(modelInterceptors, (interceptor, interceptorName) => {
                        if (!interceptorPool[interceptor.type]) {
                            interceptorPool[interceptor.type] = [];
                        }
                        interceptorPool[interceptor.type].push(interceptor);
                    });
                });
            });
        });
        _.each(_nodics.interceptors, (moduleInterceptors, moduleName) => {
            _.each(moduleInterceptors, (modelInterceptors, modelName) => {
                _.each(modelInterceptors, (typeInterceptors, typeName) => {
                    let indexedInterceptors = UTILS.sortModules(typeInterceptors, 'index');
                    let list = [];
                    if (indexedInterceptors) {
                        _.each(indexedInterceptors, (intList, index) => {
                            list = list.concat(intList);
                        });
                        modelInterceptors[typeName] = list;
                    }
                });
            });
        });
    };

    this.getInterceptors = function (moduleName, modelName) {
        if (!_nodics.interceptors[moduleName]) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!_nodics.interceptors[moduleName][modelName]) {
            throw new Error('Invalid model name: ' + modelName);
        } else {
            return _nodics.interceptors[moduleName][modelName];
        }
    };

    this.getModels = function (moduleName, tenant, channel) {
        if (tenant && !UTILS.isBlank(tenant)) {
            let moduleObject = this.getModule(moduleName);
            if ((channel && channel === 'master') ||
                (!channel && this.getActiveChannel() === 'master')) {
                return (moduleObject.models) ? moduleObject.models[tenant].master : null;
            } else {
                return (moduleObject.models) ? moduleObject.models[tenant].test : null;
            }
        } else {
            throw new Error('Invalid tenant id...');
        }
    };

    this.getModuleDatabase = function (moduleName, tenant) {
        if (tenant && !UTILS.isBlank(tenant)) {
            let database = _nodics.dbs[moduleName];
            return database ? database[tenant] : database;
        } else {
            throw new Error('Invalid tenant id...');
        }
    };
    this.getDatabase = function (moduleName, tenant) {
        if (tenant && !UTILS.isBlank(tenant)) {
            let database = {};
            if (moduleName && _nodics.dbs[moduleName]) {
                database = _nodics.dbs[moduleName];
            } else {
                database = _nodics.dbs.default;
            }
            return database[tenant];
        } else {
            throw new Error('Invalid tenant id...' + tenant);
        }
    };

    this.getDatabaseConfiguration = function (moduleName, tenant) {
        let properties = CONFIG.get('database', tenant);
        if (properties[moduleName]) {
            return properties[moduleName];
        } else {
            return properties.default;
        }
    };

    this.getDefaultAuthToken = function (moduleName) {
        let moduleObject = this.getModule(moduleName);
        if (moduleObject) {
            if (moduleObject.metaData.authToken) {
                Promise.resolve(moduleObject.metaData.authToken);
            } else {
                let config = CONFIG.get('backgroundAuthModules')[moduleName];
                SERVICE.BackgroundAuthTokenGenerateService.authTokenForModule(moduleName, config, {}).then(success => {
                    resolve(moduleObject.metaData.authToken);
                }).catch(error => {
                    reject(error);
                });
            }
        } else {
            Promise.reject('Invalid module name : ' + moduleName);
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