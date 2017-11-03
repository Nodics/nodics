const sys = require('./system');

module.exports.init = function() {
    console.log('=> Starting System loader process');
    sys.loadFiles('/bin/system.js', global.SYSTEM);
};