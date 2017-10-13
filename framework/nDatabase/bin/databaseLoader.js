const _ = require('lodash');

module.exports = {
    createDatabase: function(databaseName) {
        var database = require('mongoose');
        database.Promise = global.Promise;
        if (CONFIG.database[databaseName].options) {
            database.connect(CONFIG.database[databaseName].URI, CONFIG.database[databaseName].options);
        } else {
            database.connect(CONFIG.database[databaseName].URI);
        }
        //Register all posible event
        database.connection.on('connected', function() {
            console.log('Mongoose default connection open to ' + CONFIG.database[databaseName].URI);
        });
        database.connection.on('error', function(err) {
            console.log('Mongoose default connection error: ' + err);
        });
        database.connection.on('disconnected', function() {
            console.log('Mongoose default connection disconnected');
        });
        return database;
    },
    createDatabases: function() {
        const _self = this;
        if (!SYSTEM.validateDatabaseConfiguration()) {
            process.exit(CONFIG.errorExitCode);
        }
        var DB = {};
        _.each(CONFIG.database, function(value, key) {
            console.log('++++ Running configuration for database : ' + key);
            DB[key] = value;
            var connection = _self.createDatabase(key);
            value.connection = connection;
            value.Schema = connection.Schema;
        });
        return DB;
    },
    init: function() {
        global.DB = this.createDatabases();
    }
}