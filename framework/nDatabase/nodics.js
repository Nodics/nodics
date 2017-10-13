const databaseLoader = require('./bin/databaseLoader');
const schemaLoader = require('./bin/schemaLoader');

module.exports.init = function() {
    console.log('##  Starting database configuration process');
    databaseLoader.init();
    schemaLoader.init();
};