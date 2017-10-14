var FRAMEWORK = require('./framework');

var startNodics = function(options) {
    FRAMEWORK.init(options);
    SYSTEM.executePostScripts();
    FRAMEWORK.startServers();
    CONFIG.SERVER_STATE = 'running';
};

module.exports.start = function(options) {
    startNodics(options);

};
//TODO - needs to be re-visited
module.exports = (function() {
    startNodics();
})();