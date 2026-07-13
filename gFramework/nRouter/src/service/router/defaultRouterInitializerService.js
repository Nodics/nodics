/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const Express = require('express');

/**
 * @module router/service/router/DefaultRouterInitializerService
 * @description Initializes Express application and router instances for router-enabled
 * modules according to the selected consolidated or modular runtime topology.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this service to customize Express app creation,
 * module router creation, or server topology initialization.
 *
 * @property {Object} SERVICE.DefaultRouterService Provides module/server configuration pool.
 * @property {Object} NODICS Runtime registry containing active modules.
 * @property {Object} moduleObject.app Express app assigned to a module with dedicated server config.
 * @property {Object} moduleObject.moduleRouter Express router assigned to module route bindings.
 */
module.exports = {
    /**
     * Creates Express app/router instances for router-enabled modules.
     *
     * @returns {void}
     * @sideEffects Writes `app` and `moduleRouter` to module runtime objects or shared default module.
     */
    initializeRouters: function () {
        let _self = this;
        _self.LOG.info('Initializing servers');
        let modules = NODICS.getModules();
        _.each(modules, function (moduleObject, moduleName) {
            if (UTILS.isRouterEnabled(moduleName)) {
                if (SERVICE.DefaultRouterService.getModulesPool().isAvailableModuleConfig(moduleName)) {
                    _self.LOG.debug('Initializing server for module : ' + moduleName);
                    moduleObject.app = require('express')();
                    moduleObject.moduleRouter = Express.Router();
                } else {
                    _self.LOG.warn('Module : ' + moduleName + ' initializing with default');
                    if (!modules.default) {
                        modules.default = {};
                    }
                    if (!modules.default.app) {
                        modules.default.app = require('express')();
                        modules.default.moduleRouter = Express.Router();
                    }
                }
            }
        });
    }
};
