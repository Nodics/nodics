const daoGenerator = require('./bin/daoGenerator');

module.exports.init = function() {
    console.log('## Starting Dao generation process.');
    daoGenerator.init();
};