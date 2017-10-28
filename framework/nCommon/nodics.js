const utilsLoader = require('./bin/utilsLoader');
const enumLoader = require('./bin/enumLoader');
const classesLoader = require('./bin/classesLoader');
const moduleLoader = require('./bin/moduleLoader');

module.exports = {
    init: function() {

    },

    loadCommon: function() {
        if (!CONFIG || !SYSTEM || !NODICS) {
            console.error("   ERROR: System initialization error: configuration initializer failure.");
            process.exit(1);
        }
        utilsLoader.loadUtils();
        enumLoader.loadEnums();
        classesLoader.loadClasses();

        SYSTEM.loadModules = function() {
            moduleLoader.init();
        };
    }
};