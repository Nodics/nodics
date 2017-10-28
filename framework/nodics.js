const config = require('./nConfig');
const common = require('./nCommon');
const db = require('./nDatabase');
const dao = require('./nDao');
const services = require('./nService');
const process = require('./nProcess');
const facades = require('./nFacade');
const controllers = require('./nController');
const router = require('./nRouter');

module.exports = {
    init: function() {
        //Application code goes here
    },

    loadFramework: function(options) {
        config.loadConfig(options);
        SYSTEM.executePreScripts();
        common.loadCommon();
        db.loadDatabase();
        dao.loadDao();
        services.loadService();
        process.loadProcess();
        facades.loadFacade();
        controllers.loadController();
        SYSTEM.loadModules();
        router.loadRouter();
    },
    startServers: function() {
        SYSTEM.startServers();
    }
};