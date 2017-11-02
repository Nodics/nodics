const _ = require('lodash');
let mongoose = require('mongoose');
module.exports = {
    createConnection: function(dbConfig) {
        console.log('   INFO: Creating database connection for URI : ', dbConfig.URI);
        let connection = '';
        mongoose.Promise = global.Promise;
        if (dbConfig.options) {
            connection = mongoose.createConnection(dbConfig.URI, dbConfig.options);
        } else {
            connection = mongoose.createConnection(dbConfig.URI);
        }
        //Register all posible event
        connection.on('connected', function() {
            console.log('   INFO: Mongoose default connection open to ' + dbConfig.URI);
        });
        connection.on('error', function(error) {
            console.log('   INFO: Mongoose default connection error: ' + error);
        });
        connection.on('disconnected', function() {
            console.log('   INFO: Mongoose default connection disconnected');
        });
        return connection;
    },
    createDatabase: function(moduleName) {
        let dbConfig = SYSTEM.getDatabaseConfiguration(moduleName);
        console.log(CLASSES);
        let masterDatabase = new CLASSES.Database();
        let testDatabase = new CLASSES.Database();

        masterDatabase.setName(moduleName);
        masterDatabase.setURI(dbConfig.master.URI);
        masterDatabase.setOptions(dbConfig.master.options);
        masterDatabase.setConnection(this.createConnection(dbConfig.master));
        masterDatabase.setSchema(mongoose.Schema);
        if (dbConfig.test) {
            testDatabase.setName(moduleName);
            testDatabase.setURI(dbConfig.test.URI);
            testDatabase.setOptions(dbConfig.test.options);
            testDatabase.setConnection(this.createConnection(dbConfig.test));
            testDatabase.setSchema(mongoose.Schema);
        } else {
            let testDB = NODICS.getDatabase().test;
            if (!testDB) {
                console.error('   ERROR: Default test database configuration not found. Please velidate database configuration');
                process.exit(CONFIG.get('errorExitCode'));
            }
            testDatabase = testDB;
        }
        return {
            master: masterDatabase,
            test: testDatabase
        };
    },
    createDatabases: function() {
        const _self = this;
        if (!SYSTEM.validateDatabaseConfiguration()) {
            process.exit(CONFIG.get('errorExitCode'));
        }
        let modules = NODICS.getModules();
        //Creating default data base instance
        NODICS.addDatabase('default', this.createDatabase('default'));
        //Creating databases for all modules, if configuration available
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('database')[moduleName]) {
                console.log('   INFO: Creating database for module : ', moduleName);
                NODICS.addDatabase(moduleName, this.createDatabase(moduleName));
            } else {
                console.warn('   WARNING: None database configuration found for module : ', moduleName, '\tHence running on Default configurarion');
            }
        });
    },
    init: function() {
        console.log(" =>Starting Database creating process");
        this.createDatabases();
    }
};