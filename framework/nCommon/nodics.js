const utilsLoader = require('./bin/utilsLoader');
const enumLoader = require('./bin/enumLoader');
const classesLoader = require('./bin/classesLoader');
const moduleLoader = require('./bin/moduleLoader');

module.exports = {
    init: function() {
        if (!CONFIG || !SYSTEM) {
            console.error("   ERROR: System initialization error: configuration initializer failure.");
            process.exit(1);
        }
        utilsLoader.loadUtils();
        enumLoader.loadEnums();
        classesLoader.loadClasses();

        SYSTEM['loadModules'] = this.loadModules;
    },

    loadModules: function() {
        moduleLoader.init();
    }
};