const initServers = require('./bin/initializeServers');
const serverConfig = require('./bin/loadServerConfiguration');
const registerRouter = require('./bin/registerRouter');

module.exports.initRouters = function() {
    initServers.init();
    serverConfig.init();
    registerRouter.init();
};