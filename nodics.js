const FRAMEWORK = require('./framework');
const util = require('util');


module.exports = {
    startNodics: function(options) {
        FRAMEWORK.init(options);
        SYSTEM.executePostScripts();
        FRAMEWORK.startServers();
        CONFIG.SERVER_STATE = 'running';
        //console.log(NODICS.modules.cronjob);
        //console.log(NODICS.modules.user);
        //console.log(util.inspect(NODICS, { showHidden: false, depth: 3 }));
        //console.log('User : ', util.inspect(NODICS.modules.user.rawSchema, { showHidden: false, depth: 2 }));
    }
};