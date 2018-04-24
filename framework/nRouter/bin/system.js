/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    serversConfigPool: '',

    executeRouterConfig: function(app, scripts) {
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

    prepareModulesConfiguration: function() {
        let _self = this;
        SYSTEM.performAsync(() => {
            _self.serversConfigPool = new CLASSES.ModulesConfigurationContainer();
            _self.serversConfigPool.prepareModulesConfiguration();
        });
    },

    getModuleServerConfig: function(moduleName) {
        if (this.serversConfigPool.getModule(moduleName)) {
            let moduleConfig = this.serversConfigPool.getModule(moduleName);
            if (moduleConfig.getOptions() && moduleConfig.getOptions().connectToDefault) {
                moduleConfig = this.serversConfigPool.getModule('default');
            }
            return moduleConfig;
        } else {
            throw new Error('Invalid module name : ' + moduleName + ' Please re-validate');
        }
    },

    getURL: function(nodeConfig, secured) {
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

    prepareUrl: function(options) {
        let url = '';
        try {
            let moduleConfig = this.getModuleServerConfig(options.moduleName);
            let contextRoot = moduleConfig.getOptions().contextRoot || CONFIG.get('server').options.contextRoot;
            if (options.connectionType === 'node') {
                if (!options.nodeId) {
                    options.nodeId = '0';
                }
                url = this.getURL(moduleConfig.getNode(options.nodeId));
            } else {
                url = this.getURL(moduleConfig.getAbstractServer());
            }
            url += '/' + contextRoot + '/' + options.moduleName;
        } catch (error) {
            this.LOG.error('While Preparing URL for :', options.moduleName, ' : ', error);
        }
        return url;
    },

    /*
    getServerConfiguration: function(moduleName) {
        let config = CONFIG.get('server')[moduleName];
        if (config && config.server) {
            config = config.server;
        } else {
            config = CONFIG.get('server').default.server;
        }
        return config;
    },

    getAbstractServerConfiguration: function(moduleName) {
        let config = CONFIG.get('server')[moduleName];
        if (config && config.abstract) {
            config = config.abstract;
        } else {
            config = this.getServerConfiguration(moduleName);
        }
        return config;
    },

    getNodeConfiguration: function(moduleName, nodeId) {
        let config = CONFIG.get('server')[moduleName];
        if (config && config.nodes && config.nodes[nodeId]) {
            config = config.nodes[nodeId];
        } else {
            config = this.getAbstractServerConfiguration(moduleName);
        }
        return config;
    },

    getHost: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).httpHost;
    },
    getPort: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).httpPort;
    },

    getSecuredHost: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).httpsHost;
    },
    getSecuredPort: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).httpsPort;
    },

    getAbstractHost: function(moduleName) {
        return SYSTEM.getAbstractServerConfiguration(moduleName).httpHost;
    },

    getAbstractPort: function(moduleName) {
        return SYSTEM.getAbstractServerConfiguration(moduleName).httpPort;
    },
    getAbstractSecuredHost: function(moduleName) {
        return SYSTEM.getAbstractServerConfiguration(moduleName).httpsHost;
    },

    getAbstractSecuredPort: function(moduleName) {
        return SYSTEM.getAbstractServerConfiguration(moduleName).httpsPort;
    },



    getNodeHost: function(moduleName, nodeId) {
        return SYSTEM.getClusterConfiguration(moduleName, nodeId).httpHost;
    },

    getNodePort: function(moduleName, nodeId) {
        return SYSTEM.getClusterConfiguration(moduleName, nodeId).httpPort;
    },
    getNodeSecuredHost: function(moduleName, nodeId) {
        return SYSTEM.getClusterConfiguration(moduleName, nodeId).httpsHost;
    },

    getNodeSecuredPort: function(moduleName, nodeId) {
        return SYSTEM.getClusterConfiguration(moduleName, nodeId).httpsPort;
    }*/
};