var FRAMEWORK = require('./framework');

module.exports = {
    startNodics: function(options) {
        FRAMEWORK.init(options);
        SYSTEM.executePostScripts();
        FRAMEWORK.startServers();
        CONFIG.SERVER_STATE = 'running';
    }
};