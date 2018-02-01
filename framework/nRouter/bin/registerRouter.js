/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function() {
        let modules = NODICS.getModules();
        let routers = SYSTEM.loadFiles('/src/router/router.js');
        _.each(modules, function(value, moduleName) {
            let app = {};
            if (CONFIG.get('server').runAsSingleModule) {
                app = modules.default.app;
            } else {
                app = value.app;
            }
            let apiCache = _.merge({}, CONFIG.get('cache').apiCache);
            if (app && value.metaData && value.metaData.publish) {
                // Execute common routers for each required Schema
                _.each(value.rawSchema, (schemaObject, schemaName) => {
                    if (schemaObject.service && schemaObject.router) {
                        let defaultOptions = _.merge({}, routers.default.options || {});
                        _.each(routers.default, function(group, groupName) {
                            let groupOptions = _.merge(_.merge({}, defaultOptions), group.options);
                            if (groupName !== 'options') {
                                _.each(group, function(routerDef, routerName) {
                                    if (routerName !== 'options') {
                                        let routerOption = _.merge(_.merge({}, groupOptions), routerDef.options || {});
                                        let functionName = routerDef.method.toLowerCase();
                                        let tmpRouterDef = _.merge({}, routerDef);
                                        tmpRouterDef.apiCache = _.merge(_.merge({}, apiCache), routerOption.apiCache || {});
                                        tmpRouterDef.key = tmpRouterDef.key.replaceAll('schemaName', schemaName.toLowerCase());
                                        tmpRouterDef.controller = tmpRouterDef.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                                        tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                        tmpRouterDef.moduleName = moduleName;
                                        //console.log(tmpRouterDef.secured, ' : ', tmpRouterDef.method, ' : ', tmpRouterDef.url);
                                        eval(routers.operations[functionName](app, tmpRouterDef));
                                    }
                                });
                            }
                        });
                    }
                });
                // Register module common routers, means routers needs to be available in all modules
                if (!UTILS.isBlank(routers.common)) {
                    let commonOptions = _.merge({}, routers.common.options || {});
                    _.each(routers.common, function(group, groupName) {
                        let groupOptions = _.merge(_.merge({}, commonOptions), group.options);
                        if (groupName !== 'options') {
                            _.each(group, function(routerDef, routerName) {
                                if (routerName !== 'options') {
                                    let routerOption = _.merge(_.merge({}, groupOptions), routerDef.options || {});
                                    let functionName = routerDef.method.toLowerCase();
                                    let tmpRouterDef = _.merge({}, routerDef);
                                    tmpRouterDef.apiCache = _.merge(_.merge({}, apiCache), routerOption.apiCache || {});
                                    tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                    tmpRouterDef.moduleName = moduleName;
                                    //console.log(tmpRouterDef.secured, ' : ', tmpRouterDef.method, ' : ', tmpRouterDef.url);
                                    eval(routers.operations[functionName](app, tmpRouterDef));
                                }
                            });
                        }
                    });
                }
                // Register all module specific routers here
                if (!UTILS.isBlank(routers[moduleName])) {
                    let moduleOptions = _.merge({}, routers[moduleName].options || {});
                    _.each(routers[moduleName], function(group, groupName) {
                        let groupOptions = _.merge(_.merge({}, moduleOptions), group.options);
                        if (groupName !== 'options') {
                            _.each(group, function(routerDef, routerName) {
                                if (routerName !== 'options') {
                                    let routerOption = _.merge(_.merge({}, groupOptions), routerDef.options || {});
                                    let functionName = routerDef.method.toLowerCase();
                                    let tmpRouterDef = _.merge({}, routerDef);
                                    tmpRouterDef.apiCache = _.merge(_.merge({}, apiCache), routerOption.apiCache || {});
                                    tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                    tmpRouterDef.moduleName = moduleName;
                                    //console.log(tmpRouterDef.secured, ' : ', tmpRouterDef.method, ' : ', tmpRouterDef.url, ' : ', moduleName);
                                    eval(routers.operations[functionName](app, tmpRouterDef));
                                }
                            });
                        }
                    });
                }
            }
        });
    }
};