/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module service/lib/ModulesConfigurationContainer
 * @description Runtime container for module topology configuration loaded from
 * layered `servers` properties. It builds `ModuleConfiguration` objects used for
 * internal module communication and distributed node routing.
 * @layer lib
 * @owner nService
 * @override Project modules may replace this container to integrate service
 * discovery systems, but should preserve module lookup and availability
 * semantics.
 *
 * @property {Object} CONFIG.servers Layered server/module topology configuration.
 */
module.exports = function () {

    let _modules = {};
    this.LOG = SERVICE.DefaultLoggerService.createLogger('ExternalModulesContainer');

    this.getModules = function () {
        return _modules;
    };

    this.prepareModulesConfiguration = function () {
        let _self = this;
        _.each(CONFIG.get('servers'), (moduleConfig, moduleName) => {
            if (moduleName !== 'options') {
                try {
                    moduleConfig.options = moduleConfig.options || CONFIG.get('servers').options;
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
        if (!moduleConfig.endpoint) {
            throw new Error('Invalid endpoint configuration for module : ' + moduleName);
        }
        if (!moduleConfig.abstractEndpoint) {
            moduleConfig.abstractEndpoint = moduleConfig.endpoint;
        }
        if (UTILS.isBlank(moduleConfig.nodes)) {
            moduleConfig.nodes = {
                node0: moduleConfig.endpoint
            };
        }
        _self.LOG.debug('Adding module for : ' + moduleName);
        let moduleObj = new CLASSES.ModuleConfiguration(moduleName);
        moduleObj.addEndpoint(moduleConfig.endpoint);
        moduleObj.addOptions(moduleConfig.options);
        moduleObj.addAbstractEndpoint(moduleConfig.abstractEndpoint);
        _.each(moduleConfig.nodes, (nodeConfig, nodeName) => {
            _self.LOG.debug('   Adding type for : ' + nodeName);
            moduleObj.addNode(nodeName, nodeConfig);
        });
        _modules[moduleName] = moduleObj;
    };

    this.getModule = function (moduleName) {
        if (_modules[moduleName]) {
            return _modules[moduleName];
        } else {
            throw new Error('Invalid module name : ' + moduleName + ' Please validate your entry');
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
