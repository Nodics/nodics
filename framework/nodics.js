const config = require('./nConfig');
const common = require('./nCommon');
const db = require('./nDatabase');
const dao = require('./nDao');
const services = require('./nService');
const process = require('./nProcess');
const cronjob = require('./nCronJob');
const facades = require('./nFacade');
const controllers = require('./nController');
const router = require('./nRouter');

module.exports = {
    init: function(options) {
        config.init(options);
        SYSTEM.executePreScripts();
        common.init();
        db.init();
        dao.init();
        services.init();
        process.init();
        cronjob.init();
        facades.init();
        controllers.init();
        SYSTEM.loadModules();
        router.initRouters();
    },
    startServers: function() {
        SYSTEM.startServers();
    }
};