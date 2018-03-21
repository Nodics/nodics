/*
    Nodics - Enterprice Micro-Services Management Framework

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
        let config = CONFIG.get('server')[moduleName];
        if (!config || !config.server) {
            config = CONFIG.get('server').default.server;
        } else {
            config = CONFIG.get('server')[moduleName].server;
        }
        return config;
    },

    getClusterConfiguration: function(moduleName, clusterId) {
        let config = CONFIG.get('server')[moduleName];
        if (!config || !config.server) {
            if (CONFIG.get('server').default[clusterId]) {
                config = CONFIG.get('server').default[clusterId];
            } else {
                config = CONFIG.get('server').default.server;
            }
        } else {
            if (CONFIG.get('server')[moduleName][clusterId]) {
                config = CONFIG.get('server')[moduleName][clusterId];
            } else {
                config = CONFIG.get('server')[moduleName].server;
            }
        }
        return config;
    },

    getAbstractServerConfiguration: function(moduleName) {
        let config = CONFIG.get('server')[moduleName];
        if (!config || !config.server) {
            config = CONFIG.get('server').default.abstract;
        } else {
            config = CONFIG.get('server')[moduleName].abstract;
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



    getClusterHost: function(moduleName, clusterId) {
        return SYSTEM.getClusterConfiguration(moduleName, clusterId).httpHost;
    },

    getClusterPort: function(moduleName, clusterId) {
        return SYSTEM.getClusterConfiguration(moduleName, clusterId).httpPort;
    },
    getClusterSecuredHost: function(moduleName, clusterId) {
        return SYSTEM.getClusterConfiguration(moduleName, clusterId).httpsHost;
    },

    getClusterSecuredPort: function(moduleName, clusterId) {
        return SYSTEM.getClusterConfiguration(moduleName, clusterId).httpsPort;
    }
};