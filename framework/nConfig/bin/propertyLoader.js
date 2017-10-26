const _ = require('lodash');
const fs = require('fs');
const sys = require('./system');
let Config = require('./config');
let Nodics = require('./nodics');

module.exports = {
    loadProperties: function(properties, fileName) {
        let _self = this;
        let config = properties || CONFIG.getProperties();
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
    loadCommonProperties: function(properties) {
        return this.loadProperties(properties, '/config/properties.js');
    },

    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/common/properties.js
     */
    loadAppCommnProperties: function(properties) {
        let config = properties || CONFIG.getProperties();
        var filePath = config.SERVER_PATH + '/config/common/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },

    loadAppCommnTanentProperties: function(properties) {
        let config = properties || CONFIG.getProperties();
        if (config.activeTanent && config.activeTanent !== 'default') {
            var filePath = config.SERVER_PATH + '/config/common/' + config.activeTanent + '-properties.js';
            if (fs.existsSync(filePath)) {
                console.log('   INFO: Loading configration file from : ' + filePath);
                var commonPropertyFile = require(filePath);
                config = _.merge(config, commonPropertyFile);
            }
        }
    },
    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadAppEnvProperties: function(properties) {
        let config = properties || CONFIG.getProperties();
        var filePath = config.SERVER_PATH + '/config/env-' + config.NODICS_ENV + '/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },

    loadAppEnvTanentProperties: function(properties) {
        let config = properties || CONFIG.getProperties();
        if (config.activeTanent && config.activeTanent !== 'default') {
            var filePath = config.SERVER_PATH + '/config/env-' + config.NODICS_ENV + '/' + config.activeTanent + '-properties.js';
            if (fs.existsSync(filePath)) {
                console.log('   INFO: Loading configration file from : ' + filePath);
                var commonPropertyFile = require(filePath);
                config = _.merge(config, commonPropertyFile);
            }
        }
    },
    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadExternalProperties: function(properties) {
        let config = properties || CONFIG.getProperties();
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

    loadModulesMetaData: function(properties) {
        sys.getModulesMetaData(properties);
    },

    setDefaultProperties: function(options) {
        global.CONFIG = new Config();
        global.NODICS = new Nodics();
        global.SYSTEM = {};
        let properties = {};
        properties.NODICS_HOME = options.NODICS_HOME;
        properties.NODICS_ENV = options.NODICS_ENV;
        properties.SERVER_PATH = options.SERVER_PATH;
        properties.activeModules = options.activeModules;
        if (options.argv) {
            properties.ARGV = options.argv;
        }
        properties.SERVER_PATH = options.SERVER_PATH;
        return properties;
    },

    loadTanentConfiguration: function(properties) {
        let config = properties || CONFIG.getProperties();
        var filePath = config.SERVER_PATH + '/config/env-' + config.NODICS_ENV + '/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },

    init: function() {
        console.log('=> Starting Configuration loader process ##');
        let properties = this.setDefaultProperties(SYSTEM.options);
        this.loadModulesMetaData(properties);
        this.loadCommonProperties(properties);
        this.loadAppCommnProperties(properties);
        this.loadAppCommnTanentProperties(properties);
        this.loadAppEnvProperties(properties);
        this.loadAppEnvTanentProperties(properties);
        this.loadExternalProperties(properties);
        CONFIG.setProperties(properties);
    }
};