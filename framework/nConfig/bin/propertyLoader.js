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
                sys.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                var commonPropertyFile = require(filePath);
                config = _.merge(config, commonPropertyFile);
            }
        });
    },

    loadModulesMetaData: function() {
        sys.getModulesMetaData();
        let modules = '';
        _.each(CONFIG.get('moduleIndex'), (obj, key) => {
            modules = modules + obj[0].name + ',';
        });
        sys.LOG.info('Modules:');
        console.log(modules);
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
                    sys.LOG.debug('Loading configration file from : ', appTenantPropPath.replace(NODICS.getNodicsHome(), '.'));
                    mergedProperties = _.merge(mergedProperties, require(appTenantPropPath));
                }
                if (fs.existsSync(evnTenantPropPath)) {
                    sys.LOG.debug('Loading configration file from : ', evnTenantPropPath.replace(NODICS.getNodicsHome(), '.'));
                    mergedProperties = _.merge(mergedProperties, require(evnTenantPropPath));
                }
                if (fs.existsSync(serverTenantPropPath)) {
                    sys.LOG.debug('Loading configration file from : ', serverTenantPropPath.replace(NODICS.getNodicsHome(), '.'));
                    mergedProperties = _.merge(mergedProperties, require(serverTenantPropPath));
                }
                if (!mergedProperties.database) {
                    sys.LOG.error('Define database configuration for tenant : ', tntName);
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
                    sys.LOG.debug('Loading configration file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    var commonPropertyFile = require(filePath);
                    CONFIG.get('installedTanents').forEach(function(tntName) {
                        let tntConfig = CONFIG.getProperties(tntName);
                        tntConfig = _.merge(tntConfig, commonPropertyFile);
                    });
                } else {
                    sys.LOG.warn('System cant find configuration at : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                }
            });
        }
    },

    init: function() {
        sys.LOG.info('Starting Configuration loader process ##');
        this.loadModulesMetaData();
        this.loadCommonProperties();
        this.loadTanentConfiguration();
        this.loadExternalProperties();
    }
};