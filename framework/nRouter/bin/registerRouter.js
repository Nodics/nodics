/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    moduleRoot: function() {
        let modules = NODICS.getModules();
        let routers = SYSTEM.loadFiles('/src/router/router.js');
        _.each(modules, function(value, moduleName) {
            let app = {};
            if (CONFIG.get('server').runAsSingleModule) {
                app = modules.default.app;
            } else {
                app = value.app;
            }

            if (value.metaData && value.metaData.publish) {
                // Execute common routers for each required Schema
                _.each(value.rawSchema, (schemaObject, schemaName) => {
                    if (schemaObject.service) {
                        _.each(routers.default, function(group, groupName) {
                            _.each(group, function(routerDef, routerName) {
                                let functionName = routerDef.method.toLowerCase();
                                let tmpRouterDef = _.merge({}, routerDef);
                                tmpRouterDef.key = tmpRouterDef.key.replaceAll('schemaName', schemaName.toLowerCase());
                                tmpRouterDef.controller = tmpRouterDef.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                                tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                //console.log(tmpRouterDef.url);
                                eval(routers.operations[functionName](app, moduleName, tmpRouterDef));
                            });
                        });
                    }
                });
                // Register all module specific routers here
                if (!UTILS.isBlank(routers[moduleName])) {
                    _.each(routers[moduleName], function(group, groupName) {
                        _.each(group, function(routerDef, routerName) {
                            let functionName = routerDef.method.toLowerCase();
                            let tmpRouterDef = _.merge({}, routerDef);
                            //tmpRouterDef.key = tmpRouterDef.key.replaceAll('schemaName', schemaName.toLowerCase());
                            //tmpRouterDef.controller = tmpRouterDef.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                            tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                            eval(routers.operations[functionName](app, moduleName, tmpRouterDef));
                        });
                    });
                }
            }
        });
    },

    registerModelRouter: function(options) {
        if (options.schemaObject.service) {
            console.log('       INFO: Registering router for model : ', options.schemaName);
            options.modelName = options.schemaName.toUpperCaseEachWord();
            let routerObject = SYSTEM.replacePlaceholders(options);
            Object.keys(routerObject).forEach(function(key) {
                if (routerObject[key] && typeof routerObject[key] === "function") {
                    routerObject[key](options.app);
                }
            });
        }
    },

    init: function() {
        let _self = this;
        console.log(' =>Starting routers registration process');
        let modules = NODICS.getModules();
        let commonRoter = SYSTEM.loadFiles('/src/router/router.js');
        if (CONFIG.get('server').runAsSingleModule) {
            if (!modules.default || !modules.default.app) {
                console.error('   ERROR: Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            console.log('   INFO: Registering routers with Default App');
            console.log('     INFO: Executing common routers');
            SYSTEM.modelsWalkThrough({
                requireParsing: true,
                commonDefinition: commonRoter.default,
                app: modules.default.app
            }, this.registerModelRouter);
            _.each(modules, function(value, moduleName) {
                let moduleRouter = commonRoter[moduleName];
                if (!UTILS.isBlank(moduleRouter)) {
                    console.log('     INFO: Executing module configurations :', moduleName);
                    Object.keys(moduleRouter).forEach(function(key) {
                        if (moduleRouter[key] && typeof moduleRouter[key] === "function") {
                            moduleRouter[key](modules.default.app);
                        }
                    });
                }
            });
        } else {
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (!value.app) {
                        console.error('   ERROR: Server configurations has not be initialized for module : ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    console.log('   INFO: Registering routers for module : ', moduleName);
                    console.log('     INFO: Executing common routers');
                    SYSTEM.modelsWalkThrough({
                        requireParsing: true,
                        commonDefinition: commonRoter.default,
                        app: value.app,
                        moduleName: moduleName
                    }, _self.registerModelRouter);
                    let moduleRouter = commonRoter[moduleName];
                    if (!UTILS.isBlank(moduleRouter)) {
                        console.log('     INFO: Executing module configurations :', moduleName);
                        Object.keys(moduleRouter).forEach(function(key) {
                            if (moduleRouter[key] && typeof moduleRouter[key] === "function") {
                                moduleRouter[key](value.app);
                            }
                        });
                    }
                }
            });
        }
    }
};