const _ = require('lodash');
const fs = require('fs');
const sys = require('./system');

module.exports = {
    loadProperties: function(fileName) {
        let _self = this;
        let config = CONFIG || {};
        let moduleIndex = config.moduleIndex;
        Object.keys(moduleIndex).forEach(function(key) {
            var value = moduleIndex[key][0];
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                console.log('   INFO: Loading configration file from : ' + filePath);
                var commonPropertyFile = require(filePath);
                config = _.merge(config, commonPropertyFile);
            }
        });
    },
    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $MODULE/common/properties.js
     */
    loadCommonProperties: function() {
        return this.loadProperties('/config/properties.js');
    },

    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/common/properties.js
     */
    loadAppCommnProperties: function() {
        let config = CONFIG || {};
        var filePath = config.SERVER_PATH + '/config/common/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },
    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadAppEnvProperties: function() {
        let config = CONFIG || {};
        var filePath = config.SERVER_PATH + '/config/env-' + config.NODICS_ENV + '/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },
    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadExternalProperties: function() {
        let config = CONFIG || {};
        if (config.externalPropertyFile && config.externalPropertyFile.length > 0) {
            config.externalPropertyFile.forEach(function(filePath) {
                if (fs.existsSync(filePath)) {
                    console.log('   INFO: Loading configration file from : ' + filePath);
                    var commonPropertyFile = require(filePath);
                    config = _.merge(config, commonPropertyFile);
                } else {
                    console.warn('   WARNING: System cant find configuration at : ' + filePath);
                }
            });
        }
    },

    loadModulesMetaData: function() {
        sys.getModulesMetaData();
    },

    setDefaultProperties: function(options) {
        let config = global.CONFIG || {};
        let nodics = global.NODICS || {};
        config.SERVER_STATE = 'starting';
        config.NODICS_HOME = options.NODICS_HOME;
        config.NODICS_ENV = options.NODICS_ENV;
        config.SERVER_PATH = options.SERVER_PATH;
        config.activeModules = options.activeModules;
        if (options.argv) {
            config.ARGV = options.argv;
        }
        config.SERVER_PATH = options.SERVER_PATH;
        nodics.modules = {};
        global.CONFIG = config;
        global.NODICS = nodics;
    },

    init: function() {
        console.log('=> Starting Configuration loader process ##');
        this.setDefaultProperties(SYSTEM.options);
        this.loadModulesMetaData();
        this.loadCommonProperties();
        this.loadAppCommnProperties();
        this.loadAppEnvProperties();
        this.loadExternalProperties();

    }
}