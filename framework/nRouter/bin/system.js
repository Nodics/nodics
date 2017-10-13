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
        let serverName = CONFIG.server.default.httpServer;
        if (CCONFIG.server[moduleName] && ONFIG.server[moduleName].httpServer) {
            serverName = CONFIG.server[moduleName].httpServer;
        }
        return serverName;
    },
    getServerPort: function(moduleName) {
        let serverPort = CONFIG.server.default.httpPort;
        if (CONFIG.server[moduleName] && CONFIG.server[moduleName].httpPort) {
            serverPort = CONFIG.server[moduleName].httpPort;
        }
        return serverPort;
    },

    getSecureServerName: function(moduleName) {
        let serverName = CONFIG.server.default.httpsServer;
        if (CONFIG.server[moduleName] && CONFIG.server[moduleName].httpsServer) {
            serverName = CONFIG.server[moduleName].httpsServer;
        }
        return serverName;
    },
    getSecureServerPort: function(moduleName) {
        let serverPort = CONFIG.server.default.httpsPort;
        if (CONFIG.server[moduleName] && CONFIG.server[moduleName].httpsPort) {
            serverPort = CONFIG.server[moduleName].httpsPort;
        }
        return serverPort;
    }
};