const propertyLoader = require('./bin/propertyLoader');
const systemLoader = require('./bin/systemLoader');
const scriptLoader = require('./bin/scriptLoader');
const sys = require('./bin/system');

module.exports = {
    init: function() {

    },

    loadConfig: function(options) {
        let system = global.SYSTEM = {};
        system['options'] = sys.prepareOptions(options);
        if (!SYSTEM.options) {
            console.error("    ERROR: System initialization error: options cann't be null or empty");
            process.exit(1);
        }
        console.log('=>Initializing Nodics, Node based enterprise application solution   ###');
        console.log('---------------------------------------------------------------------------');
        console.log('SERVER_PATH : ', SYSTEM.options.SERVER_PATH);
        console.log('NODICS_HOME : ', SYSTEM.options.NODICS_HOME);
        console.log('NODICS_ENV  : ', SYSTEM.options.NODICS_ENV);
        console.log('---------------------------------------------------------------------------');
        propertyLoader.init();
        systemLoader.init();

        SYSTEM.executePreScripts = function() {
            scriptLoader.executePreScripts();
        };
        SYSTEM.executePostScripts = function() {
            scriptLoader.executePostScripts();
        };
    }
};