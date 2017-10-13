const sys = require('./system');

module.exports.init = function() {
    console.log('##  Staring System loader process');
    let system = global.SYSTEM || {};
    sys.loadFiles(CONFIG, '/bin/system.js', system);
}