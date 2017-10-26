const sys = require('./system');

module.exports.init = function() {
    console.log('=> Starting System loader process');
    let system = global.SYSTEM || {};
    sys.loadFiles(CONFIG.getProperties(), '/bin/system.js', system);
};