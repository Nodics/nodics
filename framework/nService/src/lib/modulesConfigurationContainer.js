/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = function () {

    let _modules = {};
    this.LOG = SYSTEM.createLogger('ExternalModulesContainer');

    this.getModules = function () {
        return _modules;
    };

    this.prepareModulesConfiguration = function () {
        let _self = this;
        _.each(CONFIG.get('server'), (moduleConfig, moduleName) => {
            if (moduleName !== 'options') {
                try {
                    moduleConfig.options = moduleConfig.options || CONFIG.get('server').options;
                    _self.addModule(moduleName, moduleConfig);
                } catch (error) {
                    this.LOG.error('Invalid configuration found for module : ' + moduleName);
                    throw error;
                }
            }
        });
    };

    this.addModule = function (moduleName, moduleConfig) {
        let _self = this;
        if (!moduleConfig.server) {
            throw new Error('Invalid server configuration for module : ', moduleName);
        }
        if (!moduleConfig.abstractServer) {
            moduleConfig.abstractServer = moduleConfig.server;
        }
        if (UTILS.isBlank(moduleConfig.nodes)) {
            moduleConfig.nodes = {
                0: moduleConfig.server
            };
        }
        _self.LOG.debug('Adding module for : ', moduleName);
        let moduleObj = new CLASSES.ModuleConfiguration(moduleName);
        moduleObj.addServer(moduleConfig.server);
        moduleObj.addOptions(moduleConfig.options);
        moduleObj.addAbstractServer(moduleConfig.abstractServer);
        _.each(moduleConfig.nodes, (nodeConfig, nodeName) => {
            _self.LOG.debug('   Adding type for : ', nodeName);
            moduleObj.addNode(nodeName, nodeConfig);
        });
        _modules[moduleName] = moduleObj;
    };

    this.getModule = function (moduleName) {
        if (_modules[moduleName]) {
            return _modules[moduleName];
        } else {
            throw new Error('Invalid module name : ', moduleName, ' Please validate your entry');
        }
    };

    this.isAvailableModuleConfig = function (moduleName) {
        if (_modules[moduleName]) {
            return true;
        } else {
            return false;
        }
    };

    this.removeModule = function (moduleName) {
        delete _modules[moduleName];
    };
};