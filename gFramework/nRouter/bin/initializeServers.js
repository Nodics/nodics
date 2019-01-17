/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    initServers: function () {
        let _self = this;
        SYSTEM.LOG.info('Initializing servers');
        let modules = NODICS.getModules();
        if (CONFIG.get('server').options.runAsDefault) {
            SYSTEM.LOG.debug('Initializing single server for whole application. As CONFIG.server.runAsSingleModule set to true.');
            if (!modules.default) {
                modules.default = {};
            }
            modules.default.app = require('express')();
        } else {
            _.each(modules, function (value, moduleName) {
                if (value.metaData.publish) {
                    if (SYSTEM.getModulesPool().isAvailableModuleConfig(moduleName)) {
                        SYSTEM.LOG.debug('Initializing server for module : ', moduleName);
                        value.app = require('express')();
                    } else {
                        SYSTEM.LOG.warn('Module : ', moduleName, ' initializing with default');
                        if (!modules.default) {
                            modules.default = {};
                        }
                        if (!modules.default.app) {
                            modules.default.app = require('express')();
                        }
                    }
                }
            });
        }
    }
};