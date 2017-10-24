const initServers = require('./bin/initializeServers');
const serverConfig = require('./bin/loadServerConfiguration');
const registerRouter = require('./bin/registerRouter');

module.exports.initRouters = function() {
    console.log('=> Staring servers initialization process');
    initServers.init();
    serverConfig.init();
    registerRouter.init();
};