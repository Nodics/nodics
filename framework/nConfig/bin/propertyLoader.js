const _ = require('lodash');
const fs = require('fs');
const sys = require('./system');


module.exports = {
    loadProperties: function(fileName) {
        let _self = this;
        let config = CONFIG.getProperties();
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
        let config = CONFIG.getProperties();
        var filePath = NODICS.getServerHome() + '/config/common/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },

    loadAppCommnTanentProperties: function() {
        let config = CONFIG.getProperties();
        if (config.activeTanent && config.activeTanent !== 'default') {
            var filePath = NODICS.getServerHome() + '/config/common/' + config.activeTanent + '-properties.js';
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
    loadAppEnvProperties: function() {
        let config = CONFIG.getProperties();
        var filePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },

    loadAppEnvTanentProperties: function() {
        let config = CONFIG.getProperties();
        if (config.activeTanent && config.activeTanent !== 'default') {
            var filePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/' + config.activeTanent + '-properties.js';
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
    loadExternalProperties: function() {
        let config = CONFIG.getProperties();
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
        process.stdout.write('   INFO: Modules : ');
        _.each(CONFIG.get('moduleIndex'), (obj, key) => {
            process.stdout.write(obj[0].name + ',');
        });
        console.log('');
    },

    loadTanentConfiguration: function() {
        let config = CONFIG.getProperties();
        var filePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            config = _.merge(config, commonPropertyFile);
        }
    },

    init: function() {
        console.log('=> Starting Configuration loader process ##');
        this.loadModulesMetaData();
        this.loadCommonProperties();
        this.loadAppCommnProperties();
        this.loadAppCommnTanentProperties();
        this.loadAppEnvProperties();
        this.loadAppEnvTanentProperties();
        this.loadExternalProperties();
    }
};