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
            console.log('   INFO: Mongoose default connection open to ' + CONFIG.database[databaseName].URI);
        });
        database.connection.on('error', function(err) {
            console.log('   INFO: Mongoose default connection error: ' + err);
        });
        database.connection.on('disconnected', function() {
            console.log('   INFO: Mongoose default connection disconnected');
        });
        return database;
    },
    createDefaultDatabase: function() {
        let dbs = NODICS.dbs || {};
        let dbConfig = SYSTEM.getDatabaseConfiguration('default');
        var connection = this.createDatabase('default');
        dbConfig.connection = connection;
        dbConfig.Schema = connection.Schema;
        dbs['default'] = dbConfig;
        return dbs;
    },
    createDatabases: function() {
        const _self = this;
        if (!SYSTEM.validateDatabaseConfiguration()) {
            process.exit(CONFIG.errorExitCode);
        }
        let modules = NODICS.modules;
        let dbs = NODICS.dbs = this.createDefaultDatabase();
        _.each(modules, (value, moduleName) => {
            if (CONFIG.database[moduleName]) {
                console.log('   INFO: Creating database for module : ', moduleName);
                let dbConfig = SYSTEM.getDatabaseConfiguration(moduleName);
                var connection = _self.createDatabase(moduleName);
                dbConfig.connection = connection;
                dbConfig.Schema = connection.Schema;
                dbs[moduleName] = dbConfig;
            } else {

            }
        });
        /*
            _.each(CONFIG.database, function(value, key) {
                console.log('++++ Running configuration for database : ' + key);
                DB[key] = value;
                var connection = _self.createDatabase(key);
                value.connection = connection;
                value.Schema = connection.Schema;
            });
        */
        //return DB;
    },
    init: function() {
        console.log("=> Starting Database creating process");
        this.createDatabases();
    }
};