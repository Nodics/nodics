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

    getServerName: function(moduleName) {
        let serverName = CONFIG.get('server').default.httpServer;
        if (CONFIG.get('server')[moduleName] && CONFIG.get('server')[moduleName].httpServer) {
            serverName = CONFIG.get('server')[moduleName].httpServer;
        }
        return serverName;
    },
    getServerPort: function(moduleName) {
        let serverPort = CONFIG.get('server').default.httpPort;
        if (CONFIG.get('server')[moduleName] && CONFIG.get('server')[moduleName].httpPort) {
            serverPort = CONFIG.get('server')[moduleName].httpPort;
        }
        return serverPort;
    },

    getSecureServerName: function(moduleName) {
        let serverName = CONFIG.get('server').default.httpsServer;
        if (CONFIG.get('server')[moduleName] && CONFIG.get('server')[moduleName].httpsServer) {
            serverName = CONFIG.get('server')[moduleName].httpsServer;
        }
        return serverName;
    },
    getSecureServerPort: function(moduleName) {
        let serverPort = CONFIG.get('server').default.httpsPort;
        if (CONFIG.get('server')[moduleName] && CONFIG.get('server')[moduleName].httpsPort) {
            serverPort = CONFIG.get('server')[moduleName].httpsPort;
        }
        return serverPort;
    }
};