const _ = require('lodash');

module.exports = {
    createDatabase: function(databaseName) {
        var database = require('mongoose');
        database.Promise = global.Promise;
        if (CONFIG.get('database')[databaseName].options) {
            database.connect(CONFIG.get('database')[databaseName].URI, CONFIG.get('database')[databaseName].options);
        } else {
            database.connect(CONFIG.get('database')[databaseName].URI);
        }
        //Register all posible event
        database.connection.on('connected', function() {
            console.log('   INFO: Mongoose default connection open to ' + CONFIG.get('database')[databaseName].URI);
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
        let dbConfig = SYSTEM.getDatabaseConfiguration('default');
        var connection = this.createDatabase('default');
        dbConfig.connection = connection;
        dbConfig.Schema = connection.Schema;
        NODICS.addDatabase('default', dbConfig);
    },
    createDatabases: function() {
        const _self = this;
        if (!SYSTEM.validateDatabaseConfiguration()) {
            process.exit(CONFIG.get('errorExitCode'));
        }
        let modules = NODICS.getModules();
        this.createDefaultDatabase();
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('database')[moduleName]) {
                console.log('   INFO: Creating database for module : ', moduleName);
                let dbConfig = SYSTEM.getDatabaseConfiguration(moduleName);
                var connection = _self.createDatabase(moduleName);
                dbConfig.connection = connection;
                dbConfig.Schema = connection.Schema;
                NODICS.addDatabase(moduleName, dbConfig);
            } else {
                console.warn('   WARNING: None database configuration found for module : ', moduleName);
            }
        });
    },
    init: function() {
        console.log("=> Starting Database creating process");
        this.createDatabases();
    }
};