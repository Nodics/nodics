/*
    Nodics - Enterprice Micro-Services Management Framework

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

    loadTanentConfiguration: function() {
        let _self = this;
        let appHome = NODICS.getNodicsHome() + '/' + NODICS.getActiveApplication();
        let envHome = appHome + '/' + NODICS.getActiveEnvironment();
        CONFIG.get('installedTanents').forEach(function(tntName) {
            if (tntName && tntName !== 'default') {
                let tntConfig = _.merge({}, CONFIG.getProperties());
                let mergedProperties = {};
                let appTenantPropPath = appHome + '/config/' + tntName + '-properties.js';
                let evnTenantPropPath = envHome + '/config/' + tntName + '-properties.js';
                let serverTenantPropPath = NODICS.getServerHome() + '/config/' + tntName + '-properties.js';
                if (fs.existsSync(appTenantPropPath)) {
                    console.log('   INFO: Loading configration file from : ', appTenantPropPath);
                    mergedProperties = _.merge(mergedProperties, require(appTenantPropPath));
                }
                if (fs.existsSync(evnTenantPropPath)) {
                    console.log('   INFO: Loading configration file from : ', evnTenantPropPath);
                    mergedProperties = _.merge(mergedProperties, require(evnTenantPropPath));
                }
                if (fs.existsSync(serverTenantPropPath)) {
                    console.log('   INFO: Loading configration file from : ', serverTenantPropPath);
                    mergedProperties = _.merge(mergedProperties, require(serverTenantPropPath));
                }
                if (!mergedProperties.database) {
                    console.log('   ERROR: define database configuration for tenant : ', tntName);
                    process.exit(1);
                }
                tntConfig = _.merge(tntConfig, mergedProperties);

                CONFIG.setProperties(tntConfig, tntName);
            }
        });
    },

    /*
     * This function is used to loop through all module (Nodics and Server), and based on thier priority and active state,
     * will load properties from $APP_MODULE/config/env-{NODICS_ENV}/properties.js
     */
    loadExternalProperties: function() {
        if (CONFIG.get('externalPropertyFile') && CONFIG.get('externalPropertyFile').length > 0) {
            CONFIG.get('externalPropertyFile').forEach(function(filePath) {
                if (fs.existsSync(filePath)) {
                    console.log('   INFO: Loading configration file from : ' + filePath);
                    var commonPropertyFile = require(filePath);
                    CONFIG.get('installedTanents').forEach(function(tntName) {
                        let tntConfig = CONFIG.getProperties(tntName);
                        tntConfig = _.merge(tntConfig, commonPropertyFile);
                    });
                } else {
                    console.warn('   WARNING: System cant find configuration at : ' + filePath);
                }
            });
        }
    },

    init: function() {
        console.log('=> Starting Configuration loader process ##');
        this.loadModulesMetaData();
        this.loadCommonProperties();
        this.loadTanentConfiguration();
        this.loadExternalProperties();
    }
};