const config = require('./nConfig');
const common = require('./nCommon');
const db = require('./nDatabase');
const dao = require('./nDao');
const services = require('./nService');
const process = require('./nProcess');
const facades = require('./nFacade');
const controllers = require('./nController');
const router = require('./nRouter');
const test = require('./nTest');

module.exports = {
    init: function() {
        ////
    },

    initFrameworkExecute: function(options) {
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
        SYSTEM.executePostScripts();
    },

    startServers: function() {
        SYSTEM.startServers();
        NODICS.setServerState('started');
    },

    initTestRuner: function() {
        test.runTest();
    },

    startNodics: function(options) {
        this.initFrameworkExecute(options);
        this.startServers();
        this.initTestRuner();
    }
};