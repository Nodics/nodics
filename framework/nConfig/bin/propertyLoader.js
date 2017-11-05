/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    loadModulesMetaData: function() {
        sys.getModulesMetaData();
        process.stdout.write('   INFO: Modules : ');
        _.each(CONFIG.get('moduleIndex'), (obj, key) => {
            process.stdout.write(obj[0].name + ',');
        });
        console.log('');
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

    loadAppCommnTanentProperties: function(tntConfig, tntName) {
        var filePath = NODICS.getServerHome() + '/config/common/' + tntName + '-properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            tntConfig = _.merge(tntConfig, commonPropertyFile);
        } else {
            console.log('   ERROR: configuration file for tenant : ', tntName, ' not found at : ', filePath);
            process.exit(1);
        }
        return tntConfig;
    },

    loadAppEnvTanentProperties: function(tntConfig, tntName) {

        var filePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/' + tntName + '-properties.js';
        if (fs.existsSync(filePath)) {
            console.log('   INFO: Loading configration file from : ' + filePath);
            var commonPropertyFile = require(filePath);
            tntConfig = _.merge(tntConfig, commonPropertyFile);
        }
        return tntConfig;
    },

    loadTanentConfiguration: function() {
        let _self = this;
        CONFIG.get('activeTanents').forEach(function(tntName) {
            if (tntName && tntName !== 'default') {
                let tntConfig = _.merge({}, CONFIG.getProperties());
                tntConfig = _self.loadAppCommnTanentProperties(tntConfig, tntName);
                tntConfig = _self.loadAppEnvTanentProperties(tntConfig, tntName);
                CONFIG.setProperties(tntConfig, tntName);
            }
        });
    },
    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadExternalProperties: function() {
        CONFIG.get('activeTanents').forEach(function(tntName) {
            if (tntName && tntName !== 'default') {
                let tntConfig = CONFIG.getProperties(tntName);
                if (CONFIG.get('externalPropertyFile') && CONFIG.get('externalPropertyFile').length > 0) {
                    CONFIG.get('externalPropertyFile').forEach(function(filePath) {
                        if (fs.existsSync(filePath)) {
                            console.log('   INFO: Loading configration file from : ' + filePath);
                            var commonPropertyFile = require(filePath);
                            config = _.merge(config, commonPropertyFile);
                        } else {
                            console.warn('   WARNING: System cant find configuration at : ' + filePath);
                        }
                    });
                }
            }
        });
    },

    init: function() {
        console.log('=> Starting Configuration loader process ##');
        this.loadModulesMetaData();
        this.loadCommonProperties();
        this.loadAppCommnProperties();
        this.loadAppEnvProperties();
        this.loadTanentConfiguration();
        this.loadExternalProperties();
    }
};