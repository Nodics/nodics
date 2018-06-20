/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    serversConfigPool: '',

    executeRouterConfig: function (app, scripts) {
        if (scripts.initProperties && typeof scripts.initProperties === "function") {
            scripts.initProperties(app);
        }
        if (scripts.initSession && typeof scripts.initSession === "function") {
            scripts.initSession(app);
        }
        if (scripts.initLogger && typeof scripts.initLogger === "function") {
            scripts.initLogger(app);
        }
        if (scripts.initCache && typeof scripts.initCache === "function") {
            scripts.initCache(app);
        }
        if (scripts.initBodyParser && typeof scripts.initBodyParser === "function") {
            scripts.initBodyParser(app);
        }
        if (scripts.initHeaders && typeof scripts.initHeaders === "function") {
            scripts.initHeaders(app);
        }
        if (scripts.initErrorRoutes && typeof scripts.initErrorRoutes === "function") {
            scripts.initErrorRoutes(app);
        }
        if (scripts.initExtras && typeof scripts.initExtras === "function") {
            scripts.initExtras(app);
        }
    },

    prepareModulesConfiguration: function () {
        let _self = this;
        SYSTEM.performAsync(() => {
            _self.serversConfigPool = new CLASSES.ModulesConfigurationContainer();
            _self.serversConfigPool.prepareModulesConfiguration();
        });
    },

    getModulesPool: function () {
        return this.serversConfigPool;
    },

    getModuleServerConfig: function (moduleName) {
        if (this.serversConfigPool.isAvailableModuleConfig(moduleName)) {
            let moduleConfig = this.serversConfigPool.getModule(moduleName);
            if (moduleConfig.getOptions() && moduleConfig.getOptions().connectToDefault) {
                moduleConfig = this.serversConfigPool.getModule('default');
            }
            return moduleConfig;
        } else {
            return this.serversConfigPool.getModule('default');
        }
    },

    getURL: function (nodeConfig, secured) {
        if (secured) {
            return 'https://' +
                nodeConfig.getHttpHost() +
                ':' +
                nodeConfig.getHttpPort();
        } else {
            return 'http://' +
                nodeConfig.getHttpHost() +
                ':' +
                nodeConfig.getHttpPort();
        }
    },

    prepareUrl: function (options) {
        let url = '';
        try {
            let moduleConfig = this.getModuleServerConfig(options.moduleName);
            let contextRoot = moduleConfig.getOptions().contextRoot || CONFIG.get('server').options.contextRoot;
            if (options.nodeId && options.nodeId > 0) {
                if (moduleConfig.getNode(options.nodeId)) {
                    url = this.getURL(moduleConfig.getNode(options.nodeId));
                } else {
                    this.LOG.error('Invalid node id : ' + options.nodeId + ' while preparing URL for module : ' + options.moduleName);
                }
            } else {
                url = this.getURL(moduleConfig.getAbstractServer());
            }
            url += '/' + contextRoot + '/' + options.moduleName;
        } catch (error) {
            this.LOG.error('While Preparing URL for :', options.moduleName, ' : ', error);
        }
        return url;
    }
};