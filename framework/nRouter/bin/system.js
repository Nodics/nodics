/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
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

    getServerConfiguration: function(moduleName) {
        let moduleServerConfiguration = CONFIG.get('server')[moduleName];
        if (!moduleServerConfiguration || CONFIG.get('server').runAsSingleModule) {
            moduleServerConfiguration = CONFIG.get('server').default;
        }
        return moduleServerConfiguration;
    },

    getHost: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).server.httpHost;
    },
    getPort: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).server.httpPort;
    },

    getSecuredHost: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).server.httpsHost;
    },
    getSecuredPort: function(moduleName) {
        return SYSTEM.getServerConfiguration(moduleName).server.httpsPort;
    },

    getAbstractHost: function(moduleName) {
        let moduleServerConfiguration = SYSTEM.getServerConfiguration(moduleName);

        if (UTILS.isBlank(moduleServerConfiguration.abstractServer)) {
            moduleServerConfiguration = moduleServerConfiguration.server;
        } else {
            moduleServerConfiguration = moduleServerConfiguration.abstractServer;
        }
        return moduleServerConfiguration.httpHost;
    },

    getAbstractPort: function(moduleName) {
        let moduleServerConfiguration = SYSTEM.getServerConfiguration(moduleName);

        if (UTILS.isBlank(moduleServerConfiguration.abstractServer)) {
            moduleServerConfiguration = moduleServerConfiguration.server;
        } else {
            moduleServerConfiguration = moduleServerConfiguration.abstractServer;
        }
        return moduleServerConfiguration.httpPort;
    },
    getAbstractSecuredHost: function(moduleName) {
        let moduleServerConfiguration = SYSTEM.getServerConfiguration(moduleName);

        if (UTILS.isBlank(moduleServerConfiguration.abstractServer)) {
            moduleServerConfiguration = moduleServerConfiguration.server;
        } else {
            moduleServerConfiguration = moduleServerConfiguration.abstractServer;
        }
        return moduleServerConfiguration.httpsHost;
    },

    getAbstractSecuredPort: function(moduleName) {
        let moduleServerConfiguration = SYSTEM.getServerConfiguration(moduleName);

        if (UTILS.isBlank(moduleServerConfiguration.abstractServer)) {
            moduleServerConfiguration = moduleServerConfiguration.server;
        } else {
            moduleServerConfiguration = moduleServerConfiguration.abstractServer;
        }
        return moduleServerConfiguration.httpsPort;
    }
};