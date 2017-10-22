const FRAMEWORK = require('./framework');
const util = require('util');


module.exports = {
    startNodics: function(options) {
        FRAMEWORK.init(options);
        SYSTEM.executePostScripts();
        FRAMEWORK.startServers();
        CONFIG.SERVER_STATE = 'running';

        console.log(util.inspect(DB, { showHidden: false, depth: 4 }));
    }
};